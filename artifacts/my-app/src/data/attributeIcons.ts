import { iconUrl } from '@/lib/assetUrl';
import type { BranchId, PillarId } from './attributes';
import type { SynergyId } from './synergies';
import type { EquipSlot } from './types';

/** Лицо слота — WebP из public/assets/icons. Текст в слот не кладём. */

export const PILLAR_ICON: Record<PillarId, string> = {
  fortitude: iconUrl('stats/stat_defense'),
  might: iconUrl('stats/stat_strength'),
  finesse: iconUrl('stats/stat_agility'),
  instinct: iconUrl('stats/stat_luck'),
};

export const BRANCH_ICON: Record<BranchId, string> = {
  health: iconUrl('stats/stat_health'),
  armor: iconUrl('skills/skill_shield_block'),
  will: iconUrl('skills/skill_heal'),
  strike: iconUrl('skills/skill_sword_strike'),
  onslaught: iconUrl('skills/skill_crit_strike'),
  destruction: iconUrl('skills/skill_ultimate'),
  tempo: iconUrl('stats/stat_speed'),
  evasion: iconUrl('stats/stat_agility'),
  reaction: iconUrl('skills/skill_lightning'),
  luck: iconUrl('stats/stat_luck'),
  resourcefulness: iconUrl('stats/stat_xp'),
  intuition: iconUrl('skills/skill_buff_strength'),
};

export const SYNERGY_ICON: Record<SynergyId, string> = {
  solid_strike: iconUrl('skills/skill_sword_strike'),
  quick_eye: iconUrl('stats/stat_crit'),
  unstoppable: iconUrl('skills/skill_crit_strike'),
  lucky_survivor: iconUrl('skills/skill_heal'),
  tempo_master: iconUrl('stats/stat_speed'),
  destroyer: iconUrl('skills/skill_ultimate'),
};

export const EQUIP_SLOT_ICON: Record<EquipSlot, string> = {
  helm: iconUrl('ui/equipment_slots/slot_equip_helmet'),
  platebody: iconUrl('ui/equipment_slots/slot_equip_chest'),
  platelegs: iconUrl('ui/equipment_slots/slot_equip_pants'),
  boots: iconUrl('ui/equipment_slots/slot_equip_boots'),
  gloves: iconUrl('ui/equipment_slots/slot_equip_ring'),
  weapon: iconUrl('ui/equipment_slots/slot_equip_weapon'),
  shield: iconUrl('ui/equipment_slots/slot_equip_shield'),
  amulet: iconUrl('ui/equipment_slots/slot_equip_amulet'),
  ring: iconUrl('ui/equipment_slots/slot_equip_ring'),
  ring2: iconUrl('ui/equipment_slots/slot_equip_ring'),
  bracelet: iconUrl('ui/equipment_slots/slot_equip_ring'),
  bracelet2: iconUrl('ui/equipment_slots/slot_equip_ring'),
  belt: iconUrl('ui/equipment_slots/slot_equip_pants'),
  cape: iconUrl('ui/equipment_slots/slot_equip_chest'),
  quiver: iconUrl('ui/equipment_slots/slot_equip_weapon'),
  passive: iconUrl('ui/equipment_slots/slot_equip_amulet'),
};

export const SLOT_FRAME = {
  empty: iconUrl('ui/slots/slot_parchment_empty'),
  common: iconUrl('ui/slots/slot_parchment_common'),
  active: iconUrl('ui/slots/slot_parchment_active'),
} as const;

export const HUB_NAV_ICON = {
  body: iconUrl('menu/menu_profile'),
  branches: iconUrl('stats/stat_xp'),
  gear: iconUrl('menu/menu_inventory'),
  synergies: iconUrl('skills/skill_lightning'),
  path: iconUrl('menu/menu_quests'),
} as const;
