import "./Settings.css";
import type { UseSettings } from "../../hooks/useSettings";

export function Settings({
  settings,
  autostart,
  update,
  setAutostart,
}: UseSettings) {
  if (!settings) return null;

  return (
    <section className="settings">
      <h2 className="settings-title">Налаштування</h2>

      <label className="settings-row">
        <input
          type="checkbox"
          checked={settings.os_notifications_enabled === 1}
          onChange={(e) =>
            update({ os_notifications_enabled: e.currentTarget.checked ? 1 : 0 })
          }
        />
        Сповіщення
      </label>

      <label className="settings-row">
        <input
          type="checkbox"
          checked={autostart}
          onChange={(e) => setAutostart(e.currentTarget.checked)}
        />
        Запуск разом із системою
      </label>

      <label className="settings-row">
        Нагадувати за
        <input
          type="number"
          className="settings-number"
          min={1}
          max={10080}
          value={settings.reminder_lead_minutes}
          onChange={(e) => {
            const value = Number(e.currentTarget.value);
            // An empty or nonsense input would otherwise write NaN into a
            // NOT NULL column and break the scheduler's query.
            if (Number.isFinite(value) && value >= 1) {
              update({ reminder_lead_minutes: Math.round(value) });
            }
          }}
        />
        хв
      </label>
    </section>
  );
}
