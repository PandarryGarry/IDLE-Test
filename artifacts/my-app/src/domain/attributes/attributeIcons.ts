import { iconUrl } from '../../lib/assetUrl.ts';
import type { BranchId, PassiveId, PillarId } from './attributes.ts';
import type { SynergyId } from './synergies.ts';
import type { EquipSlot } from '../../data/types.ts';

/** Лицо слота — WebP из public/assets/icons. Текст в слот не кладём. */

export const PILLAR_ICON: Record<PillarId, string> = {
  fortitude: iconUrl('pillars/pillar_fortitude'),
  might: iconUrl('pillars/pillar_might'),
  finesse: iconUrl('pillars/pillar_finesse'),
  instinct: iconUrl('pillars/pillar_instinct'),
};

export const BRANCH_ICON: Record<BranchId, string> = {
  health: iconUrl('branches/branch_health'),
  armor: iconUrl('branches/branch_armor'),
  will: iconUrl('branches/branch_will'),
  strike: iconUrl('branches/branch_strike'),
  onslaught: iconUrl('branches/branch_onslaught'),
  destruction: iconUrl('branches/branch_destruction'),
  tempo: iconUrl('branches/branch_tempo'),
  evasion: iconUrl('branches/branch_evasion'),
  reaction: iconUrl('branches/branch_reaction'),
  luck: iconUrl('branches/branch_luck'),
  resourcefulness: iconUrl('branches/branch_resourcefulness'),
  intuition: iconUrl('branches/branch_intuition'),
};

export const PASSIVE_ICON: Record<PassiveId, string> = {
  second_wind: iconUrl('passives/passive_second_wind'),
  deep_sleep: iconUrl('passives/passive_deep_sleep'),
  buckler: iconUrl('passives/passive_buckler'),
  bone_shell: iconUrl('passives/passive_bone_shell'),
  steady_spirit: iconUrl('passives/passive_steady_spirit'),
  unbroken: iconUrl('passives/passive_unbroken'),

  heavy_hand: iconUrl('passives/passive_heavy_hand'),
  piercing: iconUrl('passives/passive_piercing'),
  sweeping: iconUrl('passives/passive_sweeping'),
  stagger: iconUrl('passives/passive_stagger'),
  bone_breaker: iconUrl('passives/passive_bone_breaker'),
  finisher: iconUrl('passives/passive_finisher'),

  light_step: iconUrl('passives/passive_light_step'),
  nimble: iconUrl('passives/passive_nimble'),
  shade: iconUrl('passives/passive_shade'),
  slip_away: iconUrl('passives/passive_slip_away'),
  flash: iconUrl('passives/passive_flash'),
  anticipation: iconUrl('passives/passive_anticipation'),

  lucky_break: iconUrl('passives/passive_lucky_break'),
  hoard_sense: iconUrl('passives/passive_hoard_sense'),
  thrifty: iconUrl('passives/passive_thrifty'),
  knows_value: iconUrl('passives/passive_knows_value'),
  nose: iconUrl('passives/passive_nose'),
  experience: iconUrl('passives/passive_experience'),
};

export const SYNERGY_ICON: Record<SynergyId, string> = {
  // Шесть первых нитей — свои иконки synergy_*.
  solid_strike: iconUrl('threads/synergy_solid_strike'),
  quick_eye: iconUrl('threads/synergy_quick_eye'),
  unstoppable: iconUrl('threads/synergy_unstoppable'),
  lucky_survivor: iconUrl('threads/synergy_lucky_survivor'),
  tempo_master: iconUrl('threads/synergy_tempo_master'),
  destroyer: iconUrl('threads/synergy_destroyer'),
  // Остальные 15 — бывшие «скоро», теперь полноценные нити.
  wall_of_muscle: iconUrl('threads/soon_wall_of_muscle'),
  stone_skin: iconUrl('threads/soon_stone_skin'),
  wind_shadow: iconUrl('threads/soon_wind_shadow'),
  storm_eye: iconUrl('threads/soon_storm_eye'),
  blade_dance: iconUrl('threads/soon_blade_dance'),
  steel_vortex: iconUrl('threads/soon_steel_vortex'),
  root_of_life: iconUrl('threads/soon_root_of_life'),
  ancestors_call: iconUrl('threads/soon_ancestors_call'),
  second_wind: iconUrl('threads/soon_second_wind'),
  iron_grip: iconUrl('threads/soon_iron_grip'),
  crown_hunter: iconUrl('threads/soon_crown_hunter'),
  blood_oath: iconUrl('threads/soon_blood_oath'),
  thunder_step: iconUrl('threads/soon_thunder_step'),
  storm_fury: iconUrl('threads/soon_storm_fury'),
  dark_bargain: iconUrl('threads/soon_dark_bargain'),
};

export const EQUIP_SLOT_ICON: Record<EquipSlot, string> = {
  helm: iconUrl('ui/equipment_slots/slot_equip_helmet'),
  platebody: iconUrl('ui/equipment_slots/slot_equip_chest'),
  platelegs: iconUrl('ui/equipment_slots/slot_equip_pants'),
  boots: iconUrl('ui/equipment_slots/slot_equip_boots'),
  gloves: iconUrl('ui/equipment_slots/slot_equip_boots'),
  weapon: iconUrl('ui/equipment_slots/slot_equip_weapon'),
  shield: iconUrl('ui/equipment_slots/slot_equip_shield'),
  amulet: iconUrl('ui/equipment_slots/slot_equip_amulet'),
  ring: iconUrl('ui/equipment_slots/slot_equip_ring'),
  ring2: iconUrl('ui/equipment_slots/slot_equip_ring'),
  bracelet: iconUrl('ui/equipment_slots/slot_equip_ring'),
  bracelet2: iconUrl('ui/equipment_slots/slot_equip_ring'),
  belt: iconUrl('ui/equipment_slots/slot_equip_chest'),
  cape: iconUrl('ui/equipment_slots/slot_equip_chest'),
  quiver: iconUrl('ui/equipment_slots/slot_equip_weapon'),
  passive: iconUrl('ui/equipment_slots/slot_equip_amulet'),
};

export const SLOT_FRAME = {
  empty: iconUrl('ui/slots/slot_parchment_empty'),
  common: iconUrl('ui/slots/slot_parchment_common'),
  uncommon: iconUrl('ui/slots/slot_parchment_uncommon'),
  rare: iconUrl('ui/slots/slot_parchment_rare'),
  epic: iconUrl('ui/slots/slot_parchment_epic'),
  legendary: iconUrl('ui/slots/slot_parchment_legendary'),
  locked: iconUrl('ui/slots/slot_parchment_locked'),
  active: iconUrl('ui/slots/slot_parchment_legendary'),
} as const;

export const BOARD_EMBLEM = iconUrl('ui/emblem_axe_quill');

export const HUB_NAV_ICON = {
  body: iconUrl('menu/menu_profile'),
  branches: iconUrl('stats/stat_xp'),
  gear: iconUrl('menu/menu_inventory'),
  synergies: iconUrl('skills/skill_lightning'),
  path: iconUrl('menu/menu_quests'),
} as const;
