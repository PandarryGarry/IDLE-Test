import type { Item } from '../../data/types.ts';

/**
 * Мелворовское наследие: легаси-снаряжение БЕЗ своих картинок (только
 * эмодзи/силуэт). Живёт здесь исключительно для совместимости старых
 * сейвов и таблиц дропов — в каталог/админку не выводится (см. `getAllItems`
 * в `domain/items/index.ts`), там только настоящие предметы с картинками.
 */
const ITEMS: Record<string, Item> = {
  // ── Weapons ─────────────────────────────────────────────────
  bronze_sword:   { id: 'bronze_sword',   name: 'Bronze Sword',   category: 'weapon', equipSlot: 'weapon', sellValue: 50,    canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 7,  strengthBonus: 8  } },
  iron_sword:     { id: 'iron_sword',     name: 'Iron Sword',     category: 'weapon', equipSlot: 'weapon', sellValue: 150,   canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 10, strengthBonus: 12 } },
  steel_sword:    { id: 'steel_sword',    name: 'Steel Sword',    category: 'weapon', equipSlot: 'weapon', sellValue: 500,   canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 15, strengthBonus: 18 } },
  mithril_sword:  { id: 'mithril_sword',  name: 'Mithril Sword',  category: 'weapon', equipSlot: 'weapon', sellValue: 2000,  canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 25, strengthBonus: 30 } },
  adamant_sword:  { id: 'adamant_sword',  name: 'Adamant Sword',  category: 'weapon', equipSlot: 'weapon', sellValue: 8000,  canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 35, strengthBonus: 42 } },
  rune_sword:     { id: 'rune_sword',     name: 'Rune Sword',     category: 'weapon', equipSlot: 'weapon', sellValue: 25000, canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 45, strengthBonus: 54 } },
  dragon_sword:   { id: 'dragon_sword',   name: 'Dragon Sword',   category: 'weapon', equipSlot: 'weapon', sellValue: 80000, canSell: true, stackable: false, icon: '🐉', combatStats: { attackBonus: 60, strengthBonus: 72 } },
  // ── Helms ───────────────────────────────────────────────────
  bronze_helm:    { id: 'bronze_helm',    name: 'Bronze Helm',    category: 'helm', equipSlot: 'helm', sellValue: 30,    canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 5  } },
  iron_helm:      { id: 'iron_helm',      name: 'Iron Helm',      category: 'helm', equipSlot: 'helm', sellValue: 100,   canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 8  } },
  steel_helm:     { id: 'steel_helm',     name: 'Steel Helm',     category: 'helm', sellValue: 350,   canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 12 } },
  mithril_helm:   { id: 'mithril_helm',   name: 'Mithril Helm',   category: 'helm', sellValue: 1500,  canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 20 } },
  adamant_helm:   { id: 'adamant_helm',   name: 'Adamant Helm',   category: 'helm', equipSlot: 'helm', sellValue: 5000,  canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 30 } },
  rune_helm:      { id: 'rune_helm',      name: 'Rune Helm',      category: 'helm', equipSlot: 'helm', sellValue: 18000, canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 40 } },
  dragon_helm:    { id: 'dragon_helm',    name: 'Dragon Helm',    category: 'helm', equipSlot: 'helm', sellValue: 60000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 55 } },
  // ── Platebodies ──────────────────────────────────────────────
  bronze_platebody:   { id: 'bronze_platebody',   name: 'Bronze Platebody',   category: 'platebody', equipSlot: 'platebody', sellValue: 150,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 15  } },
  iron_platebody:     { id: 'iron_platebody',     name: 'Iron Platebody',     category: 'platebody', equipSlot: 'platebody', sellValue: 500,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 25  } },
  steel_platebody:    { id: 'steel_platebody',    name: 'Steel Platebody',    category: 'platebody', equipSlot: 'platebody', sellValue: 1500,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 40  } },
  mithril_platebody:  { id: 'mithril_platebody',  name: 'Mithril Platebody',  category: 'platebody', equipSlot: 'platebody', sellValue: 6000,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 60  } },
  adamant_platebody:  { id: 'adamant_platebody',  name: 'Adamant Platebody',  category: 'platebody', equipSlot: 'platebody', sellValue: 20000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 80  } },
  rune_platebody:     { id: 'rune_platebody',     name: 'Rune Platebody',     category: 'platebody', equipSlot: 'platebody', sellValue: 65000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 105 } },
  dragon_platebody:   { id: 'dragon_platebody',   name: 'Dragon Platebody',   category: 'platebody', equipSlot: 'platebody', sellValue: 200000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 130 } },
  // ── Shields ─────────────────────────────────────────────────
  bronze_shield:  { id: 'bronze_shield',  name: 'Bronze Shield',  category: 'shield', equipSlot: 'shield', sellValue: 50,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 6  } },
  iron_shield:    { id: 'iron_shield',    name: 'Iron Shield',    category: 'shield', equipSlot: 'shield', sellValue: 150,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 10 } },
  steel_shield:   { id: 'steel_shield',   name: 'Steel Shield',   category: 'shield', sellValue: 500,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 16 } },
  mithril_shield: { id: 'mithril_shield', name: 'Mithril Shield', category: 'shield', equipSlot: 'shield', sellValue: 2000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 24 } },
  adamant_shield: { id: 'adamant_shield', name: 'Adamant Shield', category: 'shield', equipSlot: 'shield', sellValue: 7000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 34 } },
  rune_shield:    { id: 'rune_shield',    name: 'Rune Shield',    category: 'shield', equipSlot: 'shield', sellValue: 22000, canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 44 } },
  dragon_shield:  { id: 'dragon_shield',  name: 'Dragon Shield',  category: 'shield', equipSlot: 'shield', sellValue: 70000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 60 } },
};

export default ITEMS;
export function getItem(id: string): Item | undefined {
  return ITEMS[id];
}
export function getAllItems(): Item[] {
  return Object.values(ITEMS);
}
