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
  'skill.woodcuttingDesc': 'Gather logs for firemaking, crafting and trade.',
  'skill.fishingDesc': 'Catch raw fish for cooking, food and profit.',
  'skill.miningDesc': 'Extract ores and rare gems from the earth.',
  'skill.firemakingDesc': 'Burn logs for experience and useful ash.',
  'skill.cookingDesc': 'Turn raw ingredients into healing food.',
  'skill.smithingDesc': 'Smelt bars and forge equipment.',

  // ── Skill groups ───────────────────────────────────────────────
  'group.combat': 'Combat', 'group.gathering': 'Gathering',
  'group.artisan': 'Artisan', 'group.support': 'Support',

  // ── Navigation ─────────────────────────────────────────────────
  'nav.home': 'Home', 'nav.skills': 'Skills', 'nav.combat': 'Combat',
  'nav.inventory': 'Inventory', 'nav.bank': 'Bank',
  'nav.settings': 'Settings', 'nav.save': 'Save Game',
  'nav.shop': 'Shop',
 //─────────────────────────────────────────────────
  'ui.start': 'Start', 'ui.stop': 'Stop', 'ui.level': 'Level',
  'ui.xp': 'XP', 'ui.maxLevel': 'MAX', 'ui.locked': 'Locked',
  'ui.select': 'Select', 'ui.cancel': 'Cancel', 'ui.confirm': 'Confirm',
  'ui.search': 'Search', 'ui.save': 'Save', 'ui.export': 'Export',
  'ui.import': 'Import', 'ui.reset': 'Reset', 'ui.close': 'Close',
  'ui.back': 'Back', 'ui.mastery': 'Mastery', 'ui.interval': 'Interval',
  'ui.rate': 'Rate', 'ui.experience': 'Experience', 'ui.level.required': 'Level required',
  'ui.per.action': 'per action', 'ui.per.hour': '/hr', 'ui.seconds.abbr': 's',
  'ui.yields': 'Yields',

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
  'cooking.inInventory': 'In inventory',

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
  'combat.food': 'Food', 'combat.noFood': 'No food in inventory.',
  'combat.damage': 'Damage', 'combat.taken': 'Taken', 'combat.latest': 'Latest',
  'combat.you': 'You', 'combat.combatLevel': 'Combat Lvl',

  // ── Inventory ──────────────────────────────────────────────────
  'inventory.title': 'Inventory', 'inventory.slots': 'Slots', 'inventory.gp': 'GP',
  'inventory.sell': 'Sell', 'inventory.sellAll': 'Sell All', 'inventory.sell1': 'Sell 1',
  'inventory.lock': 'Lock', 'inventory.unlock': 'Unlock', 'inventory.equip': 'Equip',
  'inventory.sort.default': 'Default', 'inventory.sort.name': 'Name',
  'inventory.sort.value': 'Value', 'inventory.sort.quantity': 'Quantity',
  'inventory.value': 'Value', 'inventory.quantity': 'Quantity',
  'inventory.type': 'Type', 'inventory.sellsFor': 'Sells for',
  'inventory.heals': 'Heals', 'inventory.equipSlot': 'Equip slot',
  'inventory.stats': 'Combat stats', 'inventory.noDescription': 'No description available yet.',
  'inventory.empty': 'Your inventory is empty. Start skilling to collect items!',
  'inventory.upgradeSlots': 'Upgrade Slots',
  'inventory.unequip': 'Unequip',

  // ── Bank ───────────────────────────────────────────────────────
  'bank.title': 'Bank', 'bank.gpBalance': 'Gold Pieces',
  'bank.upgradeSlots': 'Upgrade Inventory Slots',
  'bank.slotCost': 'Cost per slot',
  'bank.currentSlots': 'Current capacity',
  'bank.buySlots': 'Buy +12 Slots',
  'bank.gpLog': 'Recent Transactions',
  'bank.noLog': 'No transactions yet. Sell items to earn GP!',
  'bank.totalEarned': 'Total Earned',
  'bank.slotsUpgraded': 'Slots expanded!',
  'bank.notEnoughGp': 'Not enough GP!',
  'bank.deposit': 'Deposit', 'bank.withdraw': 'Withdraw',
  'bank.interest': 'Daily Interest',
  'bank.interestDesc': 'Earn 0.5% interest on deposited GP per day of play.',

  // ── Settings ───────────────────────────────────────────────────
  'settings.title': 'Settings', 'settings.general': 'General',
  'settings.gameplay': 'Gameplay', 'settings.display': 'Display',
  'settings.saveManagement': 'Save Management',
  'settings.darkMode': 'Dark Mode', 'settings.language': 'Language',
  'settings.numberFormat': 'Number Format', 'settings.numberFormat.full': 'Full (1,234,567)',
  'settings.numberFormat.abbreviated': 'Abbreviated (1.2M)',
  'settings.autoSave': 'Auto Save', 'settings.autoSaveInterval': 'Auto-Save Interval',
  'settings.autoSaveDesc': 'Save the game automatically in the background',
  'settings.maxOfflineHours': 'Max Offline Hours',
  'settings.confirmSell': 'Confirm Sell',
  'settings.confirmSellDesc': 'Require confirmation before selling valuable items',
  'settings.darkModeDesc': 'Toggle between dark and light theme',
  'settings.showXpDrops': 'Show XP Drops',
  'settings.showLootDrops': 'Show Loot Drops',
  'settings.showCombatSplats': 'Show Combat Numbers',
  'settings.manualSave': 'Save Now', 'settings.exportSave': 'Export Save',
  'settings.importSave': 'Import Save (Base64)', 'settings.importPlaceholder': 'Paste save data here…',
  'settings.importBtn': 'Import', 'settings.resetGame': 'Reset Game',
  'settings.resetWarning': 'This will delete ALL progress. This cannot be undone!',
  'settings.resetConfirm': 'Yes, delete everything',
  'settings.saveSuccess': 'Game saved!', 'settings.importSuccess': 'Save imported!',
  'settings.importError': 'Invalid save data.',
  'settings.seconds': 'seconds',

  // ── Notifications ─────────────────────────────────────────────
  'notif.levelUp': 'Level up!', 'notif.masteryUp': 'Mastery level up!',
  'notif.gameSaved': 'Game saved.', 'notif.inventoryFull': 'Inventory is full!',
  'notif.noResources': 'Not enough resources. Action stopped.',
  'notif.offline.gained': 'Offline gains applied.',
} as const;

const ru: Partial<Record<keyof typeof en, string>> = {
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
  'skill.woodcuttingDesc': 'Добывай брёвна для огня, ремесла и продажи.',
  'skill.fishingDesc': 'Лови рыбу для готовки, еды и заработка.',
  'skill.miningDesc': 'Добывай руду и редкие самоцветы.',
  'skill.firemakingDesc': 'Сжигай брёвна, получая опыт и полезную золу.',
  'skill.cookingDesc': 'Превращай сырые ингредиенты в лечебную еду.',
  'skill.smithingDesc': 'Плавь слитки и создавай снаряжение.',

  // ── Skill groups ──────────────────────────────────────────────
  'group.combat': 'Бой', 'group.gathering': 'Добыча',
  'group.artisan': 'Ремесло', 'group.support': 'Поддержка',

  // ── Navigation ────────────────────────────────────────────────
  'nav.home': 'Главная', 'nav.skills': 'Навыки', 'nav.combat': 'Бой',
  'nav.inventory': 'Инвентарь', 'nav.bank': 'Банк',
  'nav.settings': 'Настройки', 'nav.save': 'Сохранить',
  'nav.shop': 'Магазин',
  // ── Generic UI ────────────────────────────────────────────────
  'ui.start': 'Начать', 'ui.stop': 'Остановить', 'ui.level': 'Уровень',
  'ui.xp': 'ОП', 'ui.maxLevel': 'МАКС', 'ui.locked': 'Закрыто',
  'ui.select': 'Выбрать', 'ui.cancel': 'Отмена', 'ui.confirm': 'Подтвердить',
  'ui.search': 'Поиск', 'ui.save': 'Сохранить', 'ui.export': 'Экспорт',
  'ui.import': 'Импорт', 'ui.reset': 'Сброс', 'ui.close': 'Закрыть',
  'ui.back': 'Назад', 'ui.mastery': 'Мастерство', 'ui.interval': 'Интервал',
  'ui.rate': 'Темп', 'ui.experience': 'Опыт', 'ui.level.required': 'Нужен уровень',
  'ui.per.action': 'за действие', 'ui.per.hour': '/ч',
  'ui.yields': 'Добыча',
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
  'cooking.inInventory': 'В инвентаре',

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
  'combat.food': 'Еда', 'combat.noFood': 'В инвентаре нет еды.',
  'combat.damage': 'Урон', 'combat.taken': 'Получено', 'combat.latest': 'К последним',
  'combat.you': 'Вы', 'combat.combatLevel': 'Уровень боя',

  // ── Inventory ─────────────────────────────────────────────────
  'inventory.title': 'Инвентарь', 'inventory.slots': 'Ячейки', 'inventory.gp': 'ЗМ',
  'inventory.sell': 'Продать', 'inventory.sellAll': 'Продать всё', 'inventory.sell1': 'Продать 1',
  'inventory.lock': 'Закрыть', 'inventory.unlock': 'Открыть', 'inventory.equip': 'Надеть',
  'inventory.sort.default': 'По умолчанию', 'inventory.sort.name': 'По имени',
  'inventory.sort.value': 'По цене', 'inventory.sort.quantity': 'По количеству',
  'inventory.value': 'Цена', 'inventory.quantity': 'Количество',
  'inventory.type': 'Тип', 'inventory.sellsFor': 'Продажа',
  'inventory.heals': 'Лечение', 'inventory.equipSlot': 'Слот',
  'inventory.stats': 'Боевые характеристики', 'inventory.noDescription': 'Описание пока не добавлено.',
  'inventory.empty': 'Инвентарь пуст. Начни прокачивать навыки!',
  'inventory.upgradeSlots': 'Расширить инвентарь',
  'inventory.unequip': 'Снять',

  // ── Bank ──────────────────────────────────────────────────────
  'bank.title': 'Банк', 'bank.gpBalance': 'Золотые монеты',
  'bank.upgradeSlots': 'Расширить инвентарь',
  'bank.slotCost': 'Цена за ячейку',
  'bank.currentSlots': 'Текущий объём',
  'bank.buySlots': 'Купить +12 ячеек',
  'bank.gpLog': 'Последние транзакции',
  'bank.noLog': 'Транзакций пока нет. Продавайте предметы!',
  'bank.totalEarned': 'Всего заработано',
  'bank.slotsUpgraded': 'Ячейки расширены!',
  'bank.notEnoughGp': 'Недостаточно золота!',
  'bank.deposit': 'Вклад', 'bank.withdraw': 'Снять',
  'bank.interest': 'Дневной процент',
  'bank.interestDesc': 'Зарабатывайте 0.5% на вложенное золото каждый день игры.',

  // ── Settings ──────────────────────────────────────────────────
  'settings.title': 'Настройки', 'settings.general': 'Основные',
  'settings.gameplay': 'Игровой процесс', 'settings.display': 'Отображение',
  'settings.saveManagement': 'Управление сохранениями',
  'settings.darkMode': 'Тёмная тема', 'settings.language': 'Язык',
  'settings.numberFormat': 'Формат чисел', 'settings.numberFormat.full': 'Полный (1 234 567)',
  'settings.numberFormat.abbreviated': 'Сокращённый (1.2М)',
  'settings.autoSave': 'Автосохранение', 'settings.autoSaveInterval': 'Интервал автосохранения',
  'settings.autoSaveDesc': 'Автоматически сохранять игру в фоне',
  'settings.maxOfflineHours': 'Макс. оффлайн-часов',
  'settings.confirmSell': 'Подтверждать продажу',
  'settings.confirmSellDesc': 'Запрашивать подтверждение перед продажей предметов',
  'settings.darkModeDesc': 'Переключить тёмную и светлую тему',
  'settings.showXpDrops': 'Показывать получение ОП',
  'settings.showLootDrops': 'Показывать получение предметов',
  'settings.showCombatSplats': 'Показывать урон в бою',
  'settings.manualSave': 'Сохранить сейчас', 'settings.exportSave': 'Экспорт сохранения',
  'settings.importSave': 'Импорт сохранения (Base64)', 'settings.importPlaceholder': 'Вставьте данные сохранения…',
  'settings.importBtn': 'Импортировать', 'settings.resetGame': 'Сбросить игру',
  'settings.resetWarning': 'Это удалит ВЕСЬ прогресс без возможности отмены!',
  'settings.resetConfirm': 'Да, удалить всё',
  'settings.saveSuccess': 'Игра сохранена!', 'settings.importSuccess': 'Сохранение загружено!',
  'settings.importError': 'Неверные данные сохранения.',
  'settings.seconds': 'секунд',

  // ── Notifications ─────────────────────────────────────────────
  'notif.levelUp': 'Уровень повышен!', 'notif.masteryUp': 'Мастерство повышено!',
  'notif.gameSaved': 'Игра сохранена.', 'notif.inventoryFull': 'Инвентарь полон!',
  'notif.noResources': 'Недостаточно ресурсов. Действие остановлено.',
  'notif.offline.gained': 'Оффлайн-прогресс применён.',
};

export type TranslationKey = keyof typeof en;

const dicts: Record<Lang, Partial<Record<keyof typeof en, string>>> = { en, ru };

export function translate(key: TranslationKey, lang: Lang): string {
  return (dicts[lang]?.[key] ?? dicts.en[key] ?? key) as string;
}
