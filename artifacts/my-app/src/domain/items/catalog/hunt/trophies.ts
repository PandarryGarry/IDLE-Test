import type { CatalogItem } from '../types.ts';

/**
 * Охота — трофеи и шкуры с монстров. Добыча боя (`domain/combat/monsters.ts`).
 * Картинки существующие (`materials/monster/*`, `materials/leather/*`).
 */
export const HUNT_TROPHIES: CatalogItem[] = [
  { id: 'trophy_guts', name: 'Потроха', description: 'Звериные потроха. Пахнут дичью; сгодятся на приманку или в котёл.', category: 'misc', tier: 1, sellValue: 4, canSell: true, stackable: true, iconPath: 'materials/monster/guts', icon: '🫀' },
  { id: 'trophy_antlers', name: 'Рога оленьи', description: 'Ветвистые оленьи рога. Крепкие — пойдут на рукояти и украшения.', category: 'misc', tier: 2, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/monster/antlers', icon: '🦌' },
  { id: 'trophy_ram_horn', name: 'Рог бараний', description: 'Тяжёлый бараний рог. Из таких делают кубки и боевые рога.', category: 'misc', tier: 2, sellValue: 20, canSell: true, stackable: true, iconPath: 'materials/monster/ram_horn', icon: '🐏' },
  { id: 'trophy_beast_eye', name: 'Глаз звериный', description: 'Выпученный глаз твари. Алхимики платят за такое не торгуясь.', category: 'misc', tier: 3, sellValue: 45, canSell: true, stackable: true, iconPath: 'materials/monster/beast_eye', icon: '👁' },
  { id: 'hide_raw', name: 'Шкура сырая', description: 'Сырая невыделанная шкура. Тяжёлая и пахнет зверем.', category: 'misc', tier: 1, sellValue: 8, canSell: true, stackable: true, iconPath: 'materials/leather/leather_pelt_raw', icon: '🟫' },
  { id: 'leather_tanned', name: 'Кожа дублёная', description: 'Выделанная кожа. Мягкая, прочная — основа лёгкой брони.', category: 'misc', tier: 3, sellValue: 60, canSell: true, stackable: true, iconPath: 'materials/leather/leather_tanned', icon: '🟫' },
  { id: 'leather_boar', name: 'Кожа вепря', description: 'Толстая кожа вепря. Держит клык и нож; ценится бронниками.', category: 'misc', tier: 4, sellValue: 120, canSell: true, stackable: true, iconPath: 'materials/leather/leather_boar_thick', icon: '🟫' },
  { id: 'leather_scaled', name: 'Кожа чешуйчатая', description: 'Чешуйчатая кожа дракона. Лёгкая, как ткань, и крепче стали.', category: 'misc', tier: 6, sellValue: 600, canSell: true, stackable: true, iconPath: 'materials/leather/leather_scaled', icon: '🐉' },
];
