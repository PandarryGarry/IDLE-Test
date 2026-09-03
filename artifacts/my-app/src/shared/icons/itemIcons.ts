/**
 * Централизованный реестр иконок и ассетов предметов.
 * 
 * Когда мы распакуем ваши архивы в public/assets/items/:
 * здесь будет прописано точное соответствие ID предмета -> путь к вашему файлу.
 */

export const ITEM_IMAGE_URLS: Record<string, string> = {
  // Будет заполнено вашими распакованными файлами из public/assets/items/
};

// Эмодзи-фоллбэки
export const EQUIPMENT_ICONS: Record<string, string> = {
  bronze_dagger: '🗡️', bronze_sword: '⚔️', bronze_battleaxe: '🪓', bronze_2h_sword: '⚔️', bronze_scimitar: '🗡️',
  iron_dagger: '🗡️', iron_sword: '⚔️', iron_battleaxe: '🪓', iron_2h_sword: '⚔️', iron_scimitar: '🗡️',
  steel_dagger: '🗡️', steel_sword: '⚔️', steel_battleaxe: '🪓', steel_2h_sword: '⚔️', steel_scimitar: '🗡️',
  mithril_dagger: '🗡️', mithril_sword: '⚔️', mithril_battleaxe: '🪓', mithril_2h_sword: '⚔️', mithril_scimitar: '🗡️',
  adamantite_dagger: '🗡️', adamantite_sword: '⚔️', adamantite_battleaxe: '🪓', adamantite_2h_sword: '⚔️', adamantite_scimitar: '🗡️',
  runite_dagger: '🗡️', runite_sword: '⚔️', runite_battleaxe: '🪓', runite_2h_sword: '⚔️', runite_scimitar: '🗡️',
  dragon_dagger: '🗡️', dragon_sword: '⚔️', dragon_battleaxe: '🪓', dragon_2h_sword: '⚔️', dragon_scimitar: '🗡️',

  bronze_helmet: '🪖', bronze_platebody: '🛡️', bronze_platelegs: '👖', bronze_boots: '👢', bronze_shield: '🛡️', bronze_gloves: '🧤',
  iron_helmet: '🪖', iron_platebody: '🛡️', iron_platelegs: '👖', iron_boots: '👢', iron_shield: '🛡️', iron_gloves: '🧤',
  steel_helmet: '🪖', steel_platebody: '🛡️', steel_platelegs: '👖', steel_boots: '👢', steel_shield: '🛡️', steel_gloves: '🧤',
  mithril_helmet: '🪖', mithril_platebody: '🛡️', mithril_platelegs: '👖', mithril_boots: '👢', mithril_shield: '🛡️', mithril_gloves: '🧤',
  adamantite_helmet: '🪖', adamantite_platebody: '🛡️', adamantite_platelegs: '👖', adamantite_boots: '👢', adamantite_shield: '🛡️', adamantite_gloves: '🧤',
  runite_helmet: '🪖', runite_platebody: '🛡️', runite_platelegs: '👖', runite_boots: '👢', runite_shield: '🛡️', runite_gloves: '🧤',
  dragon_helmet: '🪖', dragon_platebody: '🛡️', dragon_platelegs: '👖', dragon_boots: '👢', dragon_shield: '🛡️', dragon_gloves: '🧤',

  amulet_of_power: '📿', amulet_of_defence: '📿', amulet_of_strength: '📿', amulet_of_glory: '📿',
  ring_of_wealth: '💍', ring_of_recoil: '💍', ring_of_life: '💍',
  cape_of_legends: '🧣', cape_of_fire: '🧣',
};

export const RESOURCE_ICONS: Record<string, string> = {
  normal_logs: '🪵', oak_logs: '🪵', willow_logs: '🪵', teak_logs: '🪵',
  maple_logs: '🪵', mahogany_logs: '🪵', magic_logs: '✨', redwood_logs: '🪵',
  ash: '⚪',

  copper_ore: '🟤', tin_ore: '⚪', iron_ore: '🔩', coal_ore: '🖤',
  gold_ore: '🟡', mithril_ore: '💙', adamantite_ore: '💚', runite_ore: '🔵', dragonite_ore: '🔴',

  bronze_bar: '🟫', iron_bar: '⬜', steel_bar: '🔘', gold_bar: '🟨',
  mithril_bar: '🔵', adamantite_bar: '💚', runite_bar: '🔵', dragon_bar: '🔴',

  sapphire: '💎', emerald: '💎', ruby: '💎', diamond: '💎', onyx: '💎',
};

export const CONSUMABLE_ICONS: Record<string, string> = {
  raw_shrimp: '🦐', raw_sardine: '🐟', raw_herring: '🐟', raw_mackerel: '🐟',
  raw_trout: '🐟', raw_salmon: '🐠', raw_lobster: '🦞', raw_swordfish: '🐡',
  raw_crab: '🦀', raw_shark: '🦈', raw_manta_ray: '🐟', raw_whale: '🐋',

  shrimp: '🦐', sardine: '🐟', herring: '🐟', mackerel: '🐟',
  trout: '🐟', salmon: '🐠', lobster: '🦞', swordfish: '🐡',
  crab: '🦀', shark: '🦈', manta_ray: '🐟', whale: '🐋',
  burnt_fish: '🪨',

  attack_potion: '🧪', strength_potion: '🧪', defence_potion: '🧪',
};

export const MISC_ICONS: Record<string, string> = {
  bones: '🦴', big_bones: '🦴', dragon_bones: '🦴',
  feather: '🪶', thread: '🧵', leather: '📜',
  gold_coins: '🪙',
};

import { getItem } from '@/data/items';

export function getItemVisual(itemId: string): { type: 'image' | 'emoji'; value: string } {
  if (ITEM_IMAGE_URLS[itemId]) {
    return { type: 'image', value: ITEM_IMAGE_URLS[itemId] };
  }

  const item = getItem(itemId);
  const icon = 
    item?.icon ||
    EQUIPMENT_ICONS[itemId] ||
    RESOURCE_ICONS[itemId] ||
    CONSUMABLE_ICONS[itemId] ||
    MISC_ICONS[itemId] ||
    '📦';

  return { type: 'emoji', value: icon };
}
