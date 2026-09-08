import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { getAdminItem } from '@/domain/items';
import { useAdminConfigStore, type ItemOverride } from '@/store/adminConfigStore';
import type { Item, EquipSlot, ItemCategory } from '@/data/types';
import { Save, RotateCcw, X } from 'lucide-react';

const CATEGORY_NAMES: Record<string, string> = {
  weapon: 'Оружие', helm: 'Шлем', platebody: 'Доспех', platelegs: 'Поножи',
  boots: 'Сапоги', gloves: 'Перчатки', amulet: 'Амулет', ring: 'Кольцо',
  bracelet: 'Браслет', belt: 'Пояс', shield: 'Щит', cape: 'Плащ', quiver: 'Колчан',
  food: 'Еда', cooked_fish: 'Готовая рыба', raw_fish: 'Сырая рыба', log: 'Древесина',
  ore: 'Руда', bar: 'Слиток', gem: 'Самоцвет', ash: 'Зола', potion: 'Зелье',
  misc: 'Материал', mineral: 'Минерал', foraging: 'Сбор',
};

const CATEGORY_OPTIONS: ItemCategory[] = [
  'weapon', 'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'ring', 'bracelet', 'belt', 'shield', 'cape',
  'food', 'herb', 'seed', 'bar', 'ore', 'log', 'rune',
  'potion', 'raw_fish', 'cooked_fish', 'gem', 'misc', 'bone', 'ash', 'arrow', 'tablet',
  'mineral', 'foraging',
];

const EQUIP_SLOT_OPTIONS: (EquipSlot | '')[] = [
  '', 'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'belt',
  'weapon', 'shield', 'cape', 'quiver', 'passive',
];

type SectionKey = 'text' | 'price' | 'base' | 'icon' | 'flags' | 'equip' | 'stats';

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: 'text', label: 'Название', icon: '✏️' },
  { key: 'price', label: 'Цена', icon: '🪙' },
  { key: 'base', label: 'Тир/категория', icon: '🗂️' },
  { key: 'icon', label: 'Иконка', icon: '🖼️' },
  { key: 'flags', label: 'Параметры', icon: '⚙️' },
  { key: 'equip', label: 'Снаряжение', icon: '🛡️' },
  { key: 'stats', label: 'Статы', icon: '📈' },
];

interface AdminEditState {
  name: string;
  description: string;
  category: ItemCategory;
  tier: string;
  sellValue: string;
  buyValue: string;
  canSell: boolean;
  stackable: boolean;
  healAmount: string;
  equipSlot: string;
  twoHanded: boolean;
  icon: string;
  iconPath: string;
  attackBonus: string;
  strengthBonus: string;
  defenceBonus: string;
}

const toStr = (v: number | undefined): string => (v === undefined || Number.isNaN(v) ? '' : String(v));
const toOptNum = (v: string): number | undefined => {
  const n = Number(v);
  return v.trim() === '' || !Number.isFinite(n) ? undefined : n;
};

function initialForm(item?: Item): AdminEditState {
  const cs = item?.combatStats;
  return {
    name: item?.name ?? '',
    description: item?.description ?? '',
    category: item?.category ?? 'misc',
    tier: item?.tier ? String(item.tier) : '',
    sellValue: toStr(item?.sellValue ?? 0),
    buyValue: toStr(item?.buyValue),
    canSell: item?.canSell ?? false,
    stackable: item?.stackable ?? false,
    healAmount: toStr(item?.healAmount),
    equipSlot: item?.equipSlot ?? '',
    twoHanded: item?.twoHanded ?? false,
    icon: item?.icon ?? '',
    iconPath: item?.iconPath ?? '',
    attackBonus: toStr(cs?.attackBonus),
    strengthBonus: toStr(cs?.strengthBonus),
    defenceBonus: toStr(cs?.defenceBonus),
  };
}

const field: CSSProperties = {
  width: '100%',
  background: 'var(--bg-slot)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  padding: '6px 8px',
  fontSize: 12,
  color: 'var(--text-primary)',
  fontFamily: 'var(--app-font-mono)',
  outline: 'none',
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontFamily: 'var(--app-font-mono)',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.04,
};

function Section({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div style={{ background: '#1a1207', border: '1px solid #3a2b1a', borderRadius: 12, padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--app-font-mono)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.05 }}>{title}</span>
        <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)', padding: 2 }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = 'text', min, max }: { label: string; value: string; onChange: (v: string) => void; type?: string; min?: number; max?: number }) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} min={min} max={max} value={value} onChange={e => onChange(e.target.value)} style={{ ...field, marginTop: 3 }} />
    </label>
  );
}

export function AdminItemEditor({ itemId, onChanged }: { itemId: string; onChanged?: () => void }) {
  const updateItemOverride = useAdminConfigStore(s => s.updateItemOverride);
  const resetItemOverride = useAdminConfigStore(s => s.resetItemOverride);
  const itemOverrides = useAdminConfigStore(s => s.itemOverrides);
  const item = itemId ? getAdminItem(itemId) : undefined;
  const hasOverride = Boolean(itemId && itemOverrides[itemId]);

  const [form, setForm] = useState<AdminEditState>(() => initialForm(item));
  const [open, setOpen] = useState<SectionKey | null>(null);

  useEffect(() => {
    setForm(initialForm(getAdminItem(itemId)));
    setOpen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (!itemId || !item) return null;

  const setField = <K extends keyof AdminEditState>(key: K, value: AdminEditState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggle = (key: SectionKey) => setOpen(prev => (prev === key ? null : key));

  const handleSave = () => {
    const combatStats: NonNullable<ItemOverride['combatStats']> = {};
    const combatFields = [
      ['attackBonus', 'attackBonus'],
      ['strengthBonus', 'strengthBonus'],
      ['defenceBonus', 'defenceBonus'],
    ] as const;
    for (const [formKey, statKey] of combatFields) {
      const value = toOptNum(form[formKey]);
      if (value !== undefined) combatStats[statKey] = value;
    }

    const tierNum = toOptNum(form.tier);
    const patch: ItemOverride = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      tier: tierNum !== undefined && tierNum >= 1 && tierNum <= 12 ? Math.round(tierNum) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 : undefined,
      sellValue: toOptNum(form.sellValue),
      buyValue: toOptNum(form.buyValue),
      canSell: form.canSell,
      stackable: form.stackable,
      healAmount: toOptNum(form.healAmount),
      equipSlot: form.equipSlot ? form.equipSlot as EquipSlot : undefined,
      twoHanded: form.twoHanded,
      icon: form.icon.trim(),
      iconPath: form.iconPath.trim(),
      combatStats: Object.keys(combatStats).length > 0 ? combatStats : undefined,
    };

    updateItemOverride(itemId, patch);
    onChanged?.();
    setOpen(null);
  };

  const handleReset = () => {
    resetItemOverride(itemId);
    setForm(initialForm(getAdminItem(itemId)));
    setOpen(null);
  };

  const showEquip = Boolean(item.equipSlot || item.healAmount !== undefined);
  const showStats = Boolean(item.equipSlot || Object.keys(item.combatStats ?? {}).length > 0);

  const sections = SECTIONS.filter(s => (s.key === 'equip' ? showEquip : s.key === 'stats' ? showStats : true));

  const inputLabel = labelStyle;

  return (
    <div>
      {/* Быстрые разделы */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {sections.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => toggle(section.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 8px',
              borderRadius: 10, fontSize: 11, fontFamily: 'var(--app-font-mono)',
              color: open === section.key ? 'var(--text-primary)' : 'var(--text-muted)',
              background: open === section.key ? '#3a2b1a' : 'var(--bg-slot)',
              border: open === section.key ? '1px solid #8a5a10' : '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13 }}>{section.icon}</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {open === 'text' && (
          <Section title="Название и описание" onClose={() => setOpen(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <LabeledInput label="Название" value={form.name} onChange={v => setField('name', v)} />
              <label>
                <span style={inputLabel}>Описание</span>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} style={{ ...field, marginTop: 3, resize: 'vertical' }} />
              </label>
            </div>
          </Section>
        )}

        {open === 'price' && (
          <Section title="Цена" onClose={() => setOpen(null)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <LabeledInput label="Продажа" type="number" min={0} value={form.sellValue} onChange={v => setField('sellValue', v)} />
              <LabeledInput label="Покупка" type="number" min={0} value={form.buyValue} onChange={v => setField('buyValue', v)} />
            </div>
          </Section>
        )}

        {open === 'base' && (
          <Section title="Тир и категория" onClose={() => setOpen(null)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <label style={{ minWidth: 0 }}>
                <span style={inputLabel}>Тир</span>
                <input type="number" min={1} max={12} value={form.tier} onChange={e => setField('tier', e.target.value)} style={{ ...field, marginTop: 3 }} />
              </label>
              <label style={{ minWidth: 0 }}>
                <span style={inputLabel}>Категория</span>
                <select value={form.category} onChange={e => setField('category', e.target.value as ItemCategory)} style={{ ...field, marginTop: 3 }}>
                  {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{CATEGORY_NAMES[cat] ?? cat}</option>)}
                </select>
              </label>
            </div>
          </Section>
        )}

        {open === 'icon' && (
          <Section title="Иконка" onClose={() => setOpen(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <LabeledInput label="Эмодзи (запасной вариант)" value={form.icon} onChange={v => setField('icon', v)} />
              <LabeledInput label="Путь к картинке (iconPath)" value={form.iconPath} onChange={v => setField('iconPath', v)} />
            </div>
          </Section>
        )}

        {open === 'flags' && (
          <Section title="Параметры" onClose={() => setOpen(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([
                ['canSell', 'Продаётся'],
                ['stackable', 'Стакается'],
                ['twoHanded', 'Двуручное'],
              ] as const).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setField(key, e.target.checked)} style={{ accentColor: '#d4a017' }} />
                  {label}
                </label>
              ))}
            </div>
          </Section>
        )}

        {open === 'equip' && (
          <Section title="Снаряжение и лечение" onClose={() => setOpen(null)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <label style={{ minWidth: 0 }}>
                <span style={inputLabel}>Слот</span>
                <select value={form.equipSlot} onChange={e => setField('equipSlot', e.target.value)} style={{ ...field, marginTop: 3 }}>
                  {EQUIP_SLOT_OPTIONS.map(slot => <option key={slot} value={slot}>{slot ? slot : '— нет —'}</option>)}
                </select>
              </label>
              <LabeledInput label="Лечение (ОЗ)" type="number" min={0} value={form.healAmount} onChange={v => setField('healAmount', v)} />
            </div>
          </Section>
        )}

        {open === 'stats' && (
          <Section title="Боевые статы" onClose={() => setOpen(null)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {([
                ['attackBonus', 'Атака'],
                ['strengthBonus', 'Сила'],
                ['defenceBonus', 'Защита'],
              ] as const).map(([key, label]) => (
                <LabeledInput key={key} label={label} type="number" value={form[key]} onChange={v => setField(key, v)} />
              ))}
            </div>
          </Section>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {hasOverride && (
          <button type="button" onClick={handleReset} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px',
            borderRadius: 10, fontSize: 11, fontFamily: 'var(--app-font-mono)', fontWeight: 700,
            color: 'var(--text-muted)', background: 'var(--bg-slot)', border: '1px solid var(--border-default)',
            cursor: 'pointer',
          }}>
            <RotateCcw className="w-3.5 h-3.5" />
            Сброс
          </button>
        )}
        <button type="button" onClick={handleSave} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px',
          borderRadius: 10, fontSize: 11, fontFamily: 'var(--app-font-mono)', fontWeight: 800,
          color: '#231302', background: 'linear-gradient(180deg,#e0a32e,#b97710)',
          border: '1px solid #8a5a10', boxShadow: '0 2px 0 #5a3408', cursor: 'pointer',
        }}>
          <Save className="w-3.5 h-3.5" />
          Сохранить
        </button>
      </div>
    </div>
  );
}
