import { useEffect, useMemo, useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
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
import { Save, Trash2, Plus, Minus } from 'lucide-react';

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

function normalizeSave(save: SaveData | null | undefined): SaveData {
  const base = makeEmptySave();
  const skills = { ...base.player.skills, ...(save?.player?.skills ?? {}) } as Record<SkillId, SkillState>;
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

  const [itemId, setItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [equipSlot, setEquipSlot] = useState<EquipSlot>('weapon');
  const [equipItemId, setEquipItemId] = useState('');
  const [goldInput, setGoldInput] = useState(1000);

  const items = useMemo(() => getAllItems().sort((a, b) => a.name.localeCompare(b.name, 'ru')), []);

  // Персонажей загружает App ещё на вывеске; на всякий случай догружаем.
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
    setDraft(normalizeSave(selected.saveData));
    setItemId(items[0]?.id ?? '');
    setItemQty(1);
    setEquipItemId('');
    setGoldInput(selected.saveData?.bank.gp ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (!selected || !draft) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a' }}>
        <div className="text-4xl mb-2">👤</div>
        <p className="text-sm text-[var(--text-muted)]">Персонажи загружаются…</p>
      </div>
    );
  }

  const patchDraft = (fn: (prev: SaveData) => SaveData) => {
    setDraft(prev => (prev ? fn(prev) : prev));
  };

  const setSkillLevel = (id: SkillId, level: number) => {
    const nextLevel = clampLevel(level);
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

  const addItemToBank = (id: string, qty: number) => {
    const cleanQty = clampQty(qty);
    if (!id || cleanQty <= 0) return;
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

  const removeItemFromBank = (id: string, qty: number) => {
    const cleanQty = clampQty(qty);
    patchDraft(prev => {
      const bank = prev.bank.items
        .map(s => (s.itemId === id ? { ...s, quantity: s.quantity - cleanQty } : s))
        .filter(s => s.quantity > 0);
      return { ...prev, bank: { ...prev.bank, items: bank } };
    });
  };

  const addEquipment = (slot: EquipSlot, id: string) => {
    if (!id) return;
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: id } },
    }));
  };

  const removeEquipment = (slot: EquipSlot) => {
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: null } },
    }));
  };

  const setGold = (amount: number) => {
    const clean = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
    patchDraft(prev => ({ ...prev, bank: { ...prev.bank, gp: clean } }));
  };

  const addGold = (amount: number) => {
    const clean = clampQty(amount);
    patchDraft(prev => ({ ...prev, bank: { ...prev.bank, gp: Math.max(0, prev.bank.gp + clean) } }));
  };

  const save = async () => {
    if (!draft || !selected || saving) return;
    setSaving(true);
    try {
      const patched = { ...draft, savedAt: Date.now() };
      const updated = await updateCharacter(selected.id, { saveData: patched });
      setDraft(normalizeSave(updated.saveData));
      useCharacterStore.setState(state => ({
        characters: state.characters.map(c => (c.id === updated.id ? updated : c)),
        activeCharacter: state.activeCharacter?.id === updated.id ? updated : state.activeCharacter,
      }));
      if (activeCharacter?.id === updated.id) {
        applySaveData(normalizeSave(updated.saveData));
      }
      notify('Персонаж сохранён ✓');
    } catch (e) {
      notify(`Ошибка сохранения: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = 'w-24 bg-[var(--bg-card-dark)] border border-[var(--border-default)] rounded-xl px-2 py-1.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500';

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Выбор персонажа */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-display font-black text-[var(--text-primary)]">👤 Персонаж</div>
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
        <div className="text-[11px] text-[var(--text-muted)] mt-2">
          Уровни и опыт меняются сразу в редактируемой копии. Кнопка «Сохранить» записывает save_data персонажа в облако.
        </div>
      </div>

      {/* Характеристики персонажа: уровни и опыт */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-display font-black text-[var(--text-primary)]">📊 Характеристики и уровни</h2>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">{ALL_SKILL_IDS.length} навыков</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {ALL_SKILL_IDS.map(id => {
            const skill = draft.player.skills[id];
            if (!skill) return null;
            return (
              <div key={id} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
                <span className="flex-1 min-w-0 text-xs font-semibold text-[var(--text-primary)] truncate">{skillNameRu(id)}</span>
                <label className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                  Ур.
                  <input
                    type="number"
                    className={inputStyle}
                    value={skill.level}
                    min={1}
                    max={MAX_LEVEL}
                    onChange={e => setSkillLevel(id, Number(e.target.value))}
                  />
                </label>
                <label className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                  Оп.
                  <input
                    type="number"
                    className={inputStyle}
                    value={skill.xp}
                    min={0}
                    step={1}
                    onChange={e => setSkillXp(id, Number(e.target.value))}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Сумка: предметы и золото */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black text-[var(--text-primary)] mb-2">🎒 Сумка</h2>

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
          <input
            type="number"
            value={itemQty}
            min={1}
            step={1}
            onChange={e => setItemQty(Number(e.target.value))}
            className={inputStyle}
          />
          <button
            type="button"
            onClick={() => addItemToBank(itemId, itemQty)}
            className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>

        {/* Золото */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)] mb-2">
          <span className="text-xs font-semibold text-[var(--text-primary)]">🪙 Золото</span>
          <input type="number" value={draft.bank.gp} min={0} onChange={e => setGold(Number(e.target.value))} className={inputStyle} />
          <button
            type="button"
            onClick={() => addGold(100)}
            className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs transition-all active:scale-95"
          >
            +100
          </button>
          <button
            type="button"
            onClick={() => setGold(Math.max(0, draft.bank.gp - 100))}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold rounded-xl text-xs transition-all active:scale-95"
          >
            −100
          </button>
        </div>

        {/* Список предметов */}
        {draft.bank.items.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)] pb-2">Сумка пуста.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {draft.bank.items.map((slot: BankSlot, i: number) => {
              const item = items.find(x => x.id === slot.itemId);
              return (
                <div key={`${slot.itemId}-${i}`} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-slot)] border border-[var(--border-default)]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{item?.name ?? slot.itemId}</div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">×{slot.quantity}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeItemFromBank(slot.itemId, 1)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all active:scale-95"
                      title="Убрать 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItemFromBank(slot.itemId, slot.quantity)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all active:scale-95"
                      title="Убрать всё"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Снаряжение */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <h2 className="text-sm font-display font-black text-[var(--text-primary)] mb-2">⚔️ Снаряжение</h2>

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
          <button
            type="button"
            onClick={() => addEquipment(equipSlot, equipItemId)}
            className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1"
          >
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
                  <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">{EQUIP_SLOT_LABELS[slot]}</div>
                  <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{eq?.name ?? (eqId ? eqId : '— пусто —')}</div>
                </div>
                {eqId && (
                  <button
                    type="button"
                    onClick={() => removeEquipment(slot)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all active:scale-95"
                    title="Снять"
                  >
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
