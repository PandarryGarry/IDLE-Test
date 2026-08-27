/**
 * Централизованный реестр иконок и ассетов предметов.
 * Включает маппинг на нарезанные спрайты из наборов артов (доспехи T1-T12, оружие, ресурсы, ювелирка).
 */

export const ITEM_IMAGE_URLS: Record<string, string> = {
  // Оружие и экипировка
  bronze_sword: '/assets/icons/equipment/sword_iron.png',
  iron_sword: '/assets/icons/equipment/sword_iron.png',
  steel_sword: '/assets/icons/equipment/sword_iron.png',
  bronze_dagger: '/assets/icons/equipment/dagger_iron.png',
  iron_dagger: '/assets/icons/equipment/dagger_iron.png',
  bronze_battleaxe: '/assets/icons/equipment/battleaxe_iron.png',
  iron_battleaxe: '/assets/icons/equipment/battleaxe_iron.png',
  bow_wood: '/assets/icons/equipment/bow_wood.png',
  staff_crescent: '/assets/icons/equipment/staff_crescent.png',

  // Доспехи латные (Plate Armor T1..T12)
  bronze_helmet: '/assets/icons/armor/plate/helm_t1.png',
  iron_helmet: '/assets/icons/armor/plate/helm_t2.png',
  steel_helmet: '/assets/icons/armor/plate/helm_t3.png',
  mithril_helmet: '/assets/icons/armor/plate/helm_t4.png',
  adamantite_helmet: '/assets/icons/armor/plate/helm_t5.png',
  runite_helmet: '/assets/icons/armor/plate/helm_t6.png',
  dragon_helmet: '/assets/icons/armor/plate/helm_t11.png',

  bronze_platebody: '/assets/icons/armor/plate/platebody_t1.png',
  iron_platebody: '/assets/icons/armor/plate/platebody_t2.png',
  steel_platebody: '/assets/icons/armor/plate/platebody_t3.png',
  mithril_platebody: '/assets/icons/armor/plate/platebody_t4.png',
  adamantite_platebody: '/assets/icons/armor/plate/platebody_t5.png',
  runite_platebody: '/assets/icons/armor/plate/platebody_t6.png',
  dragon_platebody: '/assets/icons/armor/plate/platebody_t11.png',

  bronze_platelegs: '/assets/icons/armor/plate/platelegs_t1.png',
  iron_platelegs: '/assets/icons/armor/plate/platelegs_t2.png',
  steel_platelegs: '/assets/icons/armor/plate/platelegs_t3.png',
  mithril_platelegs: '/assets/icons/armor/plate/platelegs_t4.png',
  adamantite_platelegs: '/assets/icons/armor/plate/platelegs_t5.png',
  runite_platelegs: '/assets/icons/armor/plate/platelegs_t6.png',
  dragon_platelegs: '/assets/icons/armor/plate/platelegs_t11.png',

  bronze_gloves: '/assets/icons/armor/plate/gloves_t1.png',
  iron_gloves: '/assets/icons/armor/plate/gloves_t2.png',
  steel_gloves: '/assets/icons/armor/plate/gloves_t3.png',
  mithril_gloves: '/assets/icons/armor/plate/gloves_t4.png',
  adamantite_gloves: '/assets/icons/armor/plate/gloves_t5.png',
  runite_gloves: '/assets/icons/armor/plate/gloves_t6.png',
  dragon_gloves: '/assets/icons/armor/plate/gloves_t11.png',

  bronze_boots: '/assets/icons/armor/plate/boots_t1.png',
  iron_boots: '/assets/icons/armor/plate/boots_t2.png',
  steel_boots: '/assets/icons/armor/plate/boots_t3.png',
  mithril_boots: '/assets/icons/armor/plate/boots_t4.png',
  adamantite_boots: '/assets/icons/armor/plate/boots_t5.png',
  runite_boots: '/assets/icons/armor/plate/boots_t6.png',
  dragon_boots: '/assets/icons/armor/plate/boots_t11.png',

  bronze_shield: '/assets/icons/equipment/shield_round.png',
  iron_shield: '/assets/icons/equipment/shield_round.png',
  steel_shield: '/assets/icons/equipment/shield_round.png',

  // Ювелирные изделия
  amulet_of_power: '/assets/icons/jewelry/necklace_t1.png',
  amulet_of_strength: '/assets/icons/jewelry/necklace_t2.png',
  amulet_of_defence: '/assets/icons/jewelry/necklace_t3.png',
  amulet_of_glory: '/assets/icons/jewelry/necklace_t8.png',
  ring_of_wealth: '/assets/icons/jewelry/ring_fire_t1.png',
  ring_of_recoil: '/assets/icons/jewelry/ring_ice_t2.png',
  ring_of_life: '/assets/icons/jewelry/ring_fire_t5.png',

  // Ресурсы
  normal_logs: '/assets/icons/resources/logs.png',
  oak_logs: '/assets/icons/resources/logs.png',
  willow_logs: '/assets/icons/resources/logs.png',
  teak_logs: '/assets/icons/resources/logs.png',
  maple_logs: '/assets/icons/resources/logs.png',
  mahogany_logs: '/assets/icons/resources/logs.png',
  magic_logs: '/assets/icons/resources/scroll.png',
  redwood_logs: '/assets/icons/resources/logs.png',

  copper_ore: '/assets/icons/resources/ore.png',
  tin_ore: '/assets/icons/resources/ore.png',
  iron_ore: '/assets/icons/resources/ore.png',
  coal_ore: '/assets/icons/resources/ore.png',
  gold_ore: '/assets/icons/resources/ore.png',
  mithril_ore: '/assets/icons/resources/ore.png',
  adamantite_ore: '/assets/icons/resources/ore.png',
  runite_ore: '/assets/icons/resources/ore.png',
  dragonite_ore: '/assets/icons/resources/ore.png',

  sapphire: '/assets/icons/resources/diamond.png',
  emerald: '/assets/icons/resources/amethyst.png',
  ruby: '/assets/icons/resources/diamond.png',
  diamond: '/assets/icons/resources/diamond.png',

  raw_meat: '/assets/icons/resources/meat.png',
  cooked_meat: '/assets/icons/resources/meat.png',
  potion_health: '/assets/icons/resources/potion_health.png',
  potion_mana: '/assets/icons/resources/potion_mana.png',
  gold_coins: '/assets/icons/resources/gold_coins.png',
};

// 1. Снаряжение и оружие (Equipment)
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

// 2. Ресурсы и материалы (Resources)
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

// 3. Расходники и еда (Consumables & Food)
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

// 4. Прочее (Misc)
export const MISC_ICONS: Record<string, string> = {
  bones: '🦴', big_bones: '🦴', dragon_bones: '🦴',
  feather: '🪶', thread: '🧵', leather: '📜',
  gold_coins: '🪙',
};

export function getItemVisual(itemId: string): { type: 'image' | 'icon'; value: string } {
  if (ITEM_IMAGE_URLS[itemId]) {
    return { type: 'image', value: ITEM_IMAGE_URLS[itemId] };
  }

  const icon = 
    EQUIPMENT_ICONS[itemId] ||
    RESOURCE_ICONS[itemId] ||
    CONSUMABLE_ICONS[itemId] ||
    MISC_ICONS[itemId] ||
    '📦';

  return { type: 'icon', value: icon };
}
