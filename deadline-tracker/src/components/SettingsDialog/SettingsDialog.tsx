import "./SettingsDialog.css";
import type { UseSettings } from "../../hooks/useSettings";

type Props = UseSettings & { onClose: () => void };

export function SettingsDialog({
  settings,
  autostart,
  update,
  setAutostart,
  onClose,
}: Props) {
  if (!settings) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      {/* Clicks inside must not reach the backdrop's close handler. */}
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Налаштування"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog-title">Налаштування</h2>

        <label className="dialog-row">
          <input
            type="checkbox"
            checked={settings.os_notifications_enabled === 1}
            onChange={(e) =>
              update({
                os_notifications_enabled: e.currentTarget.checked ? 1 : 0,
              })
            }
          />
          Сповіщення про дедлайни
        </label>

        <label className="dialog-row">
          <input
            type="checkbox"
            checked={autostart}
            onChange={(e) => setAutostart(e.currentTarget.checked)}
          />
          Запускати разом із системою
        </label>

        <p className="dialog-note">
          Час нагадування задається окремо для кожного предмета — у меню
          «⋯» на його картці.
        </p>

        <button type="button" className="dialog-close" onClick={onClose}>
          Готово
        </button>
      </div>
    </div>
  );
}
