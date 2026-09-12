import { useState } from 'react';
import { useAdminConfigStore, type AdminSkillToggle } from '@/store/adminConfigStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { RotateCcw, Download, Upload, Trash2 } from 'lucide-react';

const RATE_FIELDS: {
  key: 'goldMultiplier' | 'sellPriceMultiplier';
  label: string;
  hint: string;
  step: number;
  min: number;
  max: number;
}[] = [
  { key: 'goldMultiplier', label: 'Золото глобально', hint: 'Базовый множитель GP. Бой дополнительно умножается на свой рейт ниже.', step: 0.05, min: 0, max: 20 },
  { key: 'sellPriceMultiplier', label: 'Цены продажи', hint: 'Множитель цены продажи всех продаваемых предметов.', step: 0.05, min: 0, max: 20 },
];

const COMBAT_RATE_FIELDS: {
  key: 'combatXpMultiplier' | 'combatDropRateMultiplier' | 'combatGoldMultiplier' | 'combatPaceMultiplier';
  label: string;
  hint: string;
  step: number;
  min: number;
  max: number;
}[] = [
  { key: 'combatXpMultiplier', label: 'Опыт боя', hint: 'Живой множитель XP за победы. 1 — hard-idle база из balance/combat.ts.', step: 0.05, min: 0, max: 20 },
  { key: 'combatDropRateMultiplier', label: 'Дроп боя', hint: 'Дополнительный множитель шанса дропа только для монстров.', step: 0.05, min: 0, max: 20 },
  { key: 'combatGoldMultiplier', label: 'Золото боя', hint: 'Дополнительный множитель монет только для монстров.', step: 0.05, min: 0, max: 20 },
  { key: 'combatPaceMultiplier', label: 'Темп боя', hint: '0.5 медленнее, 1 баланс, 2 быстрее. Меняется без перезапуска.', step: 0.05, min: 0.25, max: 3 },
];

const COMBAT_TOGGLE: { key: AdminSkillToggle; label: string; icon: string }[] = [
  { key: 'combat', label: 'Бой', icon: '⚔️' },
];

export function AdminSettingsPanel() {
  const rates = useAdminConfigStore(s => s.gameRates);
  const toggles = useAdminConfigStore(s => s.contentToggles);
  const setGameRate = useAdminConfigStore(s => s.setGameRate);
  const resetGameRates = useAdminConfigStore(s => s.resetGameRates);
  const setContentToggle = useAdminConfigStore(s => s.setContentToggle);
  const resetContentToggles = useAdminConfigStore(s => s.resetContentToggles);
  const exportConfig = useAdminConfigStore(s => s.exportConfig);
  const importConfig = useAdminConfigStore(s => s.importConfig);
  const resetAll = useAdminConfigStore(s => s.resetAll);

  const notify = useNotificationsStore(s => s.notifyInfo);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = () => {
    const payload = exportConfig();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aethelia_admin_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastExport(payload.exportedAt);
    notify('Настройки админки экспортированы ✓');
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importConfig(String(reader.result ?? ''));
      if (ok) {
        notify('Настройки админки импортированы ✓');
      } else {
        notify('Не удалось импортировать: неверный JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    resetAll();
    notify('Админ-настройки сброшены к значениям по умолчанию');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">

      {/* ── Экономика ─────────────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">🪙 Экономика</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Рейты золота и цен продажи. Рейты профессий (XP/мастерство/скорость/дроп) — во вкладке «Профессии».</p>
          </div>
          <button
            type="button"
            onClick={resetGameRates}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95"
            title="Сбросить рейты"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {RATE_FIELDS.map(field => (
            <label key={field.key} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)]">{field.label}</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{field.hint}</div>
              </div>
              <input
                type="number"
                value={rates[field.key]}
                step={field.step}
                min={field.min}
                max={field.max}
                onChange={e => setGameRate(field.key, Number(e.target.value))}
                className="w-20 bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* ── Боевая система ───────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">⚔️ Рейты боя</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Отдельные live-настройки тактических вылазок: XP, добыча, золото и скорость таймеров.</p>
          </div>
          <button
            type="button"
            onClick={resetGameRates}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95"
            title="Сбросить рейты"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {COMBAT_RATE_FIELDS.map(field => (
            <label key={field.key} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)]">{field.label}</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{field.hint}</div>
              </div>
              <input
                type="number"
                value={rates[field.key]}
                step={field.step}
                min={field.min}
                max={field.max}
                onChange={e => setGameRate(field.key, Number(e.target.value))}
                className="w-20 bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* ── Доступность боя ───────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">⚔️ Доступность боя</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Выключенный бой не запустится в игре (встречи при Сборе не передаются в комбат). Доступность профессий — во вкладке «Профессии».</p>
          </div>
          <button
            type="button"
            onClick={resetContentToggles}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95"
            title="Включить всё"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {COMBAT_TOGGLE.map(skill => (
            <button
              key={skill.key}
              type="button"
              onClick={() => setContentToggle(skill.key, !toggles[skill.key])}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2.5 ${
                toggles[skill.key]
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}
            >
              <span className="text-xl">{skill.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{skill.label}</div>
                <div className="text-[10px] font-mono opacity-80">{toggles[skill.key] ? 'Включён' : 'Выключен'}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Хранилище настроек ─────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black text-[var(--text-primary)] mb-1">💾 Настройки админки</h2>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
          Правки хранятся в этом браузере (localStorage) и действуют сразу. Для переноса на другой ПК или в репозиторий — экспортируйте JSON.
          {lastExport && <span className="text-amber-300 block mt-0.5 font-mono">Последний экспорт: {lastExport}</span>}
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Экспорт JSON
          </button>

          <label className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-primary)] font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Импорт JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={e => handleImportFile(e.target.files?.[0])} />
          </label>

          <button type="button" onClick={handleResetAll} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Сбросить всё
          </button>
        </div>
      </section>

    </div>
  );
}
