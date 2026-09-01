mod reminders;
mod tray;

use tauri::WindowEvent;
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_sql::{Migration, MigrationKind};

/// Must match the connection string passed to `Database.load` on the frontend
/// and the preload entry in tauri.conf.json.
pub const DB_URL: &str = "sqlite:lastcall.db";

// Migrations are append-only: once a version has shipped it must never be
// edited, only followed by a new one with a higher version.
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "initial schema",
            sql: include_str!("../migrations/001_initial.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "reminder bookkeeping",
            sql: include_str!("../migrations/002_reminders.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            tray::setup(app)?;
            reminders::spawn(app.handle().clone());
            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing the window hides it instead of quitting, so reminders
            // keep firing from the tray.
            if let WindowEvent::CloseRequested { api, .. } = event {
                if !tray::is_quitting() {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
