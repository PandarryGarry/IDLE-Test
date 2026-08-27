import React from 'react';
import { 
  Sword, 
  Shield, 
  Coins, 
  Backpack, 
  Settings, 
  Save, 
  Flame, 
  Pickaxe, 
  Fish, 
  ChefHat, 
  Hammer,
  Trees,
  Skull,
  Heart,
  Zap,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Check,
  Search,
  History,
  Utensils,
  Globe,
  Package,
  Layers,
  Home,
  Crosshair,
  Wand2,
  BookOpen
} from 'lucide-react';

/**
 * Централизованный реестр системных иконок интерфейса.
 * Если нужно заменить иконку (например, на кастомный SVG или PNG) — меняем ТОЛЬКО здесь!
 */
export const UIIcons = {
  // Навигация и основные разделы
  home: () => <Home className="w-5 h-5" />,
  combat: () => <Sword className="w-5 h-5" />,
  inventory: () => <Backpack className="w-5 h-5 text-sky-400" />,
  skills: () => <Layers className="w-5 h-5" />,
  settings: () => <Settings className="w-5 h-5" />,
  save: () => <Save className="w-5 h-5" />,
  
  // Валюта и ресурсы
  gold: () => <Coins className="w-4 h-4 text-amber-400" />,
  goldBig: () => <Coins className="w-6 h-6 text-amber-400" />,
  package: () => <Package className="w-4 h-4" />,
  
  // Характеристики и бой
  combatLevel: () => <Shield className="w-4 h-4 text-red-400" />,
  hp: () => <Heart className="w-3.5 h-3.5 fill-current text-emerald-400" />,
  attack: () => <Sword className="w-4 h-4 text-rose-400" />,
  magic: () => <Wand2 className="w-4 h-4 text-purple-400" />,
  ranged: () => <Crosshair className="w-4 h-4 text-emerald-400" />,
  xp: () => <Zap className="w-3.5 h-3.5 text-amber-400" />,
  killCount: () => <Skull className="w-4 h-4 text-red-400" />,
  
  // Статус и интерактив
  lock: () => <Lock className="w-3.5 h-3.5 text-amber-400" />,
  unlock: () => <Unlock className="w-3.5 h-3.5 text-stone-500" />,
  sparkles: () => <Sparkles className="w-4 h-4 text-amber-400" />,
  trend: () => <TrendingUp className="w-4 h-4 text-emerald-400" />,
  food: () => <Utensils className="w-4 h-4 text-amber-400" />,
  history: () => <History className="w-4 h-4 text-cyan-400" />,
  search: () => <Search className="w-4 h-4 text-stone-500" />,
  check: () => <Check className="w-4 h-4 text-emerald-400" />,
  globe: () => <Globe className="w-4 h-4 text-stone-500" />,
};
