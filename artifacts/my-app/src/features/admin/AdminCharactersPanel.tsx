import { useEffect, useMemo, useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { updateCharacter } from '@/lib/characterApi';
import { useNotificationsStore } from '@/store/notificationsStore';
import {
  ALL_SKILL_IDS,
  EMPTY_EQUIPMENT,
  type BankSlot,
  type EquipSlot,
  type SaveData,
  type SkillId,
  type SkillState,
} from '@/data/types';
import { getAllItems } from '@/domain/items';
import { getLevelForXp, getXpForLevel, MAX_LEVEL } from '@/core/xpTable';
import { skillNameRu } from '@/lib/skillNames';
import { createDefaultAttributes } from '@/domain/attributes/characterAttributes';
import { createEmptyGearSets } from '@/domain/items/gearSets';
import { applySaveData } from '@/lib/saveManager';
import { Save, Trash2, Plus, Minus, RotateCcw } from 'lucide-react';

const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  helm: 'Шлем',
  platebody: 'Нагрудник',
  platelegs: 'Поножи',
  boots: 'Ботинки',
  gloves: 'Перчатки',
  amulet: 'Амулет',
  ring: 'Кольцо 1',
  ring2: 'Кольцо 2',
  bracelet: 'Браслет 1',
  bracelet2: 'Браслет 2',
  belt: 'Пояс',
  weapon: 'Оружие',
  shield: 'Щит',
  cape: 'Плащ',
  quiver: 'Колчан',
  passive: 'Пассивное',
};

const EQUIP_SLOTS = Object.keys(EMPTY_EQUIPMENT) as EquipSlot[];

/** Тёмно-коричневый текст для светлых панелей админки (контраст к beige). */
const DARK_TEXT = '#2f2010';
const MUTED_DARK = '#4a3520';

function makeEmptySave(): SaveData {
  const skills = {} as Record<SkillId, SkillState>;
  for (const id of ALL_SKILL_IDS) {
    const level = id === 'hitpoints' ? 10 : 1;
    skills[id] = { level, xp: getXpForLevel(level), unlocked: true, mastery: {} };
  }
  return {
    version: '1.0.0',
    savedAt: Date.now(),
    totalPlayTime: 0,
    gameMode: 'standard',
    player: {
      skills,
      equipment: { ...EMPTY_EQUIPMENT },
    },
    bank: { items: [], gp: 0, maxSlots: 24 },
    game: { activeSkill: null, activeActionId: null, activeAreaId: null, activeMonsterId: null },
    settings: {},
    attributes: createDefaultAttributes(),
    gearSets: createEmptyGearSets(),
  };
}

function normalizeSave(save: SaveData | null | undefined, fallbackSkills?: Record<SkillId, SkillState>): SaveData {
  const base = makeEmptySave();
  const originalSkills = save?.player?.skills ?? {};
  const fallback = fallbackSkills && Object.keys(fallbackSkills).length > 0 ? fallbackSkills : undefined;
  const skills = {
    ...base.player.skills,
    ...fallback,
    ...originalSkills,
  } as Record<SkillId, SkillState>;
  return {
    ...base,
    ...save,
    player: {
      skills,
      equipment: { ...EMPTY_EQUIPMENT, ...(save?.player?.equipment ?? {}) },
    },
    bank: {
      items: Array.isArray(save?.bank?.items) ? save.bank.items : [],
      gp: save?.bank?.gp ?? 0,
      maxSlots: save?.bank?.maxSlots ?? 24,
    },
    game: {
      activeSkill: save?.game?.activeSkill ?? null,
      activeActionId: save?.game?.activeActionId ?? null,
      activeAreaId: save?.game?.activeAreaId ?? null,
      activeMonsterId: save?.game?.activeMonsterId ?? null,
    },
  };
}

function clampLevel(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(MAX_LEVEL, Math.round(value)));
}

function clampQty(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function AdminCharactersPanel() {
  const characters = useCharacterStore(s => s.characters);
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const notify = useNotificationsStore(s => s.notifyInfo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SaveData | null>(null);
  const [saving, setSaving] = useState(false);

  // Какие секции реально трогали. Если персонажа не меняли — при сохранении
  // НЕ затираем его сейв дефолтами (это чинило «все скидываются на 1»).
  const [touched, setTouched] = useState({ skills: false, bank: false, equipment: false });
  const [touchedSkills, setTouchedSkills] = useState<Set<string>>(new Set());

  const [itemId, setItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [equipSlot, setEquipSlot] = useState<EquipSlot>('weapon');
  const [equipItemId, setEquipItemId] = useState('');

  const items = useMemo(() => getAllItems().sort((a, b) => a.name.localeCompare(b.name, 'ru')), []);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user && useCharacterStore.getState().characters.length === 0) {
      void useCharacterStore.getState().loadCharacters(user.id);
    }
  }, []);

  const selected = characters.find(c => c.id === selectedId) ?? characters[0] ?? null;

  useEffect(() => {
    if (!selected) {
      setSelectedId(null);
      setDraft(null);
      return;
    }
    if (selected.id !== selectedId) setSelectedId(selected.id);

    // fallbackSkills: если сейв старый и не содержит skills, берём текущие навыки
    // игры (а не дефолтные 1), чтобы сохранение не «обнуляло» персонажа.
    const liveSkills = usePlayerStore.getState().skills as Record<SkillId, SkillState>;
    const fallback = selected.saveData?.player?.skills ? undefined : liveSkills;
    setDraft(normalizeSave(selected.saveData, fallback));
    setTouched({ skills: false, bank: false, equipment: false });
    setTouchedSkills(new Set());
    setItemId(items[0]?.id ?? '');
    setItemQty(1);
    setEquipItemId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (!selected || !draft) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a' }}>
        <div className="text-4xl mb-2">👤</div>
        <p className="text-sm" style={{ color: DARK_TEXT }}>Персонажи загружаются…</p>
      </div>
    );
  }

  const patchDraft = (fn: (prev: SaveData) => SaveData) => {
    setDraft(prev => (prev ? fn(prev) : prev));
  };

  const markSkills = (id: SkillId) => {
    setTouched(prev => ({ ...prev, skills: true }));
    setTouchedSkills(prev => new Set(prev).add(id));
  };

  const setSkillLevel = (id: SkillId, level: number) => {
    const nextLevel = clampLevel(level);
    markSkills(id);
    patchDraft(prev => ({
      ...prev,
      player: {
        ...prev.player,
        skills: {
          ...prev.player.skills,
          [id]: {
            ...prev.player.skills[id],
            level: nextLevel,
            xp: getXpForLevel(nextLevel),
          },
        },
      },
    }));
  };

  const setSkillXp = (id: SkillId, xp: number) => {
    const cleanXp = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
    markSkills(id);
    patchDraft(prev => ({
      ...prev,
      player: {
        ...prev.player,
        skills: {
          ...prev.player.skills,
          [id]: {
            ...prev.player.skills[id],
            xp: cleanXp,
            level: getLevelForXp(cleanXp),
          },
        },
      },
    }));
  };

  const setAllSkillLevels = (level: number) => {
    const target = clampLevel(level);
    setTouched(prev => ({ ...prev, skills: true }));
    setTouchedSkills(new Set(ALL_SKILL_IDS));
    patchDraft(prev => {
      const skills = { ...prev.player.skills };
      for (const id of ALL_SKILL_IDS) {
        skills[id] = { ...(skills[id] ?? { mastery: {} }), level: target, xp: getXpForLevel(target) };
      }
      return { ...prev, player: { ...prev.player, skills } };
    });
  };

  const addItemToBank = (id: string, qty: number) => {
    const cleanQty = clampQty(qty);
    if (!id || cleanQty <= 0) return;
    setTouched(prev => ({ ...prev, bank: true }));
    patchDraft(prev => {
      const bank = [...prev.bank.items];
      const idx = bank.findIndex(s => s.itemId === id);
      if (idx >= 0) {
        bank[idx] = { ...bank[idx], quantity: bank[idx].quantity + cleanQty };
      } else {
        bank.push({ itemId: id, quantity: cleanQty, locked: false, tab: 0 });
      }
      return { ...prev, bank: { ...prev.bank, items: bank } };
    });
  };

  const changeItemQtyBy = (id: string, delta: number) => {
    if (!id) return;
    setTouched(prev => ({ ...prev, bank: true }));
    patchDraft(prev => {
      const bank = prev.bank.items
        .map(s => (s.itemId === id ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s))
        .filter(s => s.quantity > 0);
      return { ...prev, bank: { ...prev.bank, items: bank } };
    });
  };

  const setGold = (amount: number) => {
    const clean = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
    setTouched(prev => ({ ...prev, bank: true }));
    patchDraft(prev => ({ ...prev, bank: { ...prev.bank, gp: clean } }));
  };

  const addEquipment = (slot: EquipSlot, id: string) => {
    if (!id) return;
    setTouched(prev => ({ ...prev, equipment: true }));
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: id } },
    }));
  };

  const removeEquipment = (slot: EquipSlot) => {
    setTouched(prev => ({ ...prev, equipment: true }));
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: null } },
    }));
  };

  const save = async () => {
    if (!draft || !selected || saving) return;
    setSaving(true);
    try {
      // Собираем патч из исходного сейва + только те секции, которые менял админ.
      // Так «персонаж не трогали» никогда не затирается дефолтами.
      const base = normalizeSave(selected.saveData, selected.saveData?.player?.skills ? undefined : usePlayerStore.getState().skills as Record<SkillId, SkillState>);
      const next: SaveData = {
        ...base,
        savedAt: Date.now(),
        player: {
          skills: touched.skills ? draft.player.skills : base.player.skills,
          equipment: touched.equipment ? draft.player.equipment : base.player.equipment,
        },
        bank: touched.bank ? draft.bank : base.bank,
      };

      const updated = await updateCharacter(selected.id, { saveData: next });
      setDraft(normalizeSave(updated.saveData, usePlayerStore.getState().skills as Record<SkillId, SkillState>));
      setTouched({ skills: false, bank: false, equipment: false });
      setTouchedSkills(new Set());
      useCharacterStore.setState(state => ({
        characters: state.characters.map(c => (c.id === updated.id ? updated : c)),
        activeCharacter: state.activeCharacter?.id === updated.id ? updated : state.activeCharacter,
      }));
      if (activeCharacter?.id === updated.id) {
        applySaveData(normalizeSave(updated.saveData, usePlayerStore.getState().skills as Record<SkillId, SkillState>));
      }
      notify('Персонаж сохранён ✓');
    } catch (e) {
      notify(`Ошибка сохранения: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = 'w-20 bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500';
  const quickBtn = 'px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all active:scale-95';

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* ── Выбор персонажа + сохранение ─────────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-display font-black" style={{ color: DARK_TEXT }}>👤 Персонаж</div>
          <select
            value={selected.id}
            onChange={e => setSelectedId(e.target.value)}
            className="flex-1 min-w-[180px] bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
          >
            {characters.map(c => (
              <option key={c.id} value={c.id}>{c.nickname}{c.id === activeCharacter?.id ? ' · активный' : ''}</option>
            ))}
          </select>
          <button
            id="admin-character-save"
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
        <p className="text-[11px] font-semibold mt-2" style={{ color: MUTED_DARK }}>
          Сохраняются только те блоки, которые ты менял (навыки, сумка или экип). Остальное остаётся как было.
        </p>
      </div>

      {/* ── Характеристики: уровни и опыт ───────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-sm font-display font-black" style={{ color: DARK_TEXT }}>📊 Характеристики и уровни</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono" style={{ color: MUTED_DARK }}>Всем:</span>
            {[1, 10, 50, 99].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setAllSkillLevels(level)}
                className={`${quickBtn} border-amber-500/40 bg-amber-500/10 text-[#5a3a10]`}
              >
                {level}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAllSkillLevels(1)}
              className={`${quickBtn} border-stone-500/40 bg-stone-500/10 text-[#5a3a10]`}
              title="Сбросить все уровни к 1"
            >
              <RotateCcw className="w-3 h-3 inline" /> База
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {ALL_SKILL_IDS.map(id => {
            const skill = draft.player.skills[id];
            if (!skill) return null;
            const lvl = clampLevel(skill.level);
            const to99 = MAX_LEVEL - lvl;
            const xpFieldId = `admin-xp-${id}`;
            const lvlFieldId = `admin-level-${id}`;
            return (
              <div key={id} className="rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)] p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex-1 min-w-[110px] text-xs font-bold" style={{ color: DARK_TEXT }}>{skillNameRu(id)}</span>
                  <label htmlFor={lvlFieldId} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: MUTED_DARK }}>
                    Ур.
                    <input
                      id={lvlFieldId}
                      type="number"
                      className={`${inputStyle} w-14`}
                      value={skill.level}
                      min={1}
                      max={MAX_LEVEL}
                      onChange={e => setSkillLevel(id, Number(e.target.value))}
                    />
                  </label>
                  <label htmlFor={xpFieldId} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: MUTED_DARK }}>
                    Оп.
                    <input
                      id={xpFieldId}
                      type="number"
                      className={`${inputStyle} w-16`}
                      value={skill.xp}
                      min={0}
                      step={1}
                      onChange={e => setSkillXp(id, Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono" style={{ color: MUTED_DARK }}>уровень:</span>
                  <button type="button" onClick={() => setSkillLevel(id, Math.max(1, lvl - 1))} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`} title="−1 уровень">−1</button>
                  <button type="button" onClick={() => setSkillLevel(id, lvl + 1)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`} title="+1 уровень">+1</button>
                  <button type="button" onClick={() => setSkillLevel(id, lvl + 10)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`} title="+10 уровней">+10</button>
                  <button type="button" onClick={() => setSkillLevel(id, MAX_LEVEL)} className={`${quickBtn} border-amber-500/40 bg-amber-500/10 text-[#5a3a10]`} title="Максимум">{to99 <= 0 ? 'MAX ✔' : `MAX (+${to99})`}</button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[9px] font-mono" style={{ color: MUTED_DARK }}>опыт:</span>
                  <button type="button" onClick={() => setSkillXp(id, skill.xp + 1000)} className={`${quickBtn} border-sky-500/40 bg-sky-500/10 text-[#1e3a5f]`} title="+1 000 XP">+1К</button>
                  <button type="button" onClick={() => setSkillXp(id, skill.xp + 10000)} className={`${quickBtn} border-sky-500/40 bg-sky-500/10 text-[#1e3a5f]`} title="+10 000 XP">+10К</button>
                  <button type="button" onClick={() => setSkillXp(id, getXpForLevel(MAX_LEVEL))} className={`${quickBtn} border-amber-500/40 bg-amber-500/10 text-[#5a3a10]`} title="XP до 99 уровня">MAX XP</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Сумка: предметы и золото ───────────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black mb-2" style={{ color: DARK_TEXT }}>🎒 Сумка</h2>

        {/* Добавить предмет */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)] mb-2">
          <select
            value={itemId}
            onChange={e => setItemId(e.target.value)}
            className="flex-1 min-w-[140px] bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
          >
            <option value="">— предмет —</option>
            {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.id})</option>)}
          </select>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setItemQty(q => Math.max(1, q - 1))} className={`${quickBtn} border-stone-500/40 bg-stone-500/10 text-[#5a3a10]`}><Minus className="w-3 h-3" /></button>
            <input type="number" value={itemQty} min={1} step={1} onChange={e => setItemQty(Number(e.target.value))} className={`${inputStyle} w-16`} />
            <button type="button" onClick={() => setItemQty(q => q + 1)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`}><Plus className="w-3 h-3" /></button>
          </div>
          <button type="button" onClick={() => addItemToBank(itemId, itemQty)} className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-900 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>

        {/* Золото */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)] mb-2">
          <span className="text-xs font-bold" style={{ color: DARK_TEXT }}>🪙 Золото</span>
          <input type="number" value={draft.bank.gp} min={0} onChange={e => setGold(Number(e.target.value))} className={inputStyle} />
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setGold(Math.max(0, draft.bank.gp - 1000))} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`}>−1К</button>
            <button type="button" onClick={() => setGold(Math.max(0, draft.bank.gp - 100))} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`}>−100</button>
            <button type="button" onClick={() => setGold(0)} className={`${quickBtn} border-stone-500/40 bg-stone-500/10 text-[#5a3a10]`}>0</button>
            <button type="button" onClick={() => setGold(draft.bank.gp + 100)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`}>+100</button>
            <button type="button" onClick={() => setGold(draft.bank.gp + 1000)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`}>+1К</button>
          </div>
        </div>

        {/* Список предметов */}
        {draft.bank.items.length === 0 ? (
          <p className="text-[11px] pb-2" style={{ color: MUTED_DARK }}>Сумка пуста.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {draft.bank.items.map((slot: BankSlot, i: number) => {
              const item = items.find(x => x.id === slot.itemId);
              return (
                <div key={`${slot.itemId}-${i}`} className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
                  <div className="flex-1 min-w-[90px]">
                    <div className="text-[11px] font-bold" style={{ color: DARK_TEXT }}>{item?.name ?? slot.itemId}</div>
                    <div className="text-[10px] font-mono" style={{ color: MUTED_DARK }}>×{slot.quantity}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => changeItemQtyBy(slot.itemId, -10)} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`}>−10</button>
                    <button type="button" onClick={() => changeItemQtyBy(slot.itemId, -1)} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`} title="Убрать 1"><Minus className="w-3 h-3" /></button>
                    <button type="button" onClick={() => changeItemQtyBy(slot.itemId, +1)} className={`${quickBtn} border-emerald-500/40 bg-emerald-500/10 text-[#1d4a1d]`} title="Добавить 1"><Plus className="w-3 h-3" /></button>
                    <button type="button" onClick={() => changeItemQtyBy(slot.itemId, -slot.quantity)} className={`${quickBtn} border-red-500/40 bg-red-500/10 text-[#7f1d1d]`} title="Убрать всё"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Снаряжение ─────────────────────────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black mb-2" style={{ color: DARK_TEXT }}>⚔️ Снаряжение</h2>
        <p className="text-[11px] font-semibold mb-2" style={{ color: MUTED_DARK }}>Выбери слот, затем предмет из списка и нажми «Надеть».</p>

        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)] mb-2">
          <select
            value={equipSlot}
            onChange={e => setEquipSlot(e.target.value as EquipSlot)}
            className="bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
          >
            {EQUIP_SLOTS.map(slot => <option key={slot} value={slot}>{EQUIP_SLOT_LABELS[slot]}</option>)}
          </select>
          <select
            value={equipItemId}
            onChange={e => setEquipItemId(e.target.value)}
            className="flex-1 min-w-[140px] bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
          >
            <option value="">— предмет —</option>
            {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" onClick={() => addEquipment(equipSlot, equipItemId)} className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-900 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Надеть
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {EQUIP_SLOTS.map(slot => {
            const eqId = draft.player.equipment[slot];
            const eq = eqId ? items.find(x => x.id === eqId) : null;
            return (
              <div key={slot} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-mono font-bold" style={{ color: MUTED_DARK }}>{EQUIP_SLOT_LABELS[slot]}</div>
                  <div className="text-[11px] font-bold" style={{ color: DARK_TEXT }}>{eq?.name ?? (eqId ? eqId : '— пусто —')}</div>
                </div>
                {eqId && (
                  <button type="button" onClick={() => removeEquipment(slot)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 transition-all active:scale-95" title="Снять">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
