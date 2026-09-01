use std::time::Duration;

use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_sql::{DbInstances, DbPool};

use crate::DB_URL;

/// How often the scheduler wakes up. Deadlines have minute precision, so
/// checking more often than this would only burn cycles.
const TICK: Duration = Duration::from_secs(60);

/// One of the Windows toast sounds ("Default", "IM", "Mail", "Reminder",
/// "SMS"). Anything unrecognised is dropped and the toast goes back to silent.
const SOUND: &str = "Reminder";

/// Deadlines are stored as ISO-8601 UTC, so the 'localtime' modifier is what
/// turns one into the wall-clock time the notification should quote.
const SELECT_DUE: &str = "
    SELECT t.id,
           t.title,
           strftime('%d.%m %H:%M', t.deadline, 'localtime'),
           s.name
    FROM tasks t
    JOIN subjects s ON s.id = t.subject_id
    WHERE t.status = 'pending'
      AND t.notified_at IS NULL
      AND t.deadline <= strftime('%Y-%m-%dT%H:%M:%SZ', 'now',
                                 '+' || s.reminder_lead_minutes || ' minutes')
    ORDER BY t.deadline
";

/// id, title, deadline formatted for display, subject name.
type DueTask = (i64, String, String, String);

pub fn spawn<R: Runtime>(app: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let mut ticker = tokio::time::interval(TICK);
        loop {
            ticker.tick().await;
            if let Err(e) = check_once(&app).await {
                // A failed tick must not kill the loop: the next one may work.
                eprintln!("reminder check failed: {e}");
            }
        }
    });
}

async fn check_once<R: Runtime>(app: &AppHandle<R>) -> Result<(), sqlx::Error> {
    // state() hands back a State wrapper whose own field is private; inner()
    // unwraps it to the DbInstances, whose .0 is the public RwLock.
    let instances = app.state::<DbInstances>();
    let pools = instances.inner().0.read().await;
    // DbPool's accessor methods are commented out in the plugin, so match the
    // public enum variant directly. The pool is preloaded at startup, but stay
    // defensive: if it is missing there is simply nothing to check yet.
    let Some(DbPool::Sqlite(pool)) = pools.get(DB_URL) else {
        #[cfg(debug_assertions)]
        eprintln!("reminders: pool {DB_URL} not loaded");
        return Ok(());
    };

    let (enabled,): (i64,) =
        sqlx::query_as("SELECT os_notifications_enabled FROM settings WHERE id = 1")
            .fetch_one(pool)
            .await?;

    if enabled == 0 {
        return Ok(());
    }

    // notified_at IS NULL is what keeps a task from being announced on every
    // tick — it is set below, once the notification has actually been shown.
    // The lead time now comes from each subject row, so nothing is bound here.
    let due: Vec<DueTask> = sqlx::query_as(SELECT_DUE).fetch_all(pool).await?;

    #[cfg(debug_assertions)]
    if !due.is_empty() {
        eprintln!("reminders: {} task(s) due", due.len());
    }

    for (id, title, deadline, subject) in due {
        let shown = app
            .notification()
            .builder()
            .title(format!("{subject}: {title}"))
            .body(format!("Дедлайн {deadline}"))
            // Without an explicit sound the toast is marked silent, so this is
            // what makes it audible rather than merely turning volume up.
            .sound(SOUND)
            .show();

        // Only mark it sent if the notification really went out, so a failure
        // is retried on the next tick instead of being silently swallowed.
        match shown {
            Ok(()) => {
                sqlx::query(
                    "UPDATE tasks
                     SET notified_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
                     WHERE id = ?1",
                )
                .bind(id)
                .execute(pool)
                .await?;
            }
            Err(e) => eprintln!("notification failed for task {id}: {e}"),
        }
    }

    Ok(())
}
