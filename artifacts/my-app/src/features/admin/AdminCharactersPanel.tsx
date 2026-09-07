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
  type Item,
  type SaveData,
  type SkillId,
  type SkillState,
} from '@/data/types';
import { getAllItems, getItem } from '@/domain/items';
import { getLevelForXp, getXpForLevel, MAX_LEVEL } from '@/core/xpTable';
import { skillNameRu } from '@/lib/skillNames';
import { createDefaultAttributes } from '@/domain/attributes/characterAttributes';
import { createEmptyGearSets } from '@/domain/items/gearSets';
import { applySaveData } from '@/lib/saveManager';
import { getAvatarPath, getRaceLabel } from '@/data/characters';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { formatNumber } from '@/lib/utils';
import { GModal } from '@/shared/ui/gameUI';
import {
  Save, Trash2, Plus, Minus, Search, RotateCcw, User, Boxes, Swords, LayoutDashboard,
} from 'lucide-react';

const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  helm: 'Шлем', platebody: 'Нагрудник', platelegs: 'Поножи', boots: 'Ботинки',
  gloves: 'Перчатки', amulet: 'Амулет', ring: 'Кольцо 1', ring2: 'Кольцо 2',
  bracelet: 'Браслет 1', bracelet2: 'Браслет 2', belt: 'Пояс', weapon: 'Оружие',
  shield: 'Щит', cape: 'Плащ', quiver: 'Колчан', passive: 'Пассивное',
};

const CATEGORY_RU: Record<string, string> = {
  weapon: 'Оружие', helm: 'Шлем', platebody: 'Доспех', platelegs: 'Поножи',
  boots: 'Сапоги', gloves: 'Перчатки', amulet: 'Амулет', ring: 'Кольцо',
  bracelet: 'Браслет', belt: 'Пояс', shield: 'Щит', cape: 'Плащ', quiver: 'Колчан',
  food: 'Еда', cooked_fish: 'Готовая рыба', raw_fish: 'Сырая рыба', log: 'Древесина',
  ore: 'Руда', bar: 'Слиток', gem: 'Самоцвет', ash: 'Зола', potion: 'Зелье',
  misc: 'Материал', mineral: 'Минерал', foraging: 'Сбор', herb: 'Травы', bone: 'Кости',
  seed: 'Семена', rune: 'Руны', arrow: 'Стрелы', tablet: 'Скрижали',
};

function categoryLabel(id: string): string {
  return CATEGORY_RU[id] ?? id;
}

const EQUIP_SLOTS = Object.keys(EMPTY_EQUIPMENT) as EquipSlot[];

const C = {
  surface: '#1c1108',
  surfaceAlt: '#241408',
  slot: '#150c04',
  border: '#3a2b1a',
  borderLight: '#4a3520',
  text: '#f5ead0',
  textSecondary: '#c2a374',
  textMuted: '#8a6b42',
  accent: '#f0c030',
};

const BTN = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_SECONDARY: React.CSSProperties = { background: C.slot, border: '1px solid ' + C.borderLight, color: C.text };
const BTN_MUTED: React.CSSProperties = { background: 'rgba(0,0,0,0.18)', border: '1px solid transparent', color: C.textSecondary };
const BTN_PRIMARY: React.CSSProperties = { background: C.accent, border: '1px solid #7a5610', color: '#241a05' };
const INPUT: React.CSSProperties = { background: C.slot, border: '1px solid ' + C.border, borderRadius: 10, color: C.text, fontSize: 12, fontFamily: 'var(--app-font-mono)', padding: '7px 10px' };
const CARD: React.CSSProperties = { background: C.surfaceAlt, border: '1px solid ' + C.border, borderRadius: 16 };
const LABEL: React.CSSProperties = { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: 'var(--app-font-mono)' };

function makeEmptySave(): SaveData {
  const skills = {} as Record<SkillId, SkillState>;
  for (const id of ALL_SKILL_IDS) {
    const level = id === 'hitpoints' ? 10 : 1;
    skills[id] = { level, xp: getXpForLevel(level), unlocked: true, mastery: {} };
  }
  return {
    version: '1.0.0', savedAt: Date.now(), totalPlayTime: 0, gameMode: 'standard',
    player: { skills, equipment: { ...EMPTY_EQUIPMENT } },
    bank: { items: [], gp: 0, maxSlots: 24 },
    game: { activeSkill: null, activeActionId: null, activeAreaId: null, activeMonsterId: null },
    settings: {}, attributes: createDefaultAttributes(), gearSets: createEmptyGearSets(),
  };
}

function normalizeSave(save: SaveData | null | undefined, fallbackSkills?: Record<SkillId, SkillState>): SaveData {
  const base = makeEmptySave();
  const originalSkills = save?.player?.skills ?? {};
  const fallback = fallbackSkills && Object.keys(fallbackSkills).length > 0 ? fallbackSkills : undefined;
  const skills = { ...base.player.skills, ...fallback, ...originalSkills } as Record<SkillId, SkillState>;
  return {
    ...base, ...save,
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

function AdminItemIcon({ itemId, size = 34 }: { itemId: string; size?: number }) {
  const item = getItem(itemId);
  const visual = getItemVisual(itemId);
  return (
    <span style={{ width: size, height: size, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#150c04', border: '1px solid ' + C.borderLight, overflow: 'hidden' }}>
      {visual.type === 'image' ? (
        <img src={visual.value} alt={item?.name ?? itemId} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{visual.value}</span>
      )}
    </span>
  );
}

/* ── Выбор предмета из каталога ──────────────────────────────── */

function ItemPickerModal({
  mode,
  equipSlot,
  items,
  onClose,
  onAddInventory,
  onEquip,
}: {
  mode: 'inventory' | 'equip';
  equipSlot?: EquipSlot;
  items: Item[];
  onClose: () => void;
  onAddInventory: (itemId: string, qty: number) => void;
  onEquip: (itemId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const it of items) if (it.category) seen.add(it.category);
    return [...seen].sort();
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      if (mode === 'equip' && equipSlot && it.equipSlot !== equipSlot) return false;
      if (category !== 'all' && it.category !== category) return false;
      if (!q) return true;
      return it.name.toLowerCase().includes(q) || it.id.toLowerCase().includes(q);
    });
  }, [category, equipSlot, items, mode, query]);

  const selectedItem = selected ? items.find(i => i.id === selected) ?? null : null;

  const add = () => {
    if (!selectedItem) return;
    if (mode === 'equip') onEquip(selectedItem.id);
    else onAddInventory(selectedItem.id, clampQty(qty) || 1);
    onClose();
  };

  return (
    <GModal open onClose={onClose} title={mode === 'equip' ? 'Выбрать предмет для слота' : 'Добавить предмет в сумку'} width={760}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: C.slot, border: '1px solid ' + C.borderLight, borderRadius: 12, padding: '8px 12px' }}>
            <Search size={15} style={{ color: C.textMuted }} />
            <input
              autoFocus
              placeholder="Поиск по названию или id…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={BTN}
              style={{ ...BTN_SECONDARY, ...(category === cat ? { background: 'rgba(255,255,255,0.1)', borderColor: C.accent, color: '#fff' } : {}) }}
            >
              {cat === 'all' ? 'Все' : categoryLabel(cat)}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8, paddingRight: 4 }}>
          {visible.map(it => (
            <button
              key={it.id}
              type="button"
              onClick={() => setSelected(it.id)}
              title={it.name}
              style={{
                ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '10px 6px 8px', cursor: 'pointer',
                outline: selected === it.id ? `2px solid ${C.accent}` : 'none',
                outlineOffset: 1,
              }}
            >
              <AdminItemIcon itemId={it.id} size={32} />
              <span style={{ width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 600, color: C.textSecondary, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {it.name}
              </span>
            </button>
          ))}
        </div>

        {selectedItem && (
          <div style={{ ...CARD, padding: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <AdminItemIcon itemId={selectedItem.id} size={44} />
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{selectedItem.name}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--app-font-mono)', color: C.textMuted }}>{selectedItem.id} · {categoryLabel(selectedItem.category)} · {selectedItem.sellValue} GP</div>
            </div>
            {mode === 'inventory' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className={BTN} style={BTN_SECONDARY}><Minus size={14} /></button>
                <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} style={{ ...INPUT, width: 70, textAlign: 'center' }} />
                <button type="button" onClick={() => setQty(q => q + 1)} className={BTN} style={BTN_SECONDARY}><Plus size={14} /></button>
                <button type="button" onClick={add} className={BTN} style={BTN_PRIMARY}><Plus size={14} /> Добавить</button>
              </div>
            ) : (
              <button type="button" onClick={add} className={BTN} style={BTN_PRIMARY}><Swords size={14} /> Надеть</button>
            )}
          </div>
        )}
      </div>
    </GModal>
  );
}

/* ── Основная панель ──────────────────────────────────────────── */

type TabKey = 'overview' | 'skills' | 'inventory' | 'equipment';

export function AdminCharactersPanel() {
  const characters = useCharacterStore(s => s.characters);
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const notify = useNotificationsStore(s => s.notifyInfo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SaveData | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const [saving, setSaving] = useState(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [touched, setTouched] = useState({ skills: false, bank: false, equipment: false });
  const [picker, setPicker] = useState<{ mode: 'inventory' | 'equip'; equipSlot?: EquipSlot } | null>(null);

  const items = useMemo(() => getAllItems().sort((a, b) => a.name.localeCompare(b.name, 'ru')), []);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user && useCharacterStore.getState().characters.length === 0) {
      void useCharacterStore.getState().loadCharacters(user.id);
    }
  }, []);

  const selected = characters.find(c => c.id === selectedId) ?? characters[0] ?? null;

  useEffect(() => {
    if (!selected) { setSelectedId(null); setDraft(null); return; }
    if (selected.id !== selectedId) setSelectedId(selected.id);
    const liveSkills = usePlayerStore.getState().skills as Record<SkillId, SkillState>;
    const fallback = selected.saveData?.player?.skills ? undefined : liveSkills;
    setDraft(normalizeSave(selected.saveData, fallback));
    setTouched({ skills: false, bank: false, equipment: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const dirty = touched.skills || touched.bank || touched.equipment;

  if (!selected || !draft) {
    return (
      <div style={{ ...CARD, padding: 24, textAlign: 'center' }}>
        <User size={32} style={{ margin: '0 auto 8px', color: C.textMuted }} />
        <p style={{ fontSize: 13, color: C.textSecondary }}>Персонажи загружаются…</p>
      </div>
    );
  }

  const patchDraft = (fn: (prev: SaveData) => SaveData) => setDraft(prev => (prev ? fn(prev) : prev));

  const setSkillLevel = (id: SkillId, level: number) => {
    const nextLevel = clampLevel(level);
    setTouched(p => ({ ...p, skills: true }));
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, skills: { ...prev.player.skills, [id]: { ...prev.player.skills[id], level: nextLevel, xp: getXpForLevel(nextLevel) } } },
    }));
  };

  const setSkillXp = (id: SkillId, xp: number) => {
    const clean = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
    setTouched(p => ({ ...p, skills: true }));
    patchDraft(prev => ({
      ...prev,
      player: { ...prev.player, skills: { ...prev.player.skills, [id]: { ...prev.player.skills[id], xp: clean, level: getLevelForXp(clean) } } },
    }));
  };

  const setAllSkillLevels = (level: number) => {
    const target = clampLevel(level);
    setTouched(p => ({ ...p, skills: true }));
    patchDraft(prev => {
      const skills = { ...prev.player.skills };
      for (const id of ALL_SKILL_IDS) skills[id] = { ...(skills[id] ?? { mastery: {} }), level: target, xp: getXpForLevel(target) };
      return { ...prev, player: { ...prev.player, skills } };
    });
  };

  const setGold = (amount: number) => {
    const clean = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
    setTouched(p => ({ ...p, bank: true }));
    patchDraft(prev => ({ ...prev, bank: { ...prev.bank, gp: clean } }));
  };

  const addItemToBank = (itemId: string, qty: number) => {
    const clean = clampQty(qty);
    if (!itemId || clean <= 0) return;
    setTouched(p => ({ ...p, bank: true }));
    patchDraft(prev => {
      const bank = [...prev.bank.items];
      const idx = bank.findIndex(s => s.itemId === itemId);
      if (idx >= 0) bank[idx] = { ...bank[idx], quantity: (bank[idx].quantity || 0) + clean };
      else bank.push({ itemId, quantity: clean, locked: false, tab: 0 });
      return { ...prev, bank: { ...prev.bank, items: bank } };
    });
  };

  const changeItemQty = (itemId: string, delta: number) => {
    if (!itemId) return;
    setTouched(p => ({ ...p, bank: true }));
    patchDraft(prev => {
      const bank = prev.bank.items.map(s => (s.itemId === itemId ? { ...s, quantity: Math.max(0, (s.quantity || 0) + delta) } : s)).filter(s => s.quantity > 0);
      return { ...prev, bank: { ...prev.bank, items: bank } };
    });
  };

  const equipItem = (slot: EquipSlot, itemId: string) => {
    if (!itemId) return;
    setTouched(p => ({ ...p, equipment: true }));
    patchDraft(prev => ({ ...prev, player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: itemId } } }));
  };

  const unequipItem = (slot: EquipSlot) => {
    setTouched(p => ({ ...p, equipment: true }));
    patchDraft(prev => ({ ...prev, player: { ...prev.player, equipment: { ...prev.player.equipment, [slot]: null } } }));
  };

  const save = async () => {
    if (!draft || !selected || saving) return;
    setSaving(true);
    try {
      const fallback = selected.saveData?.player?.skills ? undefined : (usePlayerStore.getState().skills as Record<SkillId, SkillState>);
      const base = normalizeSave(selected.saveData, fallback);
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
      useCharacterStore.setState(state => ({
        characters: state.characters.map(c => (c.id === updated.id ? updated : c)),
        activeCharacter: state.activeCharacter?.id === updated.id ? updated : state.activeCharacter,
      }));
      if (activeCharacter?.id === updated.id) applySaveData(normalizeSave(updated.saveData, usePlayerStore.getState().skills as Record<SkillId, SkillState>));
      notify('Персонаж сохранён');
    } catch (e) {
      notify(`Ошибка сохранения: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const totalLevel = ALL_SKILL_IDS.reduce((sum, id) => sum + (draft.player.skills[id]?.level ?? 1), 0);

  const visibleSkills = skillQuery.trim()
    ? ALL_SKILL_IDS.filter(id => skillNameRu(id).toLowerCase().includes(skillQuery.trim().toLowerCase()))
    : ALL_SKILL_IDS;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Обзор', icon: <LayoutDashboard size={14} /> },
    { key: 'skills', label: 'Навыки', icon: <Boxes size={14} /> },
    { key: 'inventory', label: 'Сумка', icon: <Boxes size={14} /> },
    { key: 'equipment', label: 'Снаряжение', icon: <Swords size={14} /> },
  ];

  return (
    <div className="space-y-3">
      {/* Верхняя панель с выбором персонажа и сохранением */}
      <div style={{ ...CARD, padding: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img
            src={getAvatarPath(selected.avatarId)}
            alt=""
            style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid ' + C.accent, objectFit: 'cover', flexShrink: 0, background: C.slot }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{selected.nickname}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{getRaceLabel(selected.raceId, 'ru')}{selected.id === activeCharacter?.id ? ' · активный' : ''}</div>
          </div>
        </div>

        <select
          value={selected.id}
          onChange={e => setSelectedId(e.target.value)}
          className="flex-1 min-w-[140px]"
          style={{ ...INPUT, fontSize: 12, fontWeight: 600 }}
        >
          {characters.map(c => <option key={c.id} value={c.id}>{c.nickname}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {dirty && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.accent, fontFamily: 'var(--app-font-mono)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, boxShadow: `0 0 6px ${C.accent}` }} />
              есть изменения
            </span>
          )}
          <button id="admin-character-save" type="button" onClick={() => void save()} disabled={saving} className={BTN} style={BTN_PRIMARY}>
            <Save size={14} /> {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={BTN}
            style={{
              ...(tab === t.key ? BTN_PRIMARY : BTN_SECONDARY),
              padding: '8px 14px',
              borderRadius: 10,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Обзор ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { label: 'Общий уровень', value: totalLevel },
            { label: 'Золото', value: formatNumber(draft.bank.gp) },
            { label: 'Слоты сумки', value: `${draft.bank.items.length}/${draft.bank.maxSlots}` },
            { label: 'Активная профессия', value: draft.game.activeSkill ? skillNameRu(draft.game.activeSkill) : '—' },
          ].map(cell => (
            <div key={cell.label} style={{ ...CARD, padding: 14 }}>
              <div style={LABEL}>{cell.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 4, fontFamily: 'var(--app-font-mono)' }}>{cell.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Навыки ── */}
      {tab === 'skills' && (
        <div style={{ ...CARD, padding: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, background: C.slot, border: '1px solid ' + C.borderLight, borderRadius: 10, padding: '7px 10px' }}>
              <Search size={14} style={{ color: C.textMuted }} />
              <input placeholder="Поиск навыка…" value={skillQuery} onChange={e => setSkillQuery(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 12 }} />
            </div>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--app-font-mono)' }}>Всем:</span>
            {[1, 10, 50, 99].map(lv => (
              <button key={lv} type="button" onClick={() => setAllSkillLevels(lv)} className={BTN} style={BTN_SECONDARY}>{lv}</button>
            ))}
            <button type="button" onClick={() => setAllSkillLevels(1)} className={BTN} style={BTN_MUTED} title="Сброс к базе"><RotateCcw size={13} /> База</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {visibleSkills.map(id => {
              const skill = draft.player.skills[id];
              if (!skill) return null;
              const lvl = clampLevel(skill.level);
              return (
                <div key={id} style={{ ...CARD, background: C.slot, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 110, fontSize: 13, fontWeight: 800, color: C.text }}>{skillNameRu(id)}</span>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--app-font-mono)' }}>ур.</span>
                    <input type="number" min={1} max={MAX_LEVEL} value={skill.level} onChange={e => setSkillLevel(id, Number(e.target.value))} style={{ ...INPUT, width: 54, textAlign: 'center' }} />
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--app-font-mono)' }}>xp</span>
                    <input type="number" min={0} step={1} value={skill.xp} onChange={e => setSkillXp(id, Number(e.target.value))} style={{ ...INPUT, width: 90, textAlign: 'center' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setSkillLevel(id, Math.max(1, lvl - 1))} className={BTN} style={BTN_SECONDARY}>−1</button>
                    <button type="button" onClick={() => setSkillLevel(id, lvl + 1)} className={BTN} style={BTN_SECONDARY}>+1</button>
                    <button type="button" onClick={() => setSkillLevel(id, lvl + 10)} className={BTN} style={BTN_SECONDARY}>+10</button>
                    <button type="button" onClick={() => setSkillLevel(id, MAX_LEVEL)} className={BTN} style={BTN_SECONDARY}>MAX</button>
                    <span style={{ width: 8 }} />
                    <button type="button" onClick={() => setSkillXp(id, skill.xp + 1000)} className={BTN} style={BTN_MUTED}>+1К xp</button>
                    <button type="button" onClick={() => setSkillXp(id, skill.xp + 10000)} className={BTN} style={BTN_MUTED}>+10К xp</button>
                    <button type="button" onClick={() => setSkillXp(id, getXpForLevel(MAX_LEVEL))} className={BTN} style={BTN_MUTED}>MAX xp</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Сумка ── */}
      {tab === 'inventory' && (
        <div style={{ ...CARD, padding: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={LABEL}>🪙 Золото</span>
              <input type="number" min={0} value={draft.bank.gp} onChange={e => setGold(Number(e.target.value))} style={{ ...INPUT, width: 120, textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => setGold(Math.max(0, draft.bank.gp - 1000))} className={BTN} style={BTN_SECONDARY}>−1К</button>
              <button type="button" onClick={() => setGold(Math.max(0, draft.bank.gp - 100))} className={BTN} style={BTN_SECONDARY}>−100</button>
              <button type="button" onClick={() => setGold(draft.bank.gp + 100)} className={BTN} style={BTN_SECONDARY}>+100</button>
              <button type="button" onClick={() => setGold(draft.bank.gp + 1000)} className={BTN} style={BTN_SECONDARY}>+1К</button>
            </div>
            <button type="button" onClick={() => setPicker({ mode: 'inventory' })} className={BTN} style={{ ...BTN_PRIMARY, marginLeft: 'auto' }}>
              <Plus size={14} /> Добавить предмет
            </button>
          </div>

          {draft.bank.items.length === 0 ? (
            <p style={{ fontSize: 12, color: C.textMuted, padding: '12px 0' }}>Сумка пуста. Нажми «Добавить предмет», чтобы выбрать предмет из каталога.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {draft.bank.items.map((slot: BankSlot, i: number) => {
                const item = getItem(slot.itemId);
                return (
                  <div key={`${slot.itemId}-${i}`} style={{ ...CARD, background: C.slot, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <AdminItemIcon itemId={slot.itemId} size={34} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item?.name ?? slot.itemId}</div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: C.textMuted }}>×{formatNumber(slot.quantity)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => changeItemQty(slot.itemId, -1)} className={BTN} style={BTN_SECONDARY}><Minus size={13} /></button>
                      <button type="button" onClick={() => changeItemQty(slot.itemId, +1)} className={BTN} style={BTN_SECONDARY}><Plus size={13} /></button>
                      <button type="button" onClick={() => changeItemQty(slot.itemId, -slot.quantity)} className={BTN} style={BTN_MUTED} title="Убрать всё"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Снаряжение ── */}
      {tab === 'equipment' && (
        <div style={{ ...CARD, padding: 12 }}>
          <p style={{ fontSize: 12, color: C.textSecondary, marginBottom: 10 }}>Выбери слот, чтобы назначить предмет из каталога. Клик по занятому слоту — сменить, кнопка «снять» — освободить.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {EQUIP_SLOTS.map(slot => {
              const eqId = draft.player.equipment[slot];
              const eq = eqId ? getItem(eqId) : null;
              return (
                <div key={slot} style={{ ...CARD, background: C.slot, padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <AdminItemIcon itemId={eqId ?? ''} size={34} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 10, ...LABEL, marginBottom: 2 }}>{EQUIP_SLOT_LABELS[slot]}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: eq ? C.text : C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {eq?.name ?? (eqId ? eqId : 'пусто')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button type="button" onClick={() => setPicker({ mode: 'equip', equipSlot: slot })} className={BTN} style={{ ...BTN_SECONDARY, flex: 1 }}>
                      {eq ? 'Сменить' : 'Надеть'}
                    </button>
                    {eq && <button type="button" onClick={() => unequipItem(slot)} className={BTN} style={BTN_MUTED} title="Снять"><Trash2 size={13} /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {picker && (
        <ItemPickerModal
          mode={picker.mode}
          equipSlot={picker.equipSlot}
          items={picker.mode === 'equip' && picker.equipSlot ? items.filter(i => i.equipSlot === picker.equipSlot) : items}
          onClose={() => setPicker(null)}
          onAddInventory={(id, qty) => addItemToBank(id, qty)}
          onEquip={(id) => picker.equipSlot ? equipItem(picker.equipSlot, id) : undefined}
        />
      )}
    </div>
  );
}
