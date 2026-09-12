import React, { useEffect, useState } from 'react';
import { getItem } from '@/domain/items';
import { AdminItemEditor } from '@/features/admin/AdminItemEditor';
import type { Item } from '@/data/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemRarity } from '@/features/inventory/ItemIcon';
import { isGearUnique } from '@/data/balance/gear';
import { BRANCHES, BRANCH_IDS, type BranchId } from '@/domain/attributes/attributes';
import { substatDisplay } from '@/domain/attributes/characterAttributes';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay, formatCoinsText } from '@/shared/ui/CoinsDisplay';
import { TierBadge } from '@/shared/ui/kit/TierBadge';
import { UniqueEmblem } from '@/shared/ui/kit/UniqueEmblem';
import { RarityBadge, type RarityType } from '@/shared/ui/kit/RarityBadge';
import { AWindow } from '@/shared/ui/kit/AWindow';
import {
  Lock,
  Unlock,
  Coins,
  Heart,
  Sword,
  Shield,
  Zap,
  Star,
  Minus,
  Plus,
  Utensils,
  Trash2,
} from 'lucide-react';

/** Иконка подхарактеристики для мелких ячеек (без новых зависимостей). */
const BONUS_ICON: Partial<Record<BranchId, React.ReactNode>> = {
  health: <Heart className="w-3 h-3" />,
  strike: <Sword className="w-3 h-3" />,
  armor: <Shield className="w-3 h-3" />,
  will: <Shield className="w-3 h-3" />,
  evasion: <Shield className="w-3 h-3" />,
  tempo: <Zap className="w-3 h-3" />,
  reaction: <Zap className="w-3 h-3" />,
  onslaught: <Zap className="w-3 h-3" />,
  destruction: <Sword className="w-3 h-3" />,
  luck: <Star className="w-3 h-3" />,
  resourcefulness: <Zap className="w-3 h-3" />,
  intuition: <Star className="w-3 h-3" />,
};

/**
 * Мелкая ячейка характеристики (решение владельца 2026-09-12: цена/прочность
 * и бонусы предмета — в одинаковых компактных ячейках, все поменьше).
 */
function MiniStat({
  icon, label, children, tone = 'gold', title,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: 'gold' | 'green' | 'glass';
  title?: string;
}) {
  const ink = tone === 'gold' ? 'var(--text-gold)'
    : tone === 'green' ? 'var(--badge-green-ink)'
      : 'var(--text-primary)';
  const edge = tone === 'gold' ? 'var(--tag-gold-edge)'
    : tone === 'green' ? 'var(--tag-green-edge)'
      : 'var(--glass-edge)';
  return (
    <div
      title={title}
      className="flex items-center gap-2 rounded-xl px-2 py-1.5 border min-w-0"
      style={{ background: 'var(--stat-bg)', borderColor: edge, boxShadow: 'var(--stat-shadow)' }}
    >
      {icon && (
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[var(--text-gold)]"
          style={{ background: 'var(--tag-gold-bg)' }}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[9px] text-[var(--text-muted)] font-mono uppercase font-bold tracking-wide truncate">
          {label}
        </span>
        <span className="block text-[11px] font-mono font-black truncate" style={{ color: ink }}>
          {children}
        </span>
      </span>
    </div>
  );
}

export function getItemTier(itemId: string, item?: Item): string {
  // Правило владельца: тировый бейдж — только у экипировки (оружие, броня,
  // бижутерия). У уника вместо бейджа только звезда-эмблема, у обычных
  // предметов и ресурсов бейджа нет вообще — возвращаем пусто.
  if (!item || isGearUnique(item) || !item.equipSlot) return '';
  // Тир — данное поле каталога (1..12). Ниже — эвристика только для легаси
  // предметов без поля `tier` (исчезнет по мере переноса семейств в каталог).
  if (item?.tier) return `T${item.tier}`;
  const id = itemId.toLowerCase();
  if (id.includes('dragon')) return 'T7';
  if (id.includes('runite') || id.includes('rune_')) return 'T6';
  if (id.includes('adamant')) return 'T5';
  if (id.includes('mithril')) return 'T4';
  if (id.includes('steel')) return 'T3';
  if (id.includes('iron')) return 'T2';
  if (id.includes('bronze')) return 'T1';
  
  const val = item?.sellValue ?? 0;
  if (val >= 5000) return 'T7';
  if (val >= 1000) return 'T6';
  if (val >= 350) return 'T5';
  if (val >= 120) return 'T4';
  if (val >= 40) return 'T3';
  if (val >= 15) return 'T2';
  return 'T1';
}

const CATEGORY_NAMES: Record<string, string> = {
  weapon: 'Оружие',
  helm: 'Шлем',
  platebody: 'Доспех',
  platelegs: 'Поножи',
  boots: 'Сапоги',
  gloves: 'Перчатки',
  amulet: 'Амулет',
  ring: 'Кольцо',
  bracelet: 'Браслет',
  belt: 'Пояс',
  shield: 'Щит',
  cape: 'Плащ',
  quiver: 'Колчан',
  food: 'Еда',
  cooked_fish: 'Готовая рыба',
  raw_fish: 'Сырая рыба',
  log: 'Древесина',
  ore: 'Руда',
  bar: 'Слиток',
  gem: 'Самоцвет',
  ash: 'Зола',
  potion: 'Зелье',
  misc: 'Материал',
  mineral: 'Минерал',
  foraging: 'Сбор',
};

/** Бонус предмета в единице показа: flat — очки, rating/percent — проценты. */
function bonusText(id: BranchId, raw: number): string {
  const d = substatDisplay(id, raw);
  const rounded = Math.round(Math.abs(d.value) * 10) / 10;
  const num = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  const sign = raw > 0 ? '+' : raw < 0 ? '−' : '';
  return d.unit === 'percent' ? `${sign}${num}%` : `${sign}${num}`;
}

interface UniversalInfoModalProps {
  itemId: string | null;
  onClose: () => void;
  /**
   * Режим просмотра из админ-каталога: показываем название/описание/статы,
   * но прячем игровые действия (запереть/надеть/съесть/продать).
   */
  readOnly?: boolean;
  /** Админ-режим: карточка становится редактируемой (имя/описание/цена/статы/тир/…). */
  adminEditable?: boolean;
}

export function UniversalInfoModal({ itemId, onClose, readOnly = false, adminEditable = false }: UniversalInfoModalProps) {
  const { t } = useTranslation();
  const isReadOnly = readOnly;

  const item = itemId ? getItem(itemId) : undefined;

  const slot = useInventoryStore(s => itemId ? s.getSlot(itemId) : undefined);
  const lockItem = useInventoryStore(s => s.lockItem);
  const sellItem = useInventoryStore(s => s.sellItem);
  const removeItem = useInventoryStore(s => s.removeItem);
  const addItem = useInventoryStore(s => s.addItem);
  
  const equipment = usePlayerStore(s => s.equipment);
  const equipItem = usePlayerStore(s => s.equipItem);
  const unequipItem = usePlayerStore(s => s.unequipItem);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  
  const eatFood = useCombatStore(s => s.eatFood);
  const playerHp = useCombatStore(s => s.playerHp);
  const playerMaxHp = useCombatStore(s => s.playerMaxHp);

  const [sellQty, setSellQty] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // «Корзина» в модалке (2026-09-12): защита от случайного клика —
  // подтверждение живёт 3 секунды и сбрасывается при смене предмета.
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);
  useEffect(() => {
    setConfirmDelete(false);
  }, [itemId]);

  if (!itemId || !item) return null;

  const quantity = isReadOnly ? 1 : slot?.quantity ?? 1;
  const isLocked = slot?.locked ?? false;
  const tier = getItemTier(itemId, item);
  const rarityKey = getItemRarity(itemId, item.sellValue, item.equipSlot, item.tier) as RarityType;
  const visual = getItemVisual(itemId);
  const categoryLabel = CATEGORY_NAMES[item.category] || item.category;

  // Бонусы предмета к 12 подхарактеристикам (настоящая ось каталога;
  // легаси combatStats не показываем — в расчёт персонажа они не входят).
  const bonusEntries = (Object.entries(item.substatBonuses ?? {}) as [BranchId, number][])
    .filter(([, raw]) => typeof raw === 'number' && raw !== 0)
    .sort((a, b) => BRANCH_IDS.indexOf(a[0]) - BRANCH_IDS.indexOf(b[0]));

  const equippedSlot = item.equipSlot
    ? equipment[item.equipSlot] === itemId
      ? item.equipSlot
      : item.equipSlot === 'ring' && equipment.ring2 === itemId
        ? 'ring2'
        : item.equipSlot === 'bracelet' && equipment.bracelet2 === itemId
          ? 'bracelet2'
          : null
    : null;
  const isEquipped = Boolean(equippedSlot);

  const handleEquip = () => {
    if (!item.equipSlot) return;
    const oldItem = equipItem(itemId, item.equipSlot);
    removeItem(itemId, 1);
    if (oldItem) addItem(oldItem, 1);
    onClose();
  };

  const handleUnequip = () => {
    if (!item.equipSlot) return;
    const unequipped = unequipItem(item.equipSlot);
    if (unequipped) addItem(unequipped, 1);
    onClose();
  };

  const handleEat = () => {
    if (!item.healAmount) return;
    eatFood(itemId);
  };

  const handleSell = (qty: number) => {
    if (isLocked) return;
    const sold = Math.min(qty, quantity);
    const earned = sellItem(itemId, qty);
    // Решение владельца 2026-09-12: цены в кнопках продажи не дублируем —
    // заработанная сумма объявляется тостом после продажи.
    if (earned > 0) {
      notifyInfo(`Продано «${item.name}»${sold > 1 ? ` ×${formatNumber(sold)}` : ''} — заработано ${formatCoinsText(earned)}`);
    }
    if (qty >= quantity) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (removeItem(itemId, quantity)) {
      notifyInfo(`Удалено «${item.name}»${quantity > 1 ? ` ×${formatNumber(quantity)}` : ''}`);
      onClose();
    } else {
      setConfirmDelete(false);
    }
  };

  return (
    // Каркас единый — kit/AWindow (стекло эталона, шаг 8 аудита);
    // внутренние секции попапа неизменны.
    <AWindow
      open
      onClose={onClose}
      width={400}
      title={
        <span className="flex items-center gap-2">
          <span className="text-xs font-mono font-black text-[var(--ink-strong)] uppercase tracking-wider">
            {item.equipSlot ? 'Снаряжение' : 'Предмет'}
          </span>
          {tier ? <TierBadge tier={tier} size="sm" /> : null}
          {isGearUnique(item) && <UniqueEmblem size="sm" />}
        </span>
      }
      headerActions={
        !isReadOnly ? (
          <button
            type="button"
            onClick={() => lockItem(itemId, !isLocked)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isLocked
                ? '[background:var(--badge-gold-bg)] text-[var(--text-gold)] border [border-color:var(--border-accent)] [box-shadow:var(--unique-glow)]'
                : 'text-[var(--cinematic-copy)] hover:text-[var(--cinematic-gold)] hover:[background:rgba(224,168,70,0.12)] border border-transparent'
            }`}
            title={isLocked ? 'Заперто от продажи' : 'Запереть предмет'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Hero Visual & Name Row */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-20 h-20 rounded-2xl border [border-color:var(--card-edge)] [background:var(--cell-frame)] flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden">
            {visual.type === 'image' ? (
              <img src={visual.value} alt={item.name} className="w-full h-full max-w-[80%] max-h-[80%] object-contain select-none pointer-events-none p-1" />
            ) : (
              <span className="drop-shadow-md">{visual.value}</span>
            )}
            {quantity > 1 && (
              <span className="absolute bottom-1.5 right-1.5 z-10 [background:var(--bg-header)] border [border-color:var(--border-accent)] text-[var(--text-gold)] font-mono text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow-md pointer-events-none">
                x{formatNumber(quantity)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <RarityBadge rarity={rarityKey} size="sm" />
            </div>
            <h2 className="text-base sm:text-lg font-display font-black text-[var(--ink-strong)] truncate">
              {item.name}
            </h2>
            <p className="text-xs text-[var(--ink-body)] font-medium">
              {categoryLabel}
            </p>
          </div>
        </div>

        {/* Описание — сразу под именем (решение владельца 2026-09-12) */}
        <p className="text-xs text-[var(--ink-body)] italic [background:var(--card-cocoa-deep)] p-2.5 rounded-xl border [border-color:var(--card-edge)] leading-relaxed">
          {item.description ?? 'Классический предмет средневекового мира.'}
        </p>

        {/* Характеристики — компактные ячейки: цена/прочность/лечение + бонусы предмета */}
        <div className="grid grid-cols-2 gap-1.5">
          <MiniStat
            icon={<Coins className="w-3 h-3" />}
            label="Цена за 1 шт."
          >
            <CoinsDisplay amount={item.sellValue} size="xs" />
          </MiniStat>

          {typeof item.maxDurability === 'number' && item.maxDurability > 0 && (
            <MiniStat
              icon={<Shield className="w-3 h-3" />}
              label="Прочность"
            >
              {item.maxDurability}/{item.maxDurability}
            </MiniStat>
          )}

          {item.healAmount !== undefined && (
            <MiniStat
              icon={<Heart className="w-3 h-3 fill-current" />}
              label="Лечение"
              tone="green"
            >
              +{item.healAmount} ОЗ
            </MiniStat>
          )}

          {bonusEntries.map(([id, raw]) => (
            <MiniStat
              key={id}
              icon={BONUS_ICON[id]}
              label={BRANCHES[id].nameRu}
              tone="gold"
              title={`Бонус предмета: ${raw > 0 ? '+' : ''}${raw} (${BRANCHES[id].ruleRu.split('.')[0].toLowerCase()})`}
            >
              {bonusText(id, raw)}
            </MiniStat>
          ))}
        </div>

        {/* ── Админ-редактор предмета ─────────────────────────── */}
        {adminEditable && (
          <div style={{ borderTop: '1px solid var(--glass-edge)', paddingTop: 10 }}>
            <AdminItemEditor itemId={itemId} />
          </div>
        )}

        {/* Action Controls Section */}
        {!isReadOnly && (
        <div className="space-y-1.5 pt-2 border-t [border-color:var(--glass-edge)]">

          {item.equipSlot && (
            <button
              type="button"
              onClick={isEquipped ? handleUnequip : handleEquip}
              className={`w-full h-8 px-3 rounded-lg font-extrabold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                isEquipped
                  ? '[background:var(--btn-secondary)] hover:brightness-110 text-[var(--badge-red-ink)] [border-color:var(--badge-red-edge)]'
                  : '[background:var(--btn-primary)] hover:brightness-110 text-[var(--btn-primary-ink)] [border-color:var(--btn-primary-edge)] [box-shadow:var(--btn-primary-shadow)]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isEquipped ? 'Снять снаряжение' : 'Надеть предмет'}</span>
            </button>
          )}

          {item.healAmount !== undefined && (
            <button
              type="button"
              onClick={handleEat}
              disabled={playerHp >= playerMaxHp}
              className="w-full h-8 px-3 rounded-lg [background:var(--btn-secondary)] hover:brightness-110 text-[var(--badge-green-ink)] border [border-color:var(--accent-emerald)] font-extrabold text-[11px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Съесть (+{item.healAmount} ОЗ)</span>
            </button>
          )}

          {item.canSell && (
            <div className="space-y-1.5">
              {isLocked ? (
                <div className="w-full h-8 px-2.5 [background:var(--badge-gold-bg)] border [border-color:var(--tag-gold-edge)] rounded-lg flex items-center justify-center">
                  <span className="text-[11px] font-mono font-bold text-[var(--text-gold)] flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3" /> Заперто — продажа заблокирована
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {quantity > 1 && (
                      <div className="flex items-center [background:var(--field-bg)] border [border-color:var(--card-edge)] rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.max(1, sellQty - 1))}
                          className="w-6 h-6 rounded-md [background:var(--btn-secondary)] hover:brightness-125 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-[11px] font-black text-[var(--text-gold)]">
                          {sellQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.min(quantity, sellQty + 1))}
                          className="w-6 h-6 rounded-md [background:var(--btn-secondary)] hover:brightness-125 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSell(sellQty)}
                      className="flex-1 h-8 px-3 rounded-lg [background:var(--btn-secondary)] hover:brightness-110 text-[var(--text-gold)] border [border-color:var(--tag-gold-edge)] font-extrabold text-[11px] transition-all active:scale-95 flex items-center justify-center"
                    >
                      <span>Продать {quantity > 1 ? `(${sellQty} шт.)` : ''}</span>
                    </button>
                  </div>

                  {quantity > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSell(quantity)}
                      className="w-full h-7 px-3 rounded-lg bg-transparent border [border-color:var(--card-edge)] hover:[border-color:var(--border-accent)] text-[var(--text-muted)] hover:text-[var(--text-gold)] font-bold text-[11px] font-mono transition-all active:scale-95 flex items-center justify-center"
                    >
                      <span>Продать всё (x{formatNumber(quantity)})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-0.5">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLocked}
                title={isLocked ? 'Заперто — удаление заблокировано' : 'Удалить предмет'}
                className="w-8 h-8 rounded-lg bg-transparent border [border-color:var(--card-edge)] hover:[border-color:var(--badge-red-edge)] text-[var(--text-muted)] hover:text-[var(--badge-red-ink)] transition-all active:scale-95 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                title="Подтвердить удаление"
                className="h-8 px-3 rounded-lg [background:var(--badge-red-bg)] border [border-color:var(--badge-red-edge)] text-[var(--badge-red-ink)] font-extrabold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить ×{formatNumber(quantity)}?</span>
              </button>
            )}
            <button
              type="button"
              onClick={confirmDelete ? () => setConfirmDelete(false) : onClose}
              className="flex-1 h-7 px-3 rounded-lg bg-transparent hover:[background:var(--badge-gray-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] font-semibold transition-all active:scale-95"
            >
              {confirmDelete ? 'Отмена' : 'Закрыть'}
            </button>
          </div>

        </div>
        )}

        {/* Читаем из админки: нет игровых действий, только кнопка закрыть */}
        {isReadOnly && (
          <div className="space-y-1.5 pt-2 border-t [border-color:var(--glass-edge)]">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-7 px-3 rounded-lg bg-transparent hover:[background:var(--badge-gray-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] font-semibold transition-all active:scale-95"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </AWindow>
  );
}
