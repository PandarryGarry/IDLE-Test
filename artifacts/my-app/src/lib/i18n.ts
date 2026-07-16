// Flat key → string translation dictionary.
// Add all UI strings here; fall back to 'en' for missing keys.

export type Lang = 'en' | 'ru';

const en = {
  // ── Skill names ────────────────────────────────────────────────
  'skill.attack': 'Attack', 'skill.strength': 'Strength',
  'skill.defence': 'Defence', 'skill.hitpoints': 'Hitpoints',
  'skill.ranged': 'Ranged', 'skill.magic': 'Magic',
  'skill.prayer': 'Prayer', 'skill.slayer': 'Slayer',
  'skill.woodcutting': 'Woodcutting', 'skill.fishing': 'Fishing',
  'skill.mining': 'Mining', 'skill.firemaking': 'Firemaking',
  'skill.cooking': 'Cooking', 'skill.smithing': 'Smithing',
  'skill.fletching': 'Fletching', 'skill.crafting': 'Crafting',
  'skill.runecrafting': 'Runecrafting', 'skill.herblore': 'Herblore',
  'skill.farming': 'Farming', 'skill.agility': 'Agility',
  'skill.thieving': 'Thieving', 'skill.summoning': 'Summoning',
  'skill.astrology': 'Astrology', 'skill.township': 'Township',

  // ── Skill groups ───────────────────────────────────────────────
  'group.combat': 'Combat', 'group.gathering': 'Gathering',
  'group.artisan': 'Artisan', 'group.support': 'Support',

  // ── Navigation ─────────────────────────────────────────────────
  'nav.home': 'Home', 'nav.skills': 'Skills', 'nav.combat': 'Combat',
  'nav.bank': 'Bank', 'nav.settings': 'Settings', 'nav.save': 'Save Game',

  // ── Generic UI ─────────────────────────────────────────────────
  'ui.start': 'Start', 'ui.stop': 'Stop', 'ui.level': 'Level',
  'ui.xp': 'XP', 'ui.maxLevel': 'MAX', 'ui.locked': 'Locked',
  'ui.select': 'Select', 'ui.cancel': 'Cancel', 'ui.confirm': 'Confirm',
  'ui.search': 'Search', 'ui.save': 'Save', 'ui.export': 'Export',
  'ui.import': 'Import', 'ui.reset': 'Reset', 'ui.close': 'Close',
  'ui.back': 'Back', 'ui.mastery': 'Mastery', 'ui.interval': 'Interval',
  'ui.rate': 'Rate', 'ui.experience': 'Experience', 'ui.level.required': 'Level required',
  'ui.per.action': 'per action', 'ui.per.hour': '/hr', 'ui.seconds.abbr': 's',

  // ── Dashboard ──────────────────────────────────────────────────
  'dashboard.welcome': 'Welcome Back', 'dashboard.subtitle': 'Continue your adventure.',
  'dashboard.combatLevel': 'Combat Level', 'dashboard.playTime': 'Play Time',

  // ── Woodcutting ────────────────────────────────────────────────
  'woodcutting.chopping': 'Chopping', 'woodcutting.selectTree': 'Select a tree to start chopping.',
  'woodcutting.stop': 'Stop Chopping', 'woodcutting.availableTrees': 'Available Trees',

  // ── Mining ─────────────────────────────────────────────────────
  'mining.mining': 'Mining', 'mining.selectRock': 'Select a rock to start mining.',
  'mining.stop': 'Stop Mining', 'mining.availableRocks': 'Available Rocks',

  // ── Fishing ────────────────────────────────────────────────────
  'fishing.fishing': 'Fishing', 'fishing.selectSpot': 'Select a fishing spot.',
  'fishing.stop': 'Stop Fishing', 'fishing.availableSpots': 'Fishing Spots',

  // ── Cooking ────────────────────────────────────────────────────
  'cooking.cooking': 'Cooking', 'cooking.selectRecipe': 'Select a recipe to cook.',
  'cooking.stop': 'Stop Cooking', 'cooking.availableRecipes': 'Recipes',
  'cooking.requires': 'Requires', 'cooking.burns': 'Burn chance',
  'cooking.inBank': 'In bank',

  // ── Smithing ───────────────────────────────────────────────────
  'smithing.smithing': 'Smithing', 'smithing.selectRecipe': 'Select a recipe to smith.',
  'smithing.stop': 'Stop Smithing', 'smithing.smelting': 'Smelting',
  'smithing.equipment': 'Equipment', 'smithing.ingredients': 'Ingredients',

  // ── Firemaking ─────────────────────────────────────────────────
  'firemaking.burning': 'Burning', 'firemaking.selectLog': 'Select a log to burn.',
  'firemaking.stop': 'Stop Burning', 'firemaking.availableLogs': 'Logs',

  // ── Combat ─────────────────────────────────────────────────────
  'combat.areas': 'Combat Areas', 'combat.start': 'Start Combat',
  'combat.stop': 'Stop Combat', 'combat.fighting': 'Fighting',
  'combat.autoEat': 'Auto Eat', 'combat.autoLoot': 'Auto Loot',
  'combat.prayers': 'Prayers', 'combat.equipment': 'Equipment',
  'combat.log': 'Combat Log', 'combat.killCount': 'Kills',
  'combat.playerHp': 'Your HP', 'combat.enemyHp': 'Enemy HP',
  'combat.prayerPoints': 'Prayer Points', 'combat.drain': 'Drain',
  'combat.selectArea': 'Select an area to fight.',
  'combat.selectMonster': 'Select a monster to fight.',

  // ── Bank ───────────────────────────────────────────────────────
  'bank.title': 'Bank', 'bank.slots': 'Slots', 'bank.gp': 'GP',
  'bank.sell': 'Sell', 'bank.sellAll': 'Sell All', 'bank.sell1': 'Sell 1',
  'bank.lock': 'Lock', 'bank.unlock': 'Unlock', 'bank.equip': 'Equip',
  'bank.sort.default': 'Default', 'bank.sort.name': 'Name',
  'bank.sort.value': 'Value', 'bank.sort.quantity': 'Quantity',
  'bank.value': 'Value', 'bank.quantity': 'Quantity',
  'bank.empty': 'Your bank is empty. Start skilling to collect items!',
  'bank.upgradeSlots': 'Upgrade Slots',

  // ── Settings ───────────────────────────────────────────────────
  'settings.title': 'Settings', 'settings.general': 'General',
  'settings.gameplay': 'Gameplay', 'settings.display': 'Display',
  'settings.saveManagement': 'Save Management',
  'settings.darkMode': 'Dark Mode', 'settings.language': 'Language',
  'settings.numberFormat': 'Number Format', 'settings.numberFormat.full': 'Full (1,234,567)',
  'settings.numberFormat.abbreviated': 'Abbreviated (1.2M)',
  'settings.autoSave': 'Auto Save', 'settings.autoSaveInterval': 'Auto-Save Interval',
  'settings.maxOfflineHours': 'Max Offline Hours',
  'settings.confirmSell': 'Confirm Sell',
  'settings.showXpDrops': 'Show XP Drops',
  'settings.showLootDrops': 'Show Loot Drops',
  'settings.showCombatSplats': 'Show Combat Numbers',
  'settings.manualSave': 'Save Now', 'settings.exportSave': 'Export Save',
  'settings.importSave': 'Import Save', 'settings.importPlaceholder': 'Paste save data here…',
  'settings.importBtn': 'Import', 'settings.resetGame': 'Reset Game',
  'settings.resetWarning': 'This will delete ALL progress. This cannot be undone!',
  'settings.resetConfirm': 'Yes, delete everything',
  'settings.saveSuccess': 'Game saved!', 'settings.importSuccess': 'Save imported!',
  'settings.importError': 'Invalid save data.',
  'settings.seconds': 'seconds',

  // ── Notifications ─────────────────────────────────────────────
  'notif.levelUp': 'Level up!', 'notif.masteryUp': 'Mastery level up!',
  'notif.gameSaved': 'Game saved.', 'notif.bankFull': 'Bank is full!',
  'notif.noResources': 'Not enough resources. Action stopped.',
  'notif.offline.gained': 'Offline gains applied.',
} as const;

const ru: Partial<typeof en> = {
  // ── Skill names ───────────────────────────────────────────────
  'skill.attack': 'Атака', 'skill.strength': 'Сила',
  'skill.defence': 'Защита', 'skill.hitpoints': 'Очки здоровья',
  'skill.ranged': 'Стрельба', 'skill.magic': 'Магия',
  'skill.prayer': 'Молитва', 'skill.slayer': 'Истребитель',
  'skill.woodcutting': 'Лесорубство', 'skill.fishing': 'Рыбалка',
  'skill.mining': 'Горное дело', 'skill.firemaking': 'Разжигание огня',
  'skill.cooking': 'Кулинария', 'skill.smithing': 'Кузнечное дело',
  'skill.fletching': 'Стрелочное дело', 'skill.crafting': 'Ремесло',
  'skill.runecrafting': 'Создание рун', 'skill.herblore': 'Травоведение',
  'skill.farming': 'Фермерство', 'skill.agility': 'Ловкость',
  'skill.thieving': 'Воровство', 'skill.summoning': 'Призыв',
  'skill.astrology': 'Астрология', 'skill.township': 'Управление городом',

  // ── Skill groups ──────────────────────────────────────────────
  'group.combat': 'Бой', 'group.gathering': 'Добыча',
  'group.artisan': 'Ремесло', 'group.support': 'Поддержка',

  // ── Navigation ────────────────────────────────────────────────
  'nav.home': 'Главная', 'nav.skills': 'Навыки', 'nav.combat': 'Бой',
  'nav.bank': 'Банк', 'nav.settings': 'Настройки', 'nav.save': 'Сохранить',

  // ── Generic UI ────────────────────────────────────────────────
  'ui.start': 'Начать', 'ui.stop': 'Остановить', 'ui.level': 'Уровень',
  'ui.xp': 'ОП', 'ui.maxLevel': 'МАКС', 'ui.locked': 'Закрыто',
  'ui.select': 'Выбрать', 'ui.cancel': 'Отмена', 'ui.confirm': 'Подтвердить',
  'ui.search': 'Поиск', 'ui.save': 'Сохранить', 'ui.export': 'Экспорт',
  'ui.import': 'Импорт', 'ui.reset': 'Сброс', 'ui.close': 'Закрыть',
  'ui.back': 'Назад', 'ui.mastery': 'Мастерство', 'ui.interval': 'Интервал',
  'ui.rate': 'Темп', 'ui.experience': 'Опыт', 'ui.level.required': 'Нужен уровень',
  'ui.per.action': 'за действие', 'ui.per.hour': '/ч',
  'ui.seconds.abbr': 'с',

  // ── Dashboard ─────────────────────────────────────────────────
  'dashboard.welcome': 'Добро пожаловать', 'dashboard.subtitle': 'Продолжи своё приключение.',
  'dashboard.combatLevel': 'Уровень боя', 'dashboard.playTime': 'Время игры',

  // ── Woodcutting ───────────────────────────────────────────────
  'woodcutting.chopping': 'Рубка', 'woodcutting.selectTree': 'Выберите дерево для рубки.',
  'woodcutting.stop': 'Остановить', 'woodcutting.availableTrees': 'Деревья',

  // ── Mining ────────────────────────────────────────────────────
  'mining.mining': 'Добыча', 'mining.selectRock': 'Выберите породу для добычи.',
  'mining.stop': 'Остановить', 'mining.availableRocks': 'Породы',

  // ── Fishing ───────────────────────────────────────────────────
  'fishing.fishing': 'Рыбалка', 'fishing.selectSpot': 'Выберите место для рыбалки.',
  'fishing.stop': 'Остановить', 'fishing.availableSpots': 'Места рыбалки',

  // ── Cooking ───────────────────────────────────────────────────
  'cooking.cooking': 'Готовка', 'cooking.selectRecipe': 'Выберите рецепт для приготовления.',
  'cooking.stop': 'Остановить', 'cooking.availableRecipes': 'Рецепты',
  'cooking.requires': 'Нужно', 'cooking.burns': 'Шанс сжечь',
  'cooking.inBank': 'В банке',

  // ── Smithing ──────────────────────────────────────────────────
  'smithing.smithing': 'Кузнечное дело', 'smithing.selectRecipe': 'Выберите рецепт.',
  'smithing.stop': 'Остановить', 'smithing.smelting': 'Плавка',
  'smithing.equipment': 'Снаряжение', 'smithing.ingredients': 'Ингредиенты',

  // ── Firemaking ────────────────────────────────────────────────
  'firemaking.burning': 'Сжигание', 'firemaking.selectLog': 'Выберите бревно для сжигания.',
  'firemaking.stop': 'Остановить', 'firemaking.availableLogs': 'Брёвна',

  // ── Combat ────────────────────────────────────────────────────
  'combat.areas': 'Зоны боя', 'combat.start': 'Начать бой',
  'combat.stop': 'Остановить', 'combat.fighting': 'В бою с',
  'combat.autoEat': 'Авто-еда', 'combat.autoLoot': 'Авто-добыча',
  'combat.prayers': 'Молитвы', 'combat.equipment': 'Снаряжение',
  'combat.log': 'Журнал боя', 'combat.killCount': 'Убийства',
  'combat.playerHp': 'Ваше ОЗ', 'combat.enemyHp': 'ОЗ врага',
  'combat.prayerPoints': 'Очки молитвы', 'combat.drain': 'Расход',
  'combat.selectArea': 'Выберите зону для боя.',
  'combat.selectMonster': 'Выберите существо для боя.',

  // ── Bank ──────────────────────────────────────────────────────
  'bank.title': 'Банк', 'bank.slots': 'Ячейки', 'bank.gp': 'ЗМ',
  'bank.sell': 'Продать', 'bank.sellAll': 'Продать всё', 'bank.sell1': 'Продать 1',
  'bank.lock': 'Закрыть', 'bank.unlock': 'Открыть', 'bank.equip': 'Надеть',
  'bank.sort.default': 'По умолчанию', 'bank.sort.name': 'По имени',
  'bank.sort.value': 'По цене', 'bank.sort.quantity': 'По количеству',
  'bank.value': 'Цена', 'bank.quantity': 'Количество',
  'bank.empty': 'Ваш банк пуст. Начните прокачивать навыки!',
  'bank.upgradeSlots': 'Расширить банк',

  // ── Settings ──────────────────────────────────────────────────
  'settings.title': 'Настройки', 'settings.general': 'Основные',
  'settings.gameplay': 'Игровой процесс', 'settings.display': 'Отображение',
  'settings.saveManagement': 'Управление сохранениями',
  'settings.darkMode': 'Тёмная тема', 'settings.language': 'Язык',
  'settings.numberFormat': 'Формат чисел', 'settings.numberFormat.full': 'Полный (1 234 567)',
  'settings.numberFormat.abbreviated': 'Сокращённый (1.2М)',
  'settings.autoSave': 'Автосохранение', 'settings.autoSaveInterval': 'Интервал автосохранения',
  'settings.maxOfflineHours': 'Макс. оффлайн-часов',
  'settings.confirmSell': 'Подтверждать продажу',
  'settings.showXpDrops': 'Показывать получение ОП',
  'settings.showLootDrops': 'Показывать получение предметов',
  'settings.showCombatSplats': 'Показывать урон в бою',
  'settings.manualSave': 'Сохранить сейчас', 'settings.exportSave': 'Экспорт сохранения',
  'settings.importSave': 'Импорт сохранения', 'settings.importPlaceholder': 'Вставьте данные сохранения…',
  'settings.importBtn': 'Импортировать', 'settings.resetGame': 'Сбросить игру',
  'settings.resetWarning': 'Это удалит ВЕСЬ прогресс без возможности отмены!',
  'settings.resetConfirm': 'Да, удалить всё',
  'settings.saveSuccess': 'Игра сохранена!', 'settings.importSuccess': 'Сохранение загружено!',
  'settings.importError': 'Неверные данные сохранения.',
  'settings.seconds': 'секунд',

  // ── Notifications ─────────────────────────────────────────────
  'notif.levelUp': 'Уровень повышен!', 'notif.masteryUp': 'Мастерство повышено!',
  'notif.gameSaved': 'Игра сохранена.', 'notif.bankFull': 'Банк полон!',
  'notif.noResources': 'Недостаточно ресурсов. Действие остановлено.',
  'notif.offline.gained': 'Оффлайн-прогресс применён.',
};

export type TranslationKey = keyof typeof en;

const dicts: Record<Lang, Partial<typeof en>> = { en, ru };

export function translate(key: TranslationKey, lang: Lang): string {
  return (dicts[lang]?.[key] ?? dicts.en[key] ?? key) as string;
}
