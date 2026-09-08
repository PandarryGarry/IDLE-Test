import { useEffect, useState } from 'react';
import {
  useAdminConfigStore,
  type AdminSkillToggle,
} from '@/store/adminConfigStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useProfessionStatsStore } from '@/store/professionStatsStore';
import {
  PROFESSION_STAT_DEFS,
  type ProfessionStatDef,
  type ProfessionStatTier,
} from '@/domain/professions/professionStats';
import {
  PROFESSION_FEEDS,
  type ProfessionFeed,
} from '@/data/balance/professions';
import {
  PILLAR_IDS,
  BRANCH_IDS,
  BRANCHES_BY_PILLAR,
  PILLARS,
  BRANCHES,
  type BranchId,
  type PillarId,
} from '@/domain/attributes/attributes';
import { RotateCcw, Download, Upload, Trash2 } from 'lucide-react';

const SKILL_LABELS: Record<string, string> = {
  foraging: 'Сбор',
};

const PROFESSION_TOGGLES: { key: AdminSkillToggle; label: string; icon: string }[] = [
  { key: 'foraging', label: 'Сбор', icon: '🌿' },
];

const PROFESSION_RATE_FIELDS: {
  key: 'xpMultiplier' | 'masteryXpMultiplier' | 'actionSpeedMultiplier' | 'dropRateMultiplier';
  label: string;
  hint: string;
  step: number;
  min: number;
  max: number;
}[] = [
  { key: 'xpMultiplier', label: 'Опыт (XP)', hint: 'Множитель получаемого опыта. 1 — как в исходных данных.', step: 0.05, min: 0.05, max: 20 },
  { key: 'masteryXpMultiplier', label: 'Мастерство', hint: 'Множитель опыта мастерства действия.', step: 0.05, min: 0.05, max: 20 },
  { key: 'actionSpeedMultiplier', label: 'Скорость действий', hint: '>1 — действия быстрее (интервал делится на это значение).', step: 0.1, min: 0.1, max: 20 },
  { key: 'dropRateMultiplier', label: 'Дроп', hint: 'Шанс дропа монстров и самоцветов при добыче.', step: 0.05, min: 0, max: 20 },
];

const inputCls = 'bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2.5 py-1.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500';
const labelCls = 'text-xs font-semibold text-[var(--text-primary)]';
const hintCls = 'text-[10px] text-[var(--text-muted)] leading-tight mt-0.5';

function StatCard({ def }: { def: ProfessionStatDef }) {
  const overrides = useAdminConfigStore(s => s.professionStatOverrides);
  const update = useAdminConfigStore(s => s.updateProfessionStatOverride);
  const reset = useAdminConfigStore(s => s.resetProfessionStatOverride);
  const override = overrides[def.id];
  const editable = { ...def, ...override };

  const set = (patch: Partial<ProfessionStatDef>) => update(def.id, patch);

  const numValue = (v: number | string | undefined, fallback: number) => {
    if (v === undefined || v === '') return '';
    return v;
  };

  return (
    <div className="p-3 rounded-xl border bg-[var(--bg-card-dark)]" style={{ borderColor: override ? 'rgba(200,136,10,0.45)' : 'var(--border-default)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <span>{def.icon ?? '📊'}</span>
            <span className="truncate">{editable.nameRu}</span>
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)]">{def.id}</div>
        </div>
        {override && (
          <button
            type="button"
            onClick={() => reset(def.id)}
            className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-300 hover:bg-red-950/30 transition-all"
            title="Сбросить к дефолту"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Название</span>
            <input type="text" value={editable.nameRu} className={inputCls} onChange={e => set({ nameRu: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Волна</span>
            <select
              value={editable.tier}
              className={inputCls}
              onChange={e => set({ tier: e.target.value as ProfessionStatTier })}
            >
              <option value="early">early — старт</option>
              <option value="master">master — мастер</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Описание</span>
          <input type="text" value={editable.descriptionRu} className={inputCls} onChange={e => set({ descriptionRu: e.target.value })} />
        </label>

        <div className="grid grid-cols-4 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Unlock</span>
            <input type="number" value={numValue(editable.unlockLevel, 1)} className={inputCls} onChange={e => set({ unlockLevel: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Base</span>
            <input type="number" step={0.01} value={numValue(editable.base, 0)} className={inputCls} onChange={e => set({ base: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Per lvl</span>
            <input type="number" step={0.01} value={numValue(editable.perLevel, 0)} className={inputCls} onChange={e => set({ perLevel: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Cap</span>
            <input type="number" step={0.01} value={numValue(editable.cap, 0)} className={inputCls} onChange={e => set({ cap: Number(e.target.value) })} />
          </label>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ feed }: { feed: ProfessionFeed }) {
  const overrides = useAdminConfigStore(s => s.professionFeedOverrides);
  const update = useAdminConfigStore(s => s.updateProfessionFeedOverride);
  const reset = useAdminConfigStore(s => s.resetProfessionFeedOverride);
  const override = overrides[feed.skillId];
  const editable = { ...feed, ...override };

  const branches = BRANCHES_BY_PILLAR[editable.pillar];

  return (
    <div className="p-3 rounded-xl border bg-[var(--bg-card-dark)]" style={{ borderColor: override ? 'rgba(200,136,10,0.45)' : 'var(--border-default)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-[var(--text-primary)]">{SKILL_LABELS[feed.skillId] ?? feed.skillId}</div>
          <div className="text-[10px] font-mono text-[var(--text-muted)]">профессия → персонаж</div>
        </div>
        {override && (
          <button
            type="button"
            onClick={() => reset(feed.skillId)}
            className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-300 hover:bg-red-950/30 transition-all"
            title="Сбросить к дефолту"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Столп</span>
          <select value={editable.pillar} className={inputCls} onChange={e => update(feed.skillId, { pillar: e.target.value as PillarId })}>
            {PILLAR_IDS.map(p => <option key={p} value={p}>{PILLARS[p].nameRu}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Ветвь</span>
          <select value={editable.branch} className={inputCls} onChange={e => update(feed.skillId, { branch: e.target.value as BranchId })}>
            {branches.map(b => <option key={b} value={b}>{BRANCHES[b].nameRu}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">% за уровень</span>
          <input type="number" step={0.01} value={editable.percentPerLevel ?? 0} className={inputCls} onChange={e => update(feed.skillId, { percentPerLevel: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">% кап</span>
          <input type="number" step={0.01} value={editable.percentCap ?? editable.percentCapStub} className={inputCls} onChange={e => update(feed.skillId, { percentCap: Number(e.target.value) })} />
        </label>
      </div>
    </div>
  );
}

export function AdminProfessionsPanel() {
  const rates = useAdminConfigStore(s => s.gameRates);
  const toggles = useAdminConfigStore(s => s.contentToggles);
  const setGameRate = useAdminConfigStore(s => s.setGameRate);
  const resetGameRates = useAdminConfigStore(s => s.resetGameRates);
  const setContentToggle = useAdminConfigStore(s => s.setContentToggle);
  const resetContentToggles = useAdminConfigStore(s => s.resetContentToggles);
  const resetAllProfessionStatOverrides = useAdminConfigStore(s => s.resetAllProfessionStatOverrides);
  const resetAllProfessionFeedOverrides = useAdminConfigStore(s => s.resetAllProfessionFeedOverrides);
  const exportConfig = useAdminConfigStore(s => s.exportConfig);
  const importConfig = useAdminConfigStore(s => s.importConfig);
  const resetAll = useAdminConfigStore(s => s.resetAll);
  const touchStats = useProfessionStatsStore(s => s.touch);

  const notify = useNotificationsStore(s => s.notifyInfo);
  const statOverrides = useAdminConfigStore(s => s.professionStatOverrides);
  const feedOverrides = useAdminConfigStore(s => s.professionFeedOverrides);
  const [lastExport, setLastExport] = useState<string | null>(null);

  useEffect(() => { touchStats(); }, [statOverrides, feedOverrides]);

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
    notify('Настройки профессий экспортированы ✓');
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importConfig(String(reader.result ?? ''));
      if (ok) {
        notify('Настройки профессий импортированы ✓');
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

  const skillIds = Array.from(new Set(PROFESSION_STAT_DEFS.map(d => d.skillId)));

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── Рейты профессий ──────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">⚡ Рейты профессий</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Применяются ко всем ремёслам. Цена продажи здесь не редактируется (экномика фиксированная).</p>
          </div>
          <button type="button" onClick={resetGameRates} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95" title="Сбросить рейты">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PROFESSION_RATE_FIELDS.map(field => (
            <label key={field.key} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
              <div className="min-w-0">
                <div className={labelCls}>{field.label}</div>
                <div className={hintCls}>{field.hint}</div>
              </div>
              <input type="number" value={rates[field.key]} step={field.step} min={field.min} max={field.max}
                onChange={e => setGameRate(field.key, Number(e.target.value))}
                className="w-20 bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500" />
            </label>
          ))}
        </div>
      </section>

      {/* ── Доступность профессий ─────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">🧭 Доступность профессий</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Выключенное ремесло не запустится в игре.</p>
          </div>
          <button type="button" onClick={resetContentToggles} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95" title="Включить всё">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {PROFESSION_TOGGLES.map(skill => (
            <button key={skill.key} type="button" onClick={() => setContentToggle(skill.key, !toggles[skill.key])}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2.5 ${
                toggles[skill.key] ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
              <span className="text-xl">{skill.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{skill.label}</div>
                <div className="text-[10px] font-mono opacity-80">{toggles[skill.key] ? 'Включён' : 'Выключен'}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Характеристики профессий ───────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">📊 Характеристики профессий</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Собственные бонусы ремесла. Waves: <b className="text-amber-300">early</b> с 1-х уровней, <b className="text-amber-300">master</b> у максимума.</p>
          </div>
          <button type="button" onClick={resetAllProfessionStatOverrides} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95" title="Сбросить все статы к дефолту">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {skillIds.map(skillId => (
            <div key={skillId}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{SKILL_LABELS[skillId]?.startsWith('Сбор') ? '🌿' : '⚒️'}</span>
                <h3 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[var(--text-primary)]">{SKILL_LABELS[skillId] ?? skillId}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {PROFESSION_STAT_DEFS.filter(d => d.skillId === skillId).map(def => <StatCard key={def.id} def={def} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Вклад в персонажа ─────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-display font-black text-[var(--text-primary)]">💪 Профессия → персонаж</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Какая ветвь героя растёт от уровня профессии. По умолчанию 0 % — включается только правкой админа.</p>
          </div>
          <button type="button" onClick={resetAllProfessionFeedOverrides} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-300 hover:bg-[var(--bg-card-dark)] transition-all active:scale-95" title="Сбросить все вклады">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PROFESSION_FEEDS.filter(feed => feed.skillId === 'foraging').map(feed => <FeedCard key={feed.skillId} feed={feed} />)}
        </div>
      </section>

      {/* ── Хранилище ─────────────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black text-[var(--text-primary)] mb-1">💾 Настройки профессий</h2>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
          Экспорт/импорт общего JSON админки. Правки применяются сразу.
          {lastExport && <span className="text-amber-300 block mt-0.5 font-mono">Последний экспорт: {lastExport}</span>}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Экспорт JSON
          </button>
          <label className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-primary)] font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Импорт JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={e => handleImportFile(e.target.files?.[0])} />
          </label>
          <button type="button" onClick={handleResetAll} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Сбросить всё
          </button>
        </div>
      </section>
    </div>
  );
}
