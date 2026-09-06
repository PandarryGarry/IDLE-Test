# КАТАЛОГ ПРЕДМЕТОВ · имя файла = что нарисовано + тир

_Обновлён: 2026-09-06. Строится скриптом `tools/build_items_catalog.py` — перед генерацией новой партии перечитайте его._

**Охват:** только предметы, материалы и экипировка. Аватары и бумажные куклы (тела) в список не входят, оверлеи экипировки на куклах перечислены как техническое ядро системы (это уже одежда, а не персонаж).

## 0. Соглашения и тиры

```
материал:  mat_<вид>_<тир>_<металл|порода>.png      пример: mat_ingot_t07_mithril.png
экипировка: equip_<слот>_<тир>_<материал>.png        пример: equip_chest_t05_plate.png
оружие:    wpn_<тип>_<тир>_<металл>.png              пример: wpn_sword_t05_steel.png  (у оружия свой трек металлов: stone→copper→bronze→iron→steel→blacksteel→mithril→silversteel→orichalcum→magma→astral→void)
левая рука:off_<тип>_<тир>_<материал>.png            пример: off_shield_kite_t04_scale.png
украшение: jew_<вид>_<стихия>.png                    пример: jew_ring_fire.png
зелье:     pot_potion_<NN>_<назначение>.png          пример: pot_potion_12_regeneration.png
еда:       dish_<NN>_<название>.png / mat_meat_*.png пример: dish_07_kebab.png
лут:       chest_t<NN>_<материал>.png / key_t<NN>_<тип>.png
```

### Таблица тиров (12 ступеней = прогрессия материалов И грейдов брони/украшений; у оружия — своя линейка, см. ниже)

| Тир | Редкость | Тир-материал (кожа/металл/дерево) |
|---|---|---|
| `t01` | Common | Кожа / Медь / Дуб |
| `t02` | Uncommon | Лён / Бронза / Берёза |
| `t03` | Rare | Кольчуга / Железо / Сосна |
| `t04` | Epic-Low | Чешуя / Серебро / Тис |
| `t05` | Epic | Зерцало / Золото / Клён |
| `t06` | Epic+ | Плащ. кожа / Воронёная сталь / Железное дерево |
| `t07` | Legendary | Кожа дракона / Мифрил / Эльфийское дерево |
| `t08` | Legendary+ | Чешуя дракона / Орихалк / Древнее дерево |
| `t09` | Mythic | Магма-шкура / Магмит / Магмовое дерево |
| `t10` | Mythic | Астрал-кожа / Астралит / Астральное дерево |
| `t11` | Ascended | Пустотный хитин / Пустотный сплав / Древесина Пустоты |
| `t12` | Ascended+ | Драконид-броня / Драконид / Драконье дерево |

> Важно: это 12-ступенчатая лестница тиров для предметов/материалов. Цветов рамок редкости в UI пока 5 (Common #868E96 · Uncommon #51CF66 · Rare #339AF0 · Epic #9775FA · Legendary #FFA94D) — под t06…t12 рамки ещё не нарисованы.

### Линейка металлов для оружия (оружие отстаёт от брони/украшений примерно на ступень)

| Тир | t01 | t02 | t03 | t04 | t05 | t06 | t07 | t08 | t09 | t10 | t11 | t12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Оружие | камень / дерево | медь | бронза | железо | сталь | воронёная сталь | мифрил | сталь + серебро | орихалк | магмит | астралит | пустотный сплав / драконид |
| Кольца/браслеты/ожерелья (металл оправы) | copper | bronze | iron | silver | gold | blacksteel | mithril | orichalcum | magma | astral | void | dragonid |

### 13 ячеек экипировки (как вы их задали)

| # | Ячейка | Файл-слот оверлея на кукле | Файл предмета (пример) |
|---|---|---|---|
| 1 | Шлем | `overlay_helmet.png` | `equip_*/wpn_*/off_*/jew_*` |
| 2 | Торс | `overlay_chest.png` | `equip_*/wpn_*/off_*/jew_*` |
| 3 | Пояс | `overlay_belt.png` | `equip_*/wpn_*/off_*/jew_*` |
| 4 | Ноги | `overlay_pants.png` | `equip_*/wpn_*/off_*/jew_*` |
| 5 | Обувь | `overlay_boots.png` | `equip_*/wpn_*/off_*/jew_*` |
| 6 | Перчатки | `overlay_gloves.png` | `equip_*/wpn_*/off_*/jew_*` |
| 7 | Левая ячейка (щит/стрелы/книги/второе оружие) | `overlay_offhand.png` | `equip_*/wpn_*/off_*/jew_*` |
| 8 | Правая рука (оружие) | `overlay_weapon.png` | `equip_*/wpn_*/off_*/jew_*` |
| 9 | Кольцо левое №1 | `overlay_ring_l1.png` | `equip_*/wpn_*/off_*/jew_*` |
| 10 | Кольцо левое №2 | `overlay_ring_l2.png` | `equip_*/wpn_*/off_*/jew_*` |
| 11 | Кольцо правое №1 | `overlay_ring_r1.png` | `equip_*/wpn_*/off_*/jew_*` |
| 12 | Кольцо правое №2 | `overlay_ring_r2.png` | `equip_*/wpn_*/off_*/jew_*` |
| 13 | Ожерелье | `overlay_necklace.png` | `equip_*/wpn_*/off_*/jew_*` |

---

## 1. ЕСТЬ В ВОРКСПЕЙСЕ (проверено сканом папок)

Найдено файлов: **44**. Остальные партии (ресурсы, материалы, оружие, броня, украшения, еда) были скачаны и из воркспейса удалены — они перенесены в раздел 2 как план с уже согласованными именами.

### `icons/characters/paper_dolls/armor_set/`  · 8 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `overlay_belt.png` | Оверлей пояса (тест): коричневый ремень, золотая пряжка | `t01` | Common (тест) |
| `overlay_boots.png` | Оверлей сапог (тест): голенища с загнутыми мысками | `t02` | Uncommon (тест) |
| `overlay_chest.png` | Оверлей торса (тест): стальная пластина с золотым ромбом, наплечники | `t03` | Rare (тест) |
| `overlay_gloves.png` | Оверлей перчаток (тест): две раструба-краги (заготовка, не читается) | `t02` | Uncommon (тест) |
| `overlay_helmet.png` | Оверлей шлема (тест): стальная шапка с Т-образным вырезом и золотым гребнем | `t03` | Rare (тест) |
| `overlay_pants.png` | Оверлей штанов (тест): две серые штанины с наколенниками | `t03` | Rare (тест) |
| `overlay_shield.png` | Оверлей щита (тест): норманнский/капелька, синее поле, золотой кант | `t02` | Uncommon (тест) |
| `overlay_weapon.png` | Оверлей оружия (тест): прямой одноручный меч с золотой гардой | `t02` | Uncommon (тест) |

### `icons/characters/paper_dolls/overlays/`  · 3 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `overlay_belt_fire.png` | Пояс «огонь»: тёмный ремень, алая стропа, ромб с углистой вставкой (тест якорей) | `t05` | Epic |
| `overlay_belt_gold.png` | Пояс «золото»: жёлтый ремень + медальон с сапфиром (тест якорей) | `t03` | Rare |
| `overlay_belt_iron.png` | Пояс «железо»: ремень + серебристая двузубая пряжка (тест якорей) | `t01` | Common |

### `icons/loot/chests/`  · 4 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `chest_t01_wood.png` | Сундук деревянный с железными стяжками и навесным замком | `t01` | Common |
| `chest_t02_iron.png` | Сундук стальной/чугунный, клёпаный, с замочной скважиной | `t02` | Uncommon |
| `chest_t03_gold.png` | Сундук золочёный с сапфировой инкрустацией и вензелями | `t03` | Rare |
| `chest_t04_runic.png` | Сундук рунный: чёрный корпус, фиолетовые руны, череп-замок | `t04` | Epic |

### `icons/loot/keys/`  · 4 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `key_t01_rust.png` | Ключ ржавый, массивный, с круглой бородкой-петлёй | `t01` | Common |
| `key_t02_steel.png` | Ключ стальной, двойная нарезка, фигурная бородка | `t02` | Uncommon |
| `key_t03_gold.png` | Ключ золотой с филигранным верхом и сапфиром в бородке | `t03` | Rare |
| `key_t04_runic.png` | Ключ рунный: череп-верх, руны на стержне | `t04` | Epic |

### `icons/ui/equipment_slots/`  · 8 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `slot_equip_amulet.png` | Пустая ячейка «Ожерелье/амулет» | `-` | - |
| `slot_equip_boots.png` | Пустая ячейка «Обувь» | `-` | - |
| `slot_equip_chest.png` | Пустая ячейка «Торс» | `-` | - |
| `slot_equip_helmet.png` | Пустая ячейка «Шлем» | `-` | - |
| `slot_equip_pants.png` | Пустая ячейка «Ноги» | `-` | - |
| `slot_equip_ring.png` | Пустая ячейка «Кольцо» (x2) | `-` | - |
| `slot_equip_shield.png` | Пустая ячейка «Левая рука: щит/книга/стрелы/второе оружие» | `-` | - |
| `slot_equip_weapon.png` | Пустая ячейка «Правая рука: оружие» | `-` | - |

### `icons/ui/recipes/`  · 1 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `recipe_row_slate.png` | Строка рецепта крафта (плитка списка) | `-` | - |

### `icons/ui/slots/`  · 16 шт.

| Имя файла | Что на картинке | Тир | Редкость |
|---|---|---|---|
| `slot_active.png` | Рамка активного/выбранного слота | `-` | - |
| `slot_common.png` | Рамка слота Common (серый кант) | `t01` | Common |
| `slot_empty.png` | Пустой слот предмета (нейтральная рамка, без редкости) | `-` | - |
| `slot_epic.png` | Рамка слота Epic (фиолетовый кант) | `t04` | Epic |
| `slot_legendary.png` | Рамка слота Legendary (оранжево-золотой кант) | `t05` | Legendary |
| `slot_locked.png` | Рамка закрытого слота (замок) | `-` | - |
| `slot_parchment_active.png` | Слот-пергамент активный (зелёный кант выбора) | `-` | - |
| `slot_parchment_common.png` | Слот-пергамент Common (стальной кант по фаске) | `t01` | Common |
| `slot_parchment_empty.png` | Слот-пергамент: пустое вдавленное гнездо, шоколадная рамка | `-` | - |
| `slot_parchment_epic.png` | Слот-пергамент Epic (аметистовый кант) | `t04` | Epic |
| `slot_parchment_legendary.png` | Слот-пергамент Legendary (золотисто-янтарный кант) | `t05` | Legendary |
| `slot_parchment_locked.png` | Слот-пергамент заблокированный (золотой навесной замок) | `-` | - |
| `slot_parchment_rare.png` | Слот-пергамент Rare (сапфировый кант) | `t03` | Rare |
| `slot_parchment_uncommon.png` | Слот-пергамент Uncommon (изумрудный кант) | `t02` | Uncommon |
| `slot_rare.png` | Рамка слота Rare (синий кант) | `t03` | Rare |
| `slot_uncommon.png` | Рамка слота Uncommon (зелёный кант) | `t02` | Uncommon |

---

## 2. ПОЛНЫЙ КАТАЛОГ (план генерации) · только предметы, материалы, экипировка

Всего позиций: **750**. Статусы: `план` — ещё не рисовали; `было в партии, скачано и удалено` — нарисовано ранее, имена уже зафиксированы; `ожидает` — слот зарезервирован (T11–T15 в украшениях), названия стихий предлагаемые.

### Экипировка · 168 шт. → `icons/items/equipment/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `equip_head_t01_leather.png` | Кожаный шлем | `t01` | Common | план |
| `equip_head_t02_linen.png` | Лняной (стёганка) шлем | `t02` | Uncommon | план |
| `equip_head_t03_chain.png` | Кольчужный шлем | `t03` | Rare | план |
| `equip_head_t04_scale.png` | Чешуйчатый шлем | `t04` | Epic-Low | план |
| `equip_head_t05_plate.png` | Латный (зерцало) шлем | `t05` | Epic | план |
| `equip_head_t06_reforged.png` | Перекалённый плащёвый шлем | `t06` | Epic+ | план |
| `equip_head_t07_dragonhide.png` | Драконья кожа шлем | `t07` | Legendary | план |
| `equip_head_t08_dragonscale.png` | Драконья чешуя шлем | `t08` | Legendary+ | план |
| `equip_head_t09_magma.png` | Магмовый шлем | `t09` | Mythic | план |
| `equip_head_t10_astral.png` | Астральный шлем | `t10` | Mythic | план |
| `equip_head_t11_void.png` | Пустотный шлем | `t11` | Ascended | план |
| `equip_head_t12_dragonid.png` | Драконид шлем | `t12` | Ascended+ | план |
| `equip_chest_t01_leather.png` | Кожаный кираса / торс | `t01` | Common | план |
| `equip_chest_t02_linen.png` | Лняной (стёганка) кираса / торс | `t02` | Uncommon | план |
| `equip_chest_t03_chain.png` | Кольчужный кираса / торс | `t03` | Rare | план |
| `equip_chest_t04_scale.png` | Чешуйчатый кираса / торс | `t04` | Epic-Low | план |
| `equip_chest_t05_plate.png` | Латный (зерцало) кираса / торс | `t05` | Epic | план |
| `equip_chest_t06_reforged.png` | Перекалённый плащёвый кираса / торс | `t06` | Epic+ | план |
| `equip_chest_t07_dragonhide.png` | Драконья кожа кираса / торс | `t07` | Legendary | план |
| `equip_chest_t08_dragonscale.png` | Драконья чешуя кираса / торс | `t08` | Legendary+ | план |
| `equip_chest_t09_magma.png` | Магмовый кираса / торс | `t09` | Mythic | план |
| `equip_chest_t10_astral.png` | Астральный кираса / торс | `t10` | Mythic | план |
| `equip_chest_t11_void.png` | Пустотный кираса / торс | `t11` | Ascended | план |
| `equip_chest_t12_dragonid.png` | Драконид кираса / торс | `t12` | Ascended+ | план |
| `equip_belt_t01_copper.png` | Медный пояс | `t01` | Common | план |
| `equip_belt_t02_bronze.png` | Бронзовый пояс | `t02` | Uncommon | план |
| `equip_belt_t03_iron.png` | Кованый (железо) пояс | `t03` | Rare | план |
| `equip_belt_t04_silver.png` | Серебряный пояс | `t04` | Epic-Low | план |
| `equip_belt_t05_gold.png` | Золотой пояс | `t05` | Epic | план |
| `equip_belt_t06_blacksteel.png` | Воронёной стали пояс | `t06` | Epic+ | план |
| `equip_belt_t07_mithril.png` | Мифриловый пояс | `t07` | Legendary | план |
| `equip_belt_t08_orichalcum.png` | Орихалковый пояс | `t08` | Legendary+ | план |
| `equip_belt_t09_magma.png` | Магмовый пояс | `t09` | Mythic | план |
| `equip_belt_t10_astral.png` | Астральный пояс | `t10` | Mythic | план |
| `equip_belt_t11_void.png` | Пустотный пояс | `t11` | Ascended | план |
| `equip_belt_t12_dragonid.png` | Драконид пояс | `t12` | Ascended+ | план |
| `equip_legs_t01_leather.png` | Кожаный поножи / штаны | `t01` | Common | план |
| `equip_legs_t02_linen.png` | Лняной (стёганка) поножи / штаны | `t02` | Uncommon | план |
| `equip_legs_t03_chain.png` | Кольчужный поножи / штаны | `t03` | Rare | план |
| `equip_legs_t04_scale.png` | Чешуйчатый поножи / штаны | `t04` | Epic-Low | план |
| `equip_legs_t05_plate.png` | Латный (зерцало) поножи / штаны | `t05` | Epic | план |
| `equip_legs_t06_reforged.png` | Перекалённый плащёвый поножи / штаны | `t06` | Epic+ | план |
| `equip_legs_t07_dragonhide.png` | Драконья кожа поножи / штаны | `t07` | Legendary | план |
| `equip_legs_t08_dragonscale.png` | Драконья чешуя поножи / штаны | `t08` | Legendary+ | план |
| `equip_legs_t09_magma.png` | Магмовый поножи / штаны | `t09` | Mythic | план |
| `equip_legs_t10_astral.png` | Астральный поножи / штаны | `t10` | Mythic | план |
| `equip_legs_t11_void.png` | Пустотный поножи / штаны | `t11` | Ascended | план |
| `equip_legs_t12_dragonid.png` | Драконид поножи / штаны | `t12` | Ascended+ | план |
| `equip_feet_t01_leather.png` | Кожаный сапоги | `t01` | Common | план |
| `equip_feet_t02_linen.png` | Лняной (стёганка) сапоги | `t02` | Uncommon | план |
| `equip_feet_t03_chain.png` | Кольчужный сапоги | `t03` | Rare | план |
| `equip_feet_t04_scale.png` | Чешуйчатый сапоги | `t04` | Epic-Low | план |
| `equip_feet_t05_plate.png` | Латный (зерцало) сапоги | `t05` | Epic | план |
| `equip_feet_t06_reforged.png` | Перекалённый плащёвый сапоги | `t06` | Epic+ | план |
| `equip_feet_t07_dragonhide.png` | Драконья кожа сапоги | `t07` | Legendary | план |
| `equip_feet_t08_dragonscale.png` | Драконья чешуя сапоги | `t08` | Legendary+ | план |
| `equip_feet_t09_magma.png` | Магмовый сапоги | `t09` | Mythic | план |
| `equip_feet_t10_astral.png` | Астральный сапоги | `t10` | Mythic | план |
| `equip_feet_t11_void.png` | Пустотный сапоги | `t11` | Ascended | план |
| `equip_feet_t12_dragonid.png` | Драконид сапоги | `t12` | Ascended+ | план |
| `equip_hands_t01_leather.png` | Кожаный перчатки / рукавицы | `t01` | Common | план |
| `equip_hands_t02_linen.png` | Лняной (стёганка) перчатки / рукавицы | `t02` | Uncommon | план |
| `equip_hands_t03_chain.png` | Кольчужный перчатки / рукавицы | `t03` | Rare | план |
| `equip_hands_t04_scale.png` | Чешуйчатый перчатки / рукавицы | `t04` | Epic-Low | план |
| `equip_hands_t05_plate.png` | Латный (зерцало) перчатки / рукавицы | `t05` | Epic | план |
| `equip_hands_t06_reforged.png` | Перекалённый плащёвый перчатки / рукавицы | `t06` | Epic+ | план |
| `equip_hands_t07_dragonhide.png` | Драконья кожа перчатки / рукавицы | `t07` | Legendary | план |
| `equip_hands_t08_dragonscale.png` | Драконья чешуя перчатки / рукавицы | `t08` | Legendary+ | план |
| `equip_hands_t09_magma.png` | Магмовый перчатки / рукавицы | `t09` | Mythic | план |
| `equip_hands_t10_astral.png` | Астральный перчатки / рукавицы | `t10` | Mythic | план |
| `equip_hands_t11_void.png` | Пустотный перчатки / рукавицы | `t11` | Ascended | план |
| `equip_hands_t12_dragonid.png` | Драконид перчатки / рукавицы | `t12` | Ascended+ | план |
| `equip_offhand_t01_leather.png` | Кожаный левая рука (щит/книга/колчан/второе оружие) | `t01` | Common | план |
| `equip_offhand_t02_linen.png` | Лняной (стёганка) левая рука (щит/книга/колчан/второе оружие) | `t02` | Uncommon | план |
| `equip_offhand_t03_chain.png` | Кольчужный левая рука (щит/книга/колчан/второе оружие) | `t03` | Rare | план |
| `equip_offhand_t04_scale.png` | Чешуйчатый левая рука (щит/книга/колчан/второе оружие) | `t04` | Epic-Low | план |
| `equip_offhand_t05_plate.png` | Латный (зерцало) левая рука (щит/книга/колчан/второе оружие) | `t05` | Epic | план |
| `equip_offhand_t06_reforged.png` | Перекалённый плащёвый левая рука (щит/книга/колчан/второе оружие) | `t06` | Epic+ | план |
| `equip_offhand_t07_dragonhide.png` | Драконья кожа левая рука (щит/книга/колчан/второе оружие) | `t07` | Legendary | план |
| `equip_offhand_t08_dragonscale.png` | Драконья чешуя левая рука (щит/книга/колчан/второе оружие) | `t08` | Legendary+ | план |
| `equip_offhand_t09_magma.png` | Магмовый левая рука (щит/книга/колчан/второе оружие) | `t09` | Mythic | план |
| `equip_offhand_t10_astral.png` | Астральный левая рука (щит/книга/колчан/второе оружие) | `t10` | Mythic | план |
| `equip_offhand_t11_void.png` | Пустотный левая рука (щит/книга/колчан/второе оружие) | `t11` | Ascended | план |
| `equip_offhand_t12_dragonid.png` | Драконид левая рука (щит/книга/колчан/второе оружие) | `t12` | Ascended+ | план |
| `equip_ring_left_1_t01_copper.png` | Медный кольцо левой руки | `t01` | Common | план |
| `equip_ring_left_1_t02_bronze.png` | Бронзовый кольцо левой руки | `t02` | Uncommon | план |
| `equip_ring_left_1_t03_iron.png` | Кованый (железо) кольцо левой руки | `t03` | Rare | план |
| `equip_ring_left_1_t04_silver.png` | Серебряный кольцо левой руки | `t04` | Epic-Low | план |
| `equip_ring_left_1_t05_gold.png` | Золотой кольцо левой руки | `t05` | Epic | план |
| `equip_ring_left_1_t06_blacksteel.png` | Воронёной стали кольцо левой руки | `t06` | Epic+ | план |
| `equip_ring_left_1_t07_mithril.png` | Мифриловый кольцо левой руки | `t07` | Legendary | план |
| `equip_ring_left_1_t08_orichalcum.png` | Орихалковый кольцо левой руки | `t08` | Legendary+ | план |
| `equip_ring_left_1_t09_magma.png` | Магмовый кольцо левой руки | `t09` | Mythic | план |
| `equip_ring_left_1_t10_astral.png` | Астральный кольцо левой руки | `t10` | Mythic | план |
| `equip_ring_left_1_t11_void.png` | Пустотный кольцо левой руки | `t11` | Ascended | план |
| `equip_ring_left_1_t12_dragonid.png` | Драконид кольцо левой руки | `t12` | Ascended+ | план |
| `equip_ring_left_2_t01_copper.png` | Медный кольцо левой руки №2 | `t01` | Common | план |
| `equip_ring_left_2_t02_bronze.png` | Бронзовый кольцо левой руки №2 | `t02` | Uncommon | план |
| `equip_ring_left_2_t03_iron.png` | Кованый (железо) кольцо левой руки №2 | `t03` | Rare | план |
| `equip_ring_left_2_t04_silver.png` | Серебряный кольцо левой руки №2 | `t04` | Epic-Low | план |
| `equip_ring_left_2_t05_gold.png` | Золотой кольцо левой руки №2 | `t05` | Epic | план |
| `equip_ring_left_2_t06_blacksteel.png` | Воронёной стали кольцо левой руки №2 | `t06` | Epic+ | план |
| `equip_ring_left_2_t07_mithril.png` | Мифриловый кольцо левой руки №2 | `t07` | Legendary | план |
| `equip_ring_left_2_t08_orichalcum.png` | Орихалковый кольцо левой руки №2 | `t08` | Legendary+ | план |
| `equip_ring_left_2_t09_magma.png` | Магмовый кольцо левой руки №2 | `t09` | Mythic | план |
| `equip_ring_left_2_t10_astral.png` | Астральный кольцо левой руки №2 | `t10` | Mythic | план |
| `equip_ring_left_2_t11_void.png` | Пустотный кольцо левой руки №2 | `t11` | Ascended | план |
| `equip_ring_left_2_t12_dragonid.png` | Драконид кольцо левой руки №2 | `t12` | Ascended+ | план |
| `equip_ring_right_1_t01_copper.png` | Медный кольцо правой руки | `t01` | Common | план |
| `equip_ring_right_1_t02_bronze.png` | Бронзовый кольцо правой руки | `t02` | Uncommon | план |
| `equip_ring_right_1_t03_iron.png` | Кованый (железо) кольцо правой руки | `t03` | Rare | план |
| `equip_ring_right_1_t04_silver.png` | Серебряный кольцо правой руки | `t04` | Epic-Low | план |
| `equip_ring_right_1_t05_gold.png` | Золотой кольцо правой руки | `t05` | Epic | план |
| `equip_ring_right_1_t06_blacksteel.png` | Воронёной стали кольцо правой руки | `t06` | Epic+ | план |
| `equip_ring_right_1_t07_mithril.png` | Мифриловый кольцо правой руки | `t07` | Legendary | план |
| `equip_ring_right_1_t08_orichalcum.png` | Орихалковый кольцо правой руки | `t08` | Legendary+ | план |
| `equip_ring_right_1_t09_magma.png` | Магмовый кольцо правой руки | `t09` | Mythic | план |
| `equip_ring_right_1_t10_astral.png` | Астральный кольцо правой руки | `t10` | Mythic | план |
| `equip_ring_right_1_t11_void.png` | Пустотный кольцо правой руки | `t11` | Ascended | план |
| `equip_ring_right_1_t12_dragonid.png` | Драконид кольцо правой руки | `t12` | Ascended+ | план |
| `equip_ring_right_2_t01_copper.png` | Медный кольцо правой руки №2 | `t01` | Common | план |
| `equip_ring_right_2_t02_bronze.png` | Бронзовый кольцо правой руки №2 | `t02` | Uncommon | план |
| `equip_ring_right_2_t03_iron.png` | Кованый (железо) кольцо правой руки №2 | `t03` | Rare | план |
| `equip_ring_right_2_t04_silver.png` | Серебряный кольцо правой руки №2 | `t04` | Epic-Low | план |
| `equip_ring_right_2_t05_gold.png` | Золотой кольцо правой руки №2 | `t05` | Epic | план |
| `equip_ring_right_2_t06_blacksteel.png` | Воронёной стали кольцо правой руки №2 | `t06` | Epic+ | план |
| `equip_ring_right_2_t07_mithril.png` | Мифриловый кольцо правой руки №2 | `t07` | Legendary | план |
| `equip_ring_right_2_t08_orichalcum.png` | Орихалковый кольцо правой руки №2 | `t08` | Legendary+ | план |
| `equip_ring_right_2_t09_magma.png` | Магмовый кольцо правой руки №2 | `t09` | Mythic | план |
| `equip_ring_right_2_t10_astral.png` | Астральный кольцо правой руки №2 | `t10` | Mythic | план |
| `equip_ring_right_2_t11_void.png` | Пустотный кольцо правой руки №2 | `t11` | Ascended | план |
| `equip_ring_right_2_t12_dragonid.png` | Драконид кольцо правой руки №2 | `t12` | Ascended+ | план |
| `equip_bracelet_left_t01_copper.png` | Медный браслет левый | `t01` | Common | план |
| `equip_bracelet_left_t02_bronze.png` | Бронзовый браслет левый | `t02` | Uncommon | план |
| `equip_bracelet_left_t03_iron.png` | Кованый (железо) браслет левый | `t03` | Rare | план |
| `equip_bracelet_left_t04_silver.png` | Серебряный браслет левый | `t04` | Epic-Low | план |
| `equip_bracelet_left_t05_gold.png` | Золотой браслет левый | `t05` | Epic | план |
| `equip_bracelet_left_t06_blacksteel.png` | Воронёной стали браслет левый | `t06` | Epic+ | план |
| `equip_bracelet_left_t07_mithril.png` | Мифриловый браслет левый | `t07` | Legendary | план |
| `equip_bracelet_left_t08_orichalcum.png` | Орихалковый браслет левый | `t08` | Legendary+ | план |
| `equip_bracelet_left_t09_magma.png` | Магмовый браслет левый | `t09` | Mythic | план |
| `equip_bracelet_left_t10_astral.png` | Астральный браслет левый | `t10` | Mythic | план |
| `equip_bracelet_left_t11_void.png` | Пустотный браслет левый | `t11` | Ascended | план |
| `equip_bracelet_left_t12_dragonid.png` | Драконид браслет левый | `t12` | Ascended+ | план |
| `equip_bracelet_right_t01_copper.png` | Медный браслет правый | `t01` | Common | план |
| `equip_bracelet_right_t02_bronze.png` | Бронзовый браслет правый | `t02` | Uncommon | план |
| `equip_bracelet_right_t03_iron.png` | Кованый (железо) браслет правый | `t03` | Rare | план |
| `equip_bracelet_right_t04_silver.png` | Серебряный браслет правый | `t04` | Epic-Low | план |
| `equip_bracelet_right_t05_gold.png` | Золотой браслет правый | `t05` | Epic | план |
| `equip_bracelet_right_t06_blacksteel.png` | Воронёной стали браслет правый | `t06` | Epic+ | план |
| `equip_bracelet_right_t07_mithril.png` | Мифриловый браслет правый | `t07` | Legendary | план |
| `equip_bracelet_right_t08_orichalcum.png` | Орихалковый браслет правый | `t08` | Legendary+ | план |
| `equip_bracelet_right_t09_magma.png` | Магмовый браслет правый | `t09` | Mythic | план |
| `equip_bracelet_right_t10_astral.png` | Астральный браслет правый | `t10` | Mythic | план |
| `equip_bracelet_right_t11_void.png` | Пустотный браслет правый | `t11` | Ascended | план |
| `equip_bracelet_right_t12_dragonid.png` | Драконид браслет правый | `t12` | Ascended+ | план |
| `equip_necklace_t01_copper.png` | Медный ожерелье / колье | `t01` | Common | план |
| `equip_necklace_t02_bronze.png` | Бронзовый ожерелье / колье | `t02` | Uncommon | план |
| `equip_necklace_t03_iron.png` | Кованый (железо) ожерелье / колье | `t03` | Rare | план |
| `equip_necklace_t04_silver.png` | Серебряный ожерелье / колье | `t04` | Epic-Low | план |
| `equip_necklace_t05_gold.png` | Золотой ожерелье / колье | `t05` | Epic | план |
| `equip_necklace_t06_blacksteel.png` | Воронёной стали ожерелье / колье | `t06` | Epic+ | план |
| `equip_necklace_t07_mithril.png` | Мифриловый ожерелье / колье | `t07` | Legendary | план |
| `equip_necklace_t08_orichalcum.png` | Орихалковый ожерелье / колье | `t08` | Legendary+ | план |
| `equip_necklace_t09_magma.png` | Магмовый ожерелье / колье | `t09` | Mythic | план |
| `equip_necklace_t10_astral.png` | Астральный ожерелье / колье | `t10` | Mythic | план |
| `equip_necklace_t11_void.png` | Пустотный ожерелье / колье | `t11` | Ascended | план |
| `equip_necklace_t12_dragonid.png` | Драконид ожерелье / колье | `t12` | Ascended+ | план |

### Оружие (правая рука) · 227 шт. → `icons/items/weapons/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `wpn_axe_t01_stone.png` | Топор боевой (одноручный) · камень / дерево | `t01` | Common | план |
| `wpn_axe_t02_copper.png` | Топор боевой (одноручный) · медь | `t02` | Uncommon | план |
| `wpn_axe_t03_bronze.png` | Топор боевой (одноручный) · бронза | `t03` | Rare | план |
| `wpn_axe_t04_iron.png` | Топор боевой (одноручный) · железо | `t04` | Epic-Low | план |
| `wpn_axe_t05_steel.png` | Топор боевой (одноручный) · сталь | `t05` | Epic | план |
| `wpn_axe_t06_blacksteel.png` | Топор боевой (одноручный) · воронёная сталь | `t06` | Epic+ | план |
| `wpn_axe_t07_mithril.png` | Топор боевой (одноручный) · мифрил | `t07` | Legendary | план |
| `wpn_axe_t08_silversteel.png` | Топор боевой (одноручный) · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_axe_t09_orichalcum.png` | Топор боевой (одноручный) · орихалк | `t09` | Mythic | план |
| `wpn_axe_t10_magma.png` | Топор боевой (одноручный) · магмит | `t10` | Mythic | план |
| `wpn_axe_t11_astral.png` | Топор боевой (одноручный) · астралит | `t11` | Ascended | план |
| `wpn_bow_t01_stone.png` | Лук составной · камень / дерево | `t01` | Common | план |
| `wpn_bow_t02_copper.png` | Лук составной · медь | `t02` | Uncommon | план |
| `wpn_bow_t03_bronze.png` | Лук составной · бронза | `t03` | Rare | план |
| `wpn_bow_t04_iron.png` | Лук составной · железо | `t04` | Epic-Low | план |
| `wpn_bow_t05_steel.png` | Лук составной · сталь | `t05` | Epic | план |
| `wpn_bow_t06_blacksteel.png` | Лук составной · воронёная сталь | `t06` | Epic+ | план |
| `wpn_bow_t07_mithril.png` | Лук составной · мифрил | `t07` | Legendary | план |
| `wpn_bow_t08_silversteel.png` | Лук составной · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_bow_t09_orichalcum.png` | Лук составной · орихалк | `t09` | Mythic | план |
| `wpn_bow_t10_magma.png` | Лук составной · магмит | `t10` | Mythic | план |
| `wpn_bow_t11_astral.png` | Лук составной · астралит | `t11` | Ascended | план |
| `wpn_bow_t12_void.png` | Лук составной · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_chain_flail_t05_steel.png` | Кистень/цеп · сталь | `t05` | Epic | план |
| `wpn_chain_flail_t06_blacksteel.png` | Кистень/цеп · воронёная сталь | `t06` | Epic+ | план |
| `wpn_chain_flail_t07_mithril.png` | Кистень/цеп · мифрил | `t07` | Legendary | план |
| `wpn_chain_flail_t08_silversteel.png` | Кистень/цеп · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_chain_flail_t09_orichalcum.png` | Кистень/цеп · орихалк | `t09` | Mythic | план |
| `wpn_chain_flail_t10_magma.png` | Кистень/цеп · магмит | `t10` | Mythic | план |
| `wpn_chain_flail_t11_astral.png` | Кистень/цеп · астралит | `t11` | Ascended | план |
| `wpn_chain_flail_t12_void.png` | Кистень/цеп · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_crossbow_t04_iron.png` | Арбалет · железо | `t04` | Epic-Low | план |
| `wpn_crossbow_t05_steel.png` | Арбалет · сталь | `t05` | Epic | план |
| `wpn_crossbow_t06_blacksteel.png` | Арбалет · воронёная сталь | `t06` | Epic+ | план |
| `wpn_crossbow_t07_mithril.png` | Арбалет · мифрил | `t07` | Legendary | план |
| `wpn_crossbow_t08_silversteel.png` | Арбалет · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_crossbow_t09_orichalcum.png` | Арбалет · орихалк | `t09` | Mythic | план |
| `wpn_crossbow_t10_magma.png` | Арбалет · магмит | `t10` | Mythic | план |
| `wpn_crossbow_t11_astral.png` | Арбалет · астралит | `t11` | Ascended | план |
| `wpn_crossbow_t12_void.png` | Арбалет · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_dagger_t01_stone.png` | Кинжал · камень / дерево | `t01` | Common | план |
| `wpn_dagger_t02_copper.png` | Кинжал · медь | `t02` | Uncommon | план |
| `wpn_dagger_t03_bronze.png` | Кинжал · бронза | `t03` | Rare | план |
| `wpn_dagger_t04_iron.png` | Кинжал · железо | `t04` | Epic-Low | план |
| `wpn_dagger_t05_steel.png` | Кинжал · сталь | `t05` | Epic | план |
| `wpn_dagger_t06_blacksteel.png` | Кинжал · воронёная сталь | `t06` | Epic+ | план |
| `wpn_dagger_t07_mithril.png` | Кинжал · мифрил | `t07` | Legendary | план |
| `wpn_dagger_t08_silversteel.png` | Кинжал · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_dagger_t09_orichalcum.png` | Кинжал · орихалк | `t09` | Mythic | план |
| `wpn_dagger_t10_magma.png` | Кинжал · магмит | `t10` | Mythic | план |
| `wpn_dagger_t11_astral.png` | Кинжал · астралит | `t11` | Ascended | план |
| `wpn_dagger_t12_void.png` | Кинжал · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_fistblade_t01_stone.png` | Кастет-клинок · камень / дерево | `t01` | Common | план |
| `wpn_fistblade_t02_copper.png` | Кастет-клинок · медь | `t02` | Uncommon | план |
| `wpn_fistblade_t03_bronze.png` | Кастет-клинок · бронза | `t03` | Rare | план |
| `wpn_fistblade_t04_iron.png` | Кастет-клинок · железо | `t04` | Epic-Low | план |
| `wpn_fistblade_t05_steel.png` | Кастет-клинок · сталь | `t05` | Epic | план |
| `wpn_fistblade_t06_blacksteel.png` | Кастет-клинок · воронёная сталь | `t06` | Epic+ | план |
| `wpn_fistblade_t07_mithril.png` | Кастет-клинок · мифрил | `t07` | Legendary | план |
| `wpn_fistblade_t08_silversteel.png` | Кастет-клинок · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_fistblade_t09_orichalcum.png` | Кастет-клинок · орихалк | `t09` | Mythic | план |
| `wpn_greataxe_t03_bronze.png` | Секира двуручная · бронза | `t03` | Rare | план |
| `wpn_greataxe_t04_iron.png` | Секира двуручная · железо | `t04` | Epic-Low | план |
| `wpn_greataxe_t05_steel.png` | Секира двуручная · сталь | `t05` | Epic | план |
| `wpn_greataxe_t06_blacksteel.png` | Секира двуручная · воронёная сталь | `t06` | Epic+ | план |
| `wpn_greataxe_t07_mithril.png` | Секира двуручная · мифрил | `t07` | Legendary | план |
| `wpn_greataxe_t08_silversteel.png` | Секира двуручная · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_greataxe_t09_orichalcum.png` | Секира двуручная · орихалк | `t09` | Mythic | план |
| `wpn_greataxe_t10_magma.png` | Секира двуручная · магмит | `t10` | Mythic | план |
| `wpn_greataxe_t11_astral.png` | Секира двуручная · астралит | `t11` | Ascended | план |
| `wpn_greataxe_t12_void.png` | Секира двуручная · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_greatsword_t04_iron.png` | Двуручный меч · железо | `t04` | Epic-Low | план |
| `wpn_greatsword_t05_steel.png` | Двуручный меч · сталь | `t05` | Epic | план |
| `wpn_greatsword_t06_blacksteel.png` | Двуручный меч · воронёная сталь | `t06` | Epic+ | план |
| `wpn_greatsword_t07_mithril.png` | Двуручный меч · мифрил | `t07` | Legendary | план |
| `wpn_greatsword_t08_silversteel.png` | Двуручный меч · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_greatsword_t09_orichalcum.png` | Двуручный меч · орихалк | `t09` | Mythic | план |
| `wpn_greatsword_t10_magma.png` | Двуручный меч · магмит | `t10` | Mythic | план |
| `wpn_greatsword_t11_astral.png` | Двуручный меч · астралит | `t11` | Ascended | план |
| `wpn_greatsword_t12_void.png` | Двуручный меч · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_halberd_t03_bronze.png` | Алебарда · бронза | `t03` | Rare | план |
| `wpn_halberd_t04_iron.png` | Алебарда · железо | `t04` | Epic-Low | план |
| `wpn_halberd_t05_steel.png` | Алебарда · сталь | `t05` | Epic | план |
| `wpn_halberd_t06_blacksteel.png` | Алебарда · воронёная сталь | `t06` | Epic+ | план |
| `wpn_halberd_t07_mithril.png` | Алебарда · мифрил | `t07` | Legendary | план |
| `wpn_halberd_t08_silversteel.png` | Алебарда · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_halberd_t09_orichalcum.png` | Алебарда · орихалк | `t09` | Mythic | план |
| `wpn_halberd_t10_magma.png` | Алебарда · магмит | `t10` | Mythic | план |
| `wpn_halberd_t11_astral.png` | Алебарда · астралит | `t11` | Ascended | план |
| `wpn_halberd_t12_void.png` | Алебарда · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_hammer_t04_iron.png` | Молот-кувалда · железо | `t04` | Epic-Low | план |
| `wpn_hammer_t05_steel.png` | Молот-кувалда · сталь | `t05` | Epic | план |
| `wpn_hammer_t06_blacksteel.png` | Молот-кувалда · воронёная сталь | `t06` | Epic+ | план |
| `wpn_hammer_t07_mithril.png` | Молот-кувалда · мифрил | `t07` | Legendary | план |
| `wpn_hammer_t08_silversteel.png` | Молот-кувалда · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_hammer_t09_orichalcum.png` | Молот-кувалда · орихалк | `t09` | Mythic | план |
| `wpn_hammer_t10_magma.png` | Молот-кувалда · магмит | `t10` | Mythic | план |
| `wpn_hammer_t11_astral.png` | Молот-кувалда · астралит | `t11` | Ascended | план |
| `wpn_hammer_t12_void.png` | Молот-кувалда · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_longbow_t03_bronze.png` | Длинный лук · бронза | `t03` | Rare | план |
| `wpn_longbow_t04_iron.png` | Длинный лук · железо | `t04` | Epic-Low | план |
| `wpn_longbow_t05_steel.png` | Длинный лук · сталь | `t05` | Epic | план |
| `wpn_longbow_t06_blacksteel.png` | Длинный лук · воронёная сталь | `t06` | Epic+ | план |
| `wpn_longbow_t07_mithril.png` | Длинный лук · мифрил | `t07` | Legendary | план |
| `wpn_longbow_t08_silversteel.png` | Длинный лук · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_longbow_t09_orichalcum.png` | Длинный лук · орихалк | `t09` | Mythic | план |
| `wpn_longbow_t10_magma.png` | Длинный лук · магмит | `t10` | Mythic | план |
| `wpn_longbow_t11_astral.png` | Длинный лук · астралит | `t11` | Ascended | план |
| `wpn_longbow_t12_void.png` | Длинный лук · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_longsword_t02_copper.png` | Длинный меч (бастард) · медь | `t02` | Uncommon | план |
| `wpn_longsword_t03_bronze.png` | Длинный меч (бастард) · бронза | `t03` | Rare | план |
| `wpn_longsword_t04_iron.png` | Длинный меч (бастард) · железо | `t04` | Epic-Low | план |
| `wpn_longsword_t05_steel.png` | Длинный меч (бастард) · сталь | `t05` | Epic | план |
| `wpn_longsword_t06_blacksteel.png` | Длинный меч (бастард) · воронёная сталь | `t06` | Epic+ | план |
| `wpn_longsword_t07_mithril.png` | Длинный меч (бастард) · мифрил | `t07` | Legendary | план |
| `wpn_longsword_t08_silversteel.png` | Длинный меч (бастард) · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_longsword_t09_orichalcum.png` | Длинный меч (бастард) · орихалк | `t09` | Mythic | план |
| `wpn_longsword_t10_magma.png` | Длинный меч (бастард) · магмит | `t10` | Mythic | план |
| `wpn_longsword_t11_astral.png` | Длинный меч (бастард) · астралит | `t11` | Ascended | план |
| `wpn_longsword_t12_void.png` | Длинный меч (бастард) · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_mace_t01_stone.png` | Булава · камень / дерево | `t01` | Common | план |
| `wpn_mace_t02_copper.png` | Булава · медь | `t02` | Uncommon | план |
| `wpn_mace_t03_bronze.png` | Булава · бронза | `t03` | Rare | план |
| `wpn_mace_t04_iron.png` | Булава · железо | `t04` | Epic-Low | план |
| `wpn_mace_t05_steel.png` | Булава · сталь | `t05` | Epic | план |
| `wpn_mace_t06_blacksteel.png` | Булава · воронёная сталь | `t06` | Epic+ | план |
| `wpn_mace_t07_mithril.png` | Булава · мифрил | `t07` | Legendary | план |
| `wpn_mace_t08_silversteel.png` | Булава · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_mace_t09_orichalcum.png` | Булава · орихалк | `t09` | Mythic | план |
| `wpn_mace_t10_magma.png` | Булава · магмит | `t10` | Mythic | план |
| `wpn_pike_t02_copper.png` | Пика · медь | `t02` | Uncommon | план |
| `wpn_pike_t03_bronze.png` | Пика · бронза | `t03` | Rare | план |
| `wpn_pike_t04_iron.png` | Пика · железо | `t04` | Epic-Low | план |
| `wpn_pike_t05_steel.png` | Пика · сталь | `t05` | Epic | план |
| `wpn_pike_t06_blacksteel.png` | Пика · воронёная сталь | `t06` | Epic+ | план |
| `wpn_pike_t07_mithril.png` | Пика · мифрил | `t07` | Legendary | план |
| `wpn_pike_t08_silversteel.png` | Пика · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_pike_t09_orichalcum.png` | Пика · орихалк | `t09` | Mythic | план |
| `wpn_saber_t03_bronze.png` | Сабля · бронза | `t03` | Rare | план |
| `wpn_saber_t04_iron.png` | Сабля · железо | `t04` | Epic-Low | план |
| `wpn_saber_t05_steel.png` | Сабля · сталь | `t05` | Epic | план |
| `wpn_saber_t06_blacksteel.png` | Сабля · воронёная сталь | `t06` | Epic+ | план |
| `wpn_saber_t07_mithril.png` | Сабля · мифрил | `t07` | Legendary | план |
| `wpn_saber_t08_silversteel.png` | Сабля · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_saber_t09_orichalcum.png` | Сабля · орихалк | `t09` | Mythic | план |
| `wpn_saber_t10_magma.png` | Сабля · магмит | `t10` | Mythic | план |
| `wpn_saber_t11_astral.png` | Сабля · астралит | `t11` | Ascended | план |
| `wpn_scythe_t06_blacksteel.png` | Коса · воронёная сталь | `t06` | Epic+ | план |
| `wpn_scythe_t07_mithril.png` | Коса · мифрил | `t07` | Legendary | план |
| `wpn_scythe_t08_silversteel.png` | Коса · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_scythe_t09_orichalcum.png` | Коса · орихалк | `t09` | Mythic | план |
| `wpn_scythe_t10_magma.png` | Коса · магмит | `t10` | Mythic | план |
| `wpn_scythe_t11_astral.png` | Коса · астралит | `t11` | Ascended | план |
| `wpn_scythe_t12_void.png` | Коса · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_shortsword_t01_stone.png` | Меч короткий (арминг) · камень / дерево | `t01` | Common | план |
| `wpn_shortsword_t02_copper.png` | Меч короткий (арминг) · медь | `t02` | Uncommon | план |
| `wpn_shortsword_t03_bronze.png` | Меч короткий (арминг) · бронза | `t03` | Rare | план |
| `wpn_shortsword_t04_iron.png` | Меч короткий (арминг) · железо | `t04` | Epic-Low | план |
| `wpn_shortsword_t05_steel.png` | Меч короткий (арминг) · сталь | `t05` | Epic | план |
| `wpn_shortsword_t06_blacksteel.png` | Меч короткий (арминг) · воронёная сталь | `t06` | Epic+ | план |
| `wpn_shortsword_t07_mithril.png` | Меч короткий (арминг) · мифрил | `t07` | Legendary | план |
| `wpn_shortsword_t08_silversteel.png` | Меч короткий (арминг) · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_shortsword_t09_orichalcum.png` | Меч короткий (арминг) · орихалк | `t09` | Mythic | план |
| `wpn_shortsword_t10_magma.png` | Меч короткий (арминг) · магмит | `t10` | Mythic | план |
| `wpn_spear_t01_stone.png` | Копьё · камень / дерево | `t01` | Common | план |
| `wpn_spear_t02_copper.png` | Копьё · медь | `t02` | Uncommon | план |
| `wpn_spear_t03_bronze.png` | Копьё · бронза | `t03` | Rare | план |
| `wpn_spear_t04_iron.png` | Копьё · железо | `t04` | Epic-Low | план |
| `wpn_spear_t05_steel.png` | Копьё · сталь | `t05` | Epic | план |
| `wpn_spear_t06_blacksteel.png` | Копьё · воронёная сталь | `t06` | Epic+ | план |
| `wpn_spear_t07_mithril.png` | Копьё · мифрил | `t07` | Legendary | план |
| `wpn_spear_t08_silversteel.png` | Копьё · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_spear_t09_orichalcum.png` | Копьё · орихалк | `t09` | Mythic | план |
| `wpn_spear_t10_magma.png` | Копьё · магмит | `t10` | Mythic | план |
| `wpn_staff_t02_copper.png` | Посох · медь | `t02` | Uncommon | план |
| `wpn_staff_t03_bronze.png` | Посох · бронза | `t03` | Rare | план |
| `wpn_staff_t04_iron.png` | Посох · железо | `t04` | Epic-Low | план |
| `wpn_staff_t05_steel.png` | Посох · сталь | `t05` | Epic | план |
| `wpn_staff_t06_blacksteel.png` | Посох · воронёная сталь | `t06` | Epic+ | план |
| `wpn_staff_t07_mithril.png` | Посох · мифрил | `t07` | Legendary | план |
| `wpn_staff_t08_silversteel.png` | Посох · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_staff_t09_orichalcum.png` | Посох · орихалк | `t09` | Mythic | план |
| `wpn_staff_t10_magma.png` | Посох · магмит | `t10` | Mythic | план |
| `wpn_staff_t11_astral.png` | Посох · астралит | `t11` | Ascended | план |
| `wpn_staff_t12_void.png` | Посох · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_sword_t01_stone.png` | Меч одноручный · камень / дерево | `t01` | Common | план |
| `wpn_sword_t02_copper.png` | Меч одноручный · медь | `t02` | Uncommon | план |
| `wpn_sword_t03_bronze.png` | Меч одноручный · бронза | `t03` | Rare | план |
| `wpn_sword_t04_iron.png` | Меч одноручный · железо | `t04` | Epic-Low | план |
| `wpn_sword_t05_steel.png` | Меч одноручный · сталь | `t05` | Epic | план |
| `wpn_sword_t06_blacksteel.png` | Меч одноручный · воронёная сталь | `t06` | Epic+ | план |
| `wpn_sword_t07_mithril.png` | Меч одноручный · мифрил | `t07` | Legendary | план |
| `wpn_sword_t08_silversteel.png` | Меч одноручный · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_sword_t09_orichalcum.png` | Меч одноручный · орихалк | `t09` | Mythic | план |
| `wpn_sword_t10_magma.png` | Меч одноручный · магмит | `t10` | Mythic | план |
| `wpn_sword_t11_astral.png` | Меч одноручный · астралит | `t11` | Ascended | план |
| `wpn_sword_t12_void.png` | Меч одноручный · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_tome_t03_bronze.png` | Гримуар · бронза | `t03` | Rare | план |
| `wpn_tome_t04_iron.png` | Гримуар · железо | `t04` | Epic-Low | план |
| `wpn_tome_t05_steel.png` | Гримуар · сталь | `t05` | Epic | план |
| `wpn_tome_t06_blacksteel.png` | Гримуар · воронёная сталь | `t06` | Epic+ | план |
| `wpn_tome_t07_mithril.png` | Гримуар · мифрил | `t07` | Legendary | план |
| `wpn_tome_t08_silversteel.png` | Гримуар · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_tome_t09_orichalcum.png` | Гримуар · орихалк | `t09` | Mythic | план |
| `wpn_tome_t10_magma.png` | Гримуар · магмит | `t10` | Mythic | план |
| `wpn_tome_t11_astral.png` | Гримуар · астралит | `t11` | Ascended | план |
| `wpn_tome_t12_void.png` | Гримуар · пустотный сплав / драконид | `t12` | Ascended+ | план |
| `wpn_wand_t01_stone.png` | Волшебная палочка · камень / дерево | `t01` | Common | план |
| `wpn_wand_t02_copper.png` | Волшебная палочка · медь | `t02` | Uncommon | план |
| `wpn_wand_t03_bronze.png` | Волшебная палочка · бронза | `t03` | Rare | план |
| `wpn_wand_t04_iron.png` | Волшебная палочка · железо | `t04` | Epic-Low | план |
| `wpn_wand_t05_steel.png` | Волшебная палочка · сталь | `t05` | Epic | план |
| `wpn_wand_t06_blacksteel.png` | Волшебная палочка · воронёная сталь | `t06` | Epic+ | план |
| `wpn_wand_t07_mithril.png` | Волшебная палочка · мифрил | `t07` | Legendary | план |
| `wpn_wand_t08_silversteel.png` | Волшебная палочка · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_wand_t09_orichalcum.png` | Волшебная палочка · орихалк | `t09` | Mythic | план |
| `wpn_wand_t10_magma.png` | Волшебная палочка · магмит | `t10` | Mythic | план |
| `wpn_warhammer_t03_bronze.png` | Боевой молот · бронза | `t03` | Rare | план |
| `wpn_warhammer_t04_iron.png` | Боевой молот · железо | `t04` | Epic-Low | план |
| `wpn_warhammer_t05_steel.png` | Боевой молот · сталь | `t05` | Epic | план |
| `wpn_warhammer_t06_blacksteel.png` | Боевой молот · воронёная сталь | `t06` | Epic+ | план |
| `wpn_warhammer_t07_mithril.png` | Боевой молот · мифрил | `t07` | Legendary | план |
| `wpn_warhammer_t08_silversteel.png` | Боевой молот · сталь + серебро | `t08` | Legendary+ | план |
| `wpn_warhammer_t09_orichalcum.png` | Боевой молот · орихалк | `t09` | Mythic | план |
| `wpn_warhammer_t10_magma.png` | Боевой молот · магмит | `t10` | Mythic | план |
| `wpn_warhammer_t11_astral.png` | Боевой молот · астралит | `t11` | Ascended | план |
| `wpn_warhammer_t12_void.png` | Боевой молот · пустотный сплав / драконид | `t12` | Ascended+ | план |

### Левая ячейка · 84 шт. → `icons/items/offhand/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `off_shield_kite_t01_leather.png` | Щит норманнский (капля) · Кожаный | `t01` | Common | план |
| `off_shield_kite_t02_linen.png` | Щит норманнский (капля) · Лняной (стёганка) | `t02` | Uncommon | план |
| `off_shield_kite_t03_chain.png` | Щит норманнский (капля) · Кольчужный | `t03` | Rare | план |
| `off_shield_kite_t04_scale.png` | Щит норманнский (капля) · Чешуйчатый | `t04` | Epic-Low | план |
| `off_shield_kite_t05_plate.png` | Щит норманнский (капля) · Латный (зерцало) | `t05` | Epic | план |
| `off_shield_kite_t06_reforged.png` | Щит норманнский (капля) · Перекалённый плащёвый | `t06` | Epic+ | план |
| `off_shield_kite_t07_dragonhide.png` | Щит норманнский (капля) · Драконья кожа | `t07` | Legendary | план |
| `off_shield_kite_t08_dragonscale.png` | Щит норманнский (капля) · Драконья чешуя | `t08` | Legendary+ | план |
| `off_shield_kite_t09_magma.png` | Щит норманнский (капля) · Магмовый | `t09` | Mythic | план |
| `off_shield_kite_t10_astral.png` | Щит норманнский (капля) · Астральный | `t10` | Mythic | план |
| `off_shield_kite_t11_void.png` | Щит норманнский (капля) · Пустотный | `t11` | Ascended | план |
| `off_shield_kite_t12_dragonid.png` | Щит норманнский (капля) · Драконид | `t12` | Ascended+ | план |
| `off_shield_buckler_t01_leather.png` | Баклер круглый · Кожаный | `t01` | Common | план |
| `off_shield_buckler_t02_linen.png` | Баклер круглый · Лняной (стёганка) | `t02` | Uncommon | план |
| `off_shield_buckler_t03_chain.png` | Баклер круглый · Кольчужный | `t03` | Rare | план |
| `off_shield_buckler_t04_scale.png` | Баклер круглый · Чешуйчатый | `t04` | Epic-Low | план |
| `off_shield_buckler_t05_plate.png` | Баклер круглый · Латный (зерцало) | `t05` | Epic | план |
| `off_shield_buckler_t06_reforged.png` | Баклер круглый · Перекалённый плащёвый | `t06` | Epic+ | план |
| `off_shield_buckler_t07_dragonhide.png` | Баклер круглый · Драконья кожа | `t07` | Legendary | план |
| `off_shield_buckler_t08_dragonscale.png` | Баклер круглый · Драконья чешуя | `t08` | Legendary+ | план |
| `off_shield_buckler_t09_magma.png` | Баклер круглый · Магмовый | `t09` | Mythic | план |
| `off_shield_buckler_t10_astral.png` | Баклер круглый · Астральный | `t10` | Mythic | план |
| `off_shield_buckler_t11_void.png` | Баклер круглый · Пустотный | `t11` | Ascended | план |
| `off_shield_buckler_t12_dragonid.png` | Баклер круглый · Драконид | `t12` | Ascended+ | план |
| `off_shield_tower_t01_leather.png` | Стеновой щит (башенный) · Кожаный | `t01` | Common | план |
| `off_shield_tower_t02_linen.png` | Стеновой щит (башенный) · Лняной (стёганка) | `t02` | Uncommon | план |
| `off_shield_tower_t03_chain.png` | Стеновой щит (башенный) · Кольчужный | `t03` | Rare | план |
| `off_shield_tower_t04_scale.png` | Стеновой щит (башенный) · Чешуйчатый | `t04` | Epic-Low | план |
| `off_shield_tower_t05_plate.png` | Стеновой щит (башенный) · Латный (зерцало) | `t05` | Epic | план |
| `off_shield_tower_t06_reforged.png` | Стеновой щит (башенный) · Перекалённый плащёвый | `t06` | Epic+ | план |
| `off_shield_tower_t07_dragonhide.png` | Стеновой щит (башенный) · Драконья кожа | `t07` | Legendary | план |
| `off_shield_tower_t08_dragonscale.png` | Стеновой щит (башенный) · Драконья чешуя | `t08` | Legendary+ | план |
| `off_shield_tower_t09_magma.png` | Стеновой щит (башенный) · Магмовый | `t09` | Mythic | план |
| `off_shield_tower_t10_astral.png` | Стеновой щит (башенный) · Астральный | `t10` | Mythic | план |
| `off_shield_tower_t11_void.png` | Стеновой щит (башенный) · Пустотный | `t11` | Ascended | план |
| `off_shield_tower_t12_dragonid.png` | Стеновой щит (башенный) · Драконид | `t12` | Ascended+ | план |
| `off_tome_t01_copper.png` | Книга заклинаний (левая рука) · Медный | `t01` | Common | план |
| `off_tome_t02_bronze.png` | Книга заклинаний (левая рука) · Бронзовый | `t02` | Uncommon | план |
| `off_tome_t03_iron.png` | Книга заклинаний (левая рука) · Кованый (железо) | `t03` | Rare | план |
| `off_tome_t04_silver.png` | Книга заклинаний (левая рука) · Серебряный | `t04` | Epic-Low | план |
| `off_tome_t05_gold.png` | Книга заклинаний (левая рука) · Золотой | `t05` | Epic | план |
| `off_tome_t06_blacksteel.png` | Книга заклинаний (левая рука) · Воронёной стали | `t06` | Epic+ | план |
| `off_tome_t07_mithril.png` | Книга заклинаний (левая рука) · Мифриловый | `t07` | Legendary | план |
| `off_tome_t08_orichalcum.png` | Книга заклинаний (левая рука) · Орихалковый | `t08` | Legendary+ | план |
| `off_tome_t09_magma.png` | Книга заклинаний (левая рука) · Магмовый | `t09` | Mythic | план |
| `off_tome_t10_astral.png` | Книга заклинаний (левая рука) · Астральный | `t10` | Mythic | план |
| `off_tome_t11_void.png` | Книга заклинаний (левая рука) · Пустотный | `t11` | Ascended | план |
| `off_tome_t12_dragonid.png` | Книга заклинаний (левая рука) · Драконид | `t12` | Ascended+ | план |
| `off_quiver_arrows_t01_copper.png` | Колчан со стрелами · Медный | `t01` | Common | план |
| `off_quiver_arrows_t02_bronze.png` | Колчан со стрелами · Бронзовый | `t02` | Uncommon | план |
| `off_quiver_arrows_t03_iron.png` | Колчан со стрелами · Кованый (железо) | `t03` | Rare | план |
| `off_quiver_arrows_t04_silver.png` | Колчан со стрелами · Серебряный | `t04` | Epic-Low | план |
| `off_quiver_arrows_t05_gold.png` | Колчан со стрелами · Золотой | `t05` | Epic | план |
| `off_quiver_arrows_t06_blacksteel.png` | Колчан со стрелами · Воронёной стали | `t06` | Epic+ | план |
| `off_quiver_arrows_t07_mithril.png` | Колчан со стрелами · Мифриловый | `t07` | Legendary | план |
| `off_quiver_arrows_t08_orichalcum.png` | Колчан со стрелами · Орихалковый | `t08` | Legendary+ | план |
| `off_quiver_arrows_t09_magma.png` | Колчан со стрелами · Магмовый | `t09` | Mythic | план |
| `off_quiver_arrows_t10_astral.png` | Колчан со стрелами · Астральный | `t10` | Mythic | план |
| `off_quiver_arrows_t11_void.png` | Колчан со стрелами · Пустотный | `t11` | Ascended | план |
| `off_quiver_arrows_t12_dragonid.png` | Колчан со стрелами · Драконид | `t12` | Ascended+ | план |
| `off_sword_offhand_t01_copper.png` | Второе (парадное) оружие · Медный | `t01` | Common | план |
| `off_sword_offhand_t02_bronze.png` | Второе (парадное) оружие · Бронзовый | `t02` | Uncommon | план |
| `off_sword_offhand_t03_iron.png` | Второе (парадное) оружие · Кованый (железо) | `t03` | Rare | план |
| `off_sword_offhand_t04_silver.png` | Второе (парадное) оружие · Серебряный | `t04` | Epic-Low | план |
| `off_sword_offhand_t05_gold.png` | Второе (парадное) оружие · Золотой | `t05` | Epic | план |
| `off_sword_offhand_t06_blacksteel.png` | Второе (парадное) оружие · Воронёной стали | `t06` | Epic+ | план |
| `off_sword_offhand_t07_mithril.png` | Второе (парадное) оружие · Мифриловый | `t07` | Legendary | план |
| `off_sword_offhand_t08_orichalcum.png` | Второе (парадное) оружие · Орихалковый | `t08` | Legendary+ | план |
| `off_sword_offhand_t09_magma.png` | Второе (парадное) оружие · Магмовый | `t09` | Mythic | план |
| `off_sword_offhand_t10_astral.png` | Второе (парадное) оружие · Астральный | `t10` | Mythic | план |
| `off_sword_offhand_t11_void.png` | Второе (парадное) оружие · Пустотный | `t11` | Ascended | план |
| `off_sword_offhand_t12_dragonid.png` | Второе (парадное) оружие · Драконид | `t12` | Ascended+ | план |
| `off_torch_t01_copper.png` | Факел / лампада · Медный | `t01` | Common | план |
| `off_torch_t02_bronze.png` | Факел / лампада · Бронзовый | `t02` | Uncommon | план |
| `off_torch_t03_iron.png` | Факел / лампада · Кованый (железо) | `t03` | Rare | план |
| `off_torch_t04_silver.png` | Факел / лампада · Серебряный | `t04` | Epic-Low | план |
| `off_torch_t05_gold.png` | Факел / лампада · Золотой | `t05` | Epic | план |
| `off_torch_t06_blacksteel.png` | Факел / лампада · Воронёной стали | `t06` | Epic+ | план |
| `off_torch_t07_mithril.png` | Факел / лампада · Мифриловый | `t07` | Legendary | план |
| `off_torch_t08_orichalcum.png` | Факел / лампада · Орихалковый | `t08` | Legendary+ | план |
| `off_torch_t09_magma.png` | Факел / лампада · Магмовый | `t09` | Mythic | план |
| `off_torch_t10_astral.png` | Факел / лампада · Астральный | `t10` | Mythic | план |
| `off_torch_t11_void.png` | Факел / лампада · Пустотный | `t11` | Ascended | план |
| `off_torch_t12_dragonid.png` | Факел / лампада · Драконид | `t12` | Ascended+ | план |

### Украшения · Кольцо · 15 шт. → `icons/jewelry/rings/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_ring_fire.png` | Кольцо · Пламя | `t05` | Epic | done |
| `jew_ring_ice.png` | Кольцо · Иней / лёд | `t03` | Rare | done |
| `jew_ring_lightning.png` | Кольцо · Гроза | `t04` | Epic-Low | done |
| `jew_ring_poison.png` | Кольцо · Яд | `t02` | Uncommon | done |
| `jew_ring_light.png` | Кольцо · Свет | `t05` | Epic | done |
| `jew_ring_nature.png` | Кольцо · Природа / древо | `t02` | Uncommon | done |
| `jew_ring_blood.png` | Кольцо · Кровь | `t04` | Epic-Low | done |
| `jew_ring_wind.png` | Кольцо · Ветер / полёт | `t05` | Epic | done |
| `jew_ring_lava.png` | Кольцо · Лава | `t07` | Legendary | done |
| `jew_ring_stone.png` | Кольцо · Камень / руны | `t03` | Rare | done |
| `jew_ring_void.png` | Кольцо · Пустота | `t11` | Ascended | ожидает |
| `jew_ring_dragon.png` | Кольцо · Дракон | `t12` | Ascended+ | ожидает |
| `jew_ring_plague.png` | Кольцо · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_ring_holy.png` | Кольцо · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_ring_primal.png` | Кольцо · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Браслет · 15 шт. → `icons/jewelry/bracelets/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_bracelet_fire.png` | Браслет · Пламя | `t05` | Epic | done |
| `jew_bracelet_ice.png` | Браслет · Иней / лёд | `t03` | Rare | done |
| `jew_bracelet_lightning.png` | Браслет · Гроза | `t04` | Epic-Low | done |
| `jew_bracelet_poison.png` | Браслет · Яд | `t02` | Uncommon | done |
| `jew_bracelet_light.png` | Браслет · Свет | `t05` | Epic | done |
| `jew_bracelet_nature.png` | Браслет · Природа / древо | `t02` | Uncommon | done |
| `jew_bracelet_blood.png` | Браслет · Кровь | `t04` | Epic-Low | done |
| `jew_bracelet_wind.png` | Браслет · Ветер / полёт | `t05` | Epic | done |
| `jew_bracelet_lava.png` | Браслет · Лава | `t07` | Legendary | done |
| `jew_bracelet_stone.png` | Браслет · Камень / руны | `t03` | Rare | done |
| `jew_bracelet_void.png` | Браслет · Пустота | `t11` | Ascended | ожидает |
| `jew_bracelet_dragon.png` | Браслет · Дракон | `t12` | Ascended+ | ожидает |
| `jew_bracelet_plague.png` | Браслет · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_bracelet_holy.png` | Браслет · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_bracelet_primal.png` | Браслет · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Ожерелье · 15 шт. → `icons/jewelry/necklaces/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_necklace_fire.png` | Ожерелье · Пламя | `t05` | Epic | done |
| `jew_necklace_ice.png` | Ожерелье · Иней / лёд | `t03` | Rare | done |
| `jew_necklace_lightning.png` | Ожерелье · Гроза | `t04` | Epic-Low | done |
| `jew_necklace_poison.png` | Ожерелье · Яд | `t02` | Uncommon | done |
| `jew_necklace_light.png` | Ожерелье · Свет | `t05` | Epic | done |
| `jew_necklace_nature.png` | Ожерелье · Природа / древо | `t02` | Uncommon | done |
| `jew_necklace_blood.png` | Ожерелье · Кровь | `t04` | Epic-Low | done |
| `jew_necklace_wind.png` | Ожерелье · Ветер / полёт | `t05` | Epic | done |
| `jew_necklace_lava.png` | Ожерелье · Лава | `t07` | Legendary | done |
| `jew_necklace_stone.png` | Ожерелье · Камень / руны | `t03` | Rare | done |
| `jew_necklace_void.png` | Ожерелье · Пустота | `t11` | Ascended | ожидает |
| `jew_necklace_dragon.png` | Ожерелье · Дракон | `t12` | Ascended+ | ожидает |
| `jew_necklace_plague.png` | Ожерелье · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_necklace_holy.png` | Ожерелье · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_necklace_primal.png` | Ожерелье · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Пояс · 15 шт. → `icons/jewelry/belts/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_belt_fire.png` | Пояс · Пламя | `t05` | Epic | done |
| `jew_belt_ice.png` | Пояс · Иней / лёд | `t03` | Rare | done |
| `jew_belt_lightning.png` | Пояс · Гроза | `t04` | Epic-Low | done |
| `jew_belt_poison.png` | Пояс · Яд | `t02` | Uncommon | done |
| `jew_belt_light.png` | Пояс · Свет | `t05` | Epic | done |
| `jew_belt_nature.png` | Пояс · Природа / древо | `t02` | Uncommon | done |
| `jew_belt_blood.png` | Пояс · Кровь | `t04` | Epic-Low | done |
| `jew_belt_wind.png` | Пояс · Ветер / полёт | `t05` | Epic | done |
| `jew_belt_lava.png` | Пояс · Лава | `t07` | Legendary | done |
| `jew_belt_stone.png` | Пояс · Камень / руны | `t03` | Rare | done |
| `jew_belt_void.png` | Пояс · Пустота | `t11` | Ascended | ожидает |
| `jew_belt_dragon.png` | Пояс · Дракон | `t12` | Ascended+ | ожидает |
| `jew_belt_plague.png` | Пояс · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_belt_holy.png` | Пояс · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_belt_primal.png` | Пояс · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Материалы · Металлы · 24 шт. → `icons/materials/metals/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_ore_t01_copper.png` | Руда · Медь | `t01` | Common | план |
| `mat_ingot_t01_copper.png` | Слиток · Медь | `t01` | Common | план |
| `mat_ore_t02_bronze.png` | Руда · Бронза | `t02` | Uncommon | план |
| `mat_ingot_t02_bronze.png` | Слиток · Бронза | `t02` | Uncommon | план |
| `mat_ore_t03_iron.png` | Руда · Железо | `t03` | Rare | план |
| `mat_ingot_t03_iron.png` | Слиток · Железо | `t03` | Rare | план |
| `mat_ore_t04_silver.png` | Руда · Серебро | `t04` | Epic-Low | план |
| `mat_ingot_t04_silver.png` | Слиток · Серебро | `t04` | Epic-Low | план |
| `mat_ore_t05_gold.png` | Руда · Золото | `t05` | Epic | план |
| `mat_ingot_t05_gold.png` | Слиток · Золото | `t05` | Epic | план |
| `mat_ore_t06_blacksteel.png` | Руда · Воронёная сталь | `t06` | Epic+ | план |
| `mat_ingot_t06_blacksteel.png` | Слиток · Воронёная сталь | `t06` | Epic+ | план |
| `mat_ore_t07_mithril.png` | Руда · Мифрил | `t07` | Legendary | план |
| `mat_ingot_t07_mithril.png` | Слиток · Мифрил | `t07` | Legendary | план |
| `mat_ore_t08_orichalcum.png` | Руда · Орихалк | `t08` | Legendary+ | план |
| `mat_ingot_t08_orichalcum.png` | Слиток · Орихалк | `t08` | Legendary+ | план |
| `mat_ore_t09_magma.png` | Руда · Магмит (магма) | `t09` | Mythic | план |
| `mat_ingot_t09_magma.png` | Слиток · Магмит (магма) | `t09` | Mythic | план |
| `mat_ore_t10_astral.png` | Руда · Астралит | `t10` | Mythic | план |
| `mat_ingot_t10_astral.png` | Слиток · Астралит | `t10` | Mythic | план |
| `mat_ore_t11_void.png` | Руда · Пустотный сплав | `t11` | Ascended | план |
| `mat_ingot_t11_void.png` | Слиток · Пустотный сплав | `t11` | Ascended | план |
| `mat_ore_t12_dragonid.png` | Руда · Драконид | `t12` | Ascended+ | план |
| `mat_ingot_t12_dragonid.png` | Слиток · Драконид | `t12` | Ascended+ | план |

### Материалы · Древесина · 24 шт. → `icons/materials/wood/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_log_t01_oak.png` | Бревно · Дуб | `t01` | Common | план |
| `mat_plank_t01_oak.png` | Доска · Дуб | `t01` | Common | план |
| `mat_log_t02_birch.png` | Бревно · Берёза | `t02` | Uncommon | план |
| `mat_plank_t02_birch.png` | Доска · Берёза | `t02` | Uncommon | план |
| `mat_log_t03_pine.png` | Бревно · Сосна | `t03` | Rare | план |
| `mat_plank_t03_pine.png` | Доска · Сосна | `t03` | Rare | план |
| `mat_log_t04_yew.png` | Бревно · Тис | `t04` | Epic-Low | план |
| `mat_plank_t04_yew.png` | Доска · Тис | `t04` | Epic-Low | план |
| `mat_log_t05_maple.png` | Бревно · Клён | `t05` | Epic | план |
| `mat_plank_t05_maple.png` | Доска · Клён | `t05` | Epic | план |
| `mat_log_t06_ironwood.png` | Бревно · Железное дерево | `t06` | Epic+ | план |
| `mat_plank_t06_ironwood.png` | Доска · Железное дерево | `t06` | Epic+ | план |
| `mat_log_t07_elvenwood.png` | Бревно · Эльфийское дерево | `t07` | Legendary | план |
| `mat_plank_t07_elvenwood.png` | Доска · Эльфийское дерево | `t07` | Legendary | план |
| `mat_log_t08_ancient.png` | Бревно · Древнее дерево | `t08` | Legendary+ | план |
| `mat_plank_t08_ancient.png` | Доска · Древнее дерево | `t08` | Legendary+ | план |
| `mat_log_t09_magmawood.png` | Бревно · Магмовое дерево | `t09` | Mythic | план |
| `mat_plank_t09_magmawood.png` | Доска · Магмовое дерево | `t09` | Mythic | план |
| `mat_log_t10_astralwood.png` | Бревно · Астральное дерево | `t10` | Mythic | план |
| `mat_plank_t10_astralwood.png` | Доска · Астральное дерево | `t10` | Mythic | план |
| `mat_log_t11_voidwood.png` | Бревно · Древесина Пустоты | `t11` | Ascended | план |
| `mat_plank_t11_voidwood.png` | Доска · Древесина Пустоты | `t11` | Ascended | план |
| `mat_log_t12_dragonwood.png` | Бревно · Драконье дерево | `t12` | Ascended+ | план |
| `mat_plank_t12_dragonwood.png` | Доска · Драконье дерево | `t12` | Ascended+ | план |

### Материалы · Топливо · 4 шт. → `icons/materials/minerals/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_coal_t01_charcoal.png` | Уголь · Древесный | `t01` | Common | план |
| `mat_coal_t02_coal.png` | Уголь · Каменный | `t02` | Uncommon | план |
| `mat_coal_t03_anthracite.png` | Уголь · Антрацит | `t03` | Rare | план |
| `mat_coal_t04_embers.png` | Уголь · Тлеющий | `t04` | Epic-Low | план |

### Материалы · Инструменты · 4 шт. → `icons/materials/wood/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_tool_saw_blade_t01_iron.png` | Полотно пилы · железное | `t01` | Common | план |
| `mat_tool_saw_blade_t02_steel.png` | Полотно пилы · бронзовый | `t02` | Uncommon | план |
| `mat_tool_saw_blade_t03_blacksteel.png` | Полотно пилы · кованый (железо) | `t03` | Rare | план |
| `mat_tool_saw_blade_t04_mithril.png` | Полотно пилы · серебряный | `t04` | Epic-Low | план |

### Материалы · Охота · 10 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_trophy_antlers.png` | Рога оленьи | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_trophy_ram_horn.png` | Рог бараний | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_beast_eye.png` | Глаз звериный | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_guts.png` | Кишки / потроха | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cord_sinew.png` | Бечёвка жильная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_rope_fiber.png` | Верёвка растительная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_pelt_raw.png` | Шкура сырая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_tanned.png` | Кожа дублёная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_boar_thick.png` | Кожа вепря (толстая) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_scaled.png` | Кожа чешуйчатая | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Мясо · 8 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_meat_haunch.png` | Окорочок на кости (сырой) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_steak.png` | Стейк (сырая говядина) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_poultry.png` | Тушка птицы ощипанная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_ribs.png` | Рёбрышки свежие | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_haunch_roast.png` | Окорочок жареный (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_steak_grill.png` | Стейк на гриле (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_poultry_roast.png` | Тушка запечённая (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_ribs_bbq.png` | Рёбрышки BBQ (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Стекло · 4 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_quartz_sand.png` | Песок кварцевый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_window_glass.png` | Оконное стекло | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bottle_empty.png` | Бутылка пустая (тара) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_flask_empty.png` | Колба пустая (тара) | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Механизмы · 15 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_nuts.png` | Гайки (горка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bolts.png` | Болты (горка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_nails.png` | Гвозди (кучка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gear_steel.png` | Шестерня стальная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gear_brass.png` | Шестерня латунная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_spring.png` | Пружина стальная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_piston.png` | Поршень со штоком | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bearing.png` | Подшипник шариковый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_windup_key.png` | Заводной ключ | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_valve.png` | Вентиль / клапан | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_copper_pipe.png` | Трубка медная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gauge.png` | Манометр давления | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_chain.png` | Цепь приводная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_lever.png` | Рычаг / тумблер | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_plate.png` | Пластина крепёжная | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Лес/собирательство · 13 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_stick_v01.png` | Палка сучковатая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v02.png` | Палка оструганная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v03.png` | Палка-дубинка | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v04.png` | Палка с обмоткой | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v01.png` | Ветка сухая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v02.png` | Ветка зелёная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v03.png` | Ветка хвойная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cone_v01.png` | Шишка сосновая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cone_v02.png` | Шишка еловая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v01.png` | Лист дубовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v02.png` | Лист кленовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v03.png` | Лист берёзовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stone.png` | Камень / булыжник | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Ферма · 4 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `crop_wheat.png` | Колос пшеницы | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_carrot.png` | Морковь | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_potato.png` | Картофель | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_tomato.png` | Томат | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Напитки · 3 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_beer_bottle.png` | Пиво / эль в бутылке | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_wine_bottle.png` | Вино в бутылке | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_rum_bottle.png` | Ром пиратский | `—` | — | было в партии, скачано и удалено из воркспейса |

### Расходники · Зелья · 25 шт. → `icons/materials/alchemy/potions/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `pot_potion_01_healing_small.png` | 1. Зелье исцеления (малое) | `t01` | Common | план |
| `pot_potion_02_mana_small.png` | 2. Зелье маны (малое) | `t01` | Common | план |
| `pot_potion_03_stamina.png` | 3. Эликсир выносливости | `t01` | Common | план |
| `pot_potion_04_haste.png` | 4. Зелье скорости | `t02` | Uncommon | план |
| `pot_potion_05_strength.png` | 5. Зелье силы | `t02` | Uncommon | план |
| `pot_potion_06_poison_vial.png` | 6. Флакон яда | `t02` | Uncommon | план |
| `pot_potion_07_stone_skin.png` | 7. Отвар каменной кожи | `t02` | Uncommon | план |
| `pot_potion_08_fire_oil.png` | 8. Масло огня (огненный настой) | `t03` | Rare | план |
| `pot_potion_09_frost.png` | 9. Зелье мороза | `t03` | Rare | план |
| `pot_potion_10_shock.png` | 10. Грозовой экстракт | `t03` | Rare | план |
| `pot_potion_11_invisibility.png` | 11. Зелье невидимости | `t04` | Epic-Low | план |
| `pot_potion_12_regeneration.png` | 12. Эликсир регенерации | `t04` | Epic-Low | план |
| `pot_potion_13_antidote.png` | 13. Антидот | `t04` | Epic-Low | план |
| `pot_potion_14_luck.png` | 14. Зелье удачи | `t05` | Epic | план |
| `pot_potion_15_xp.png` | 15. Эликсир опыта | `t05` | Epic | план |
| `pot_potion_16_water_breathing.png` | 16. Зелье водного дыхания | `t06` | Epic+ | план |
| `pot_potion_17_night_vision.png` | 17. Зелье ночного зрения | `t06` | Epic+ | план |
| `pot_potion_18_berserk.png` | 18. Кровь берсерка | `t07` | Legendary | план |
| `pot_potion_19_levitation.png` | 19. Эликсир левитации | `t07` | Legendary | план |
| `pot_potion_20_light_elixir.png` | 20. Эликсир света | `t08` | Legendary+ | план |
| `pot_potion_21_necro.png` | 21. Некромантический настой | `t09` | Mythic | план |
| `pot_potion_22_titan.png` | 22. Слеза титана | `t10` | Mythic | план |
| `pot_potion_23_chaos.png` | 23. Порождение хаоса | `t11` | Ascended | план |
| `pot_potion_24_void.png` | 24. Зелье Пустоты | `t11` | Ascended | план |
| `pot_potion_25_immortality.png` | 25. Роса бессмертия | `t12` | Ascended+ | план |

### Еда · Готовые блюда · 30 шт. → `icons/materials/food/dishes/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `dish_01_stew.png` | 1. Мясное рагу в миске | `—` | — | план |
| `dish_02_steak_platter.png` | 2. Стейк на доске | `—` | — | план |
| `dish_03_mushroom_soup.png` | 3. Грибной суп в горшочке | `—` | — | план |
| `dish_04_fish_soup.png` | 4. Уха из рыбы в котелке | `—` | — | план |
| `dish_05_goulash.png` | 5. Острый гуляш с перцем | `—` | — | план |
| `dish_06_chicken_broth.png` | 6. Куриный бульон с лапшой | `—` | — | план |
| `dish_07_kebab.png` | 7. Шашлык на шампуре | `—` | — | план |
| `dish_08_drumstick.png` | 8. Куриная ножка жареная | `—` | — | план |
| `dish_09_grilled_fish.png` | 9. Рыба гриль с лимоном | `—` | — | план |
| `dish_10_sausages.png` | 10. Колбаски с горчицей | `—` | — | план |
| `dish_11_meat_pie.png` | 11. Мясной пирог с корочкой | `—` | — | план |
| `dish_12_berry_pie.png` | 12. Ягодный пирог с вишней | `—` | — | план |
| `dish_13_bread.png` | 13. Каравай деревенский | `—` | — | план |
| `dish_14_pretzel.png` | 14. Брецель с солью | `—` | — | план |
| `dish_15_eggs_bacon.png` | 15. Яичница с беконом | `—` | — | план |
| `dish_16_fried_potatoes.png` | 16. Картофель с грибами | `—` | — | план |
| `dish_17_casserole.png` | 17. Запеканка с сыром | `—` | — | план |
| `dish_18_paella.png` | 18. Паэлья с морепродуктами | `—` | — | план |
| `dish_19_bbq_ribs.png` | 19. Рёбрышки BBQ на подносе | `—` | — | план |
| `dish_20_roast_duck.png` | 20. Утка гриль с яблоками | `—` | — | план |
| `dish_21_crayfish.png` | 21. Варёные раки с укропом | `—` | — | план |
| `dish_22_stuffed_pumpkin.png` | 22. Печёная тыква с мясом | `—` | — | план |
| `dish_23_cheese_board.png` | 23. Сырная тарелка с виноградом | `—` | — | план |
| `dish_24_jerky.png` | 24. Вяленое мясо (джерки) | `—` | — | план |
| `dish_25_salad.png` | 25. Свежий салат с зеленью | `—` | — | план |
| `dish_26_porridge.png` | 26. Овсяная каша с мёдом | `—` | — | план |
| `dish_27_honeycomb.png` | 27. Медовые соты с ложкой | `—` | — | план |
| `dish_28_baked_apple.png` | 28. Печёное яблоко с корицей | `—` | — | план |
| `dish_29_pancakes.png` | 29. Блины с сиропом | `—` | — | план |
| `dish_30_hot_spiced_cider.png` | 30. Пряный сидр в кружке | `—` | — | план |

### Предметы · 23 шт. → `icons/items/misc/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `item_scroll_tp.png` | Свиток телепортации (расходник) | `t03` | Rare | план |
| `item_scroll_identify.png` | Свиток опознания | `t01` | Common | план |
| `item_scroll_enchant.png` | Свиток зачарования | `t05` | Epic | план |
| `item_enchant_stone_d.png` | Камень заточки (обычный) | `t01` | Common | план |
| `item_enchant_stone_c.png` | Камень заточки (крепкий) | `t02` | Uncommon | план |
| `item_enchant_stone_b.png` | Камень заточки (редкий) | `t03` | Rare | план |
| `item_enchant_stone_a.png` | Камень заточки (эпический) | `t04` | Epic-Low | план |
| `item_enchant_stone_s.png` | Камень заточки (легендарный) | `t05` | Epic | план |
| `item_lockpick.png` | Отмычка | `t01` | Common | план |
| `item_lockpick_silver.png` | Отмычка посеребрённая | `t03` | Rare | план |
| `item_torch.png` | Факел | `t01` | Common | план |
| `item_lantern_oil.png` | Масло для лампы | `t02` | Uncommon | план |
| `item_bag_small.png` | Сумка маленькая (+6 ячеек) | `t02` | Uncommon | план |
| `item_bag_medium.png` | Сумка средняя (+12 ячеек) | `t04` | Epic-Low | план |
| `item_bag_large.png` | Сумка большая (+20 ячеек) | `t06` | Epic+ | план |
| `item_fish_minnow.png` | Рыба мелкая (наживка) | `t01` | Common | план |
| `item_fish_bass.png` | Окунь | `t02` | Uncommon | план |
| `item_fish_pike.png` | Щука | `t03` | Rare | план |
| `item_fish_koi.png` | Карп-кои | `t05` | Epic | план |
| `item_fish_arcane.png` | Астральная рыба | `t09` | Mythic | план |
| `item_egg_chicken.png` | Яйцо куриное | `t01` | Common | план |
| `item_egg_raptor.png` | Яйцо раптара | `t05` | Epic | план |
| `item_egg_dragon.png` | Яйцо дракона | `t12` | Ascended+ | план |

### Ресурсы · Валюты · 8 шт. → `icons/resources/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `res_coin_copper.png` | Медная монета (валюта, базовая) | `t01` | Common | план |
| `res_coin_silver.png` | Серебряная монета | `t02` | Uncommon | план |
| `res_coin_gold.png` | Золотая монета (основная валюта) | `t03` | Rare | план |
| `res_coin_platinum.png` | Платиновая монета | `t05` | Epic | план |
| `res_crystal_premium.png` | Кристаллы (премиум-валюта) | `t06` | Epic+ | план |
| `res_token_guild.png` | Гильдейский жетон | `t04` | Epic-Low | план |
| `res_soul_essence.png` | Душа/эссенция (валюта события) | `t09` | Mythic | план |
| `res_rune_shard.png` | Осколок руны (сезонная валюта) | `t10` | Mythic | план |

### Строения · Станции · 12 шт. → `icons/buildings/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `build_smelter_stone.png` | Плавильня каменная | `t01` | Common | план |
| `build_forge_bellows.png` | Кузнечный горн с мехами | `t02` | Uncommon | план |
| `build_workbench_mortise.png` | Верстак столярный | `t02` | Uncommon | план |
| `build_anvil.png` | Наковальня | `t02` | Uncommon | план |
| `build_alchemy_table.png` | Алхимический стол | `t03` | Rare | план |
| `build_enchant_altar.png` | Алтарь зачарования | `t06` | Epic+ | план |
| `build_jewel_lup.png` | Ювелирный станок (увеличитель) | `t04` | Epic-Low | план |
| `build_loom.png` | Ткацкий станок | `t02` | Uncommon | план |
| `build_tanning_pit.png` | Дубильная яма | `t02` | Uncommon | план |
| `build_sawmill.png` | Лесопилка | `t03` | Rare | план |
| `build_kiln.png` | Обжиговая печь | `t03` | Rare | план |
| `build_runewell.png` | Рунический источник | `t10` | Mythic | план |

### Еда · Готовые блюда · 30 шт. → `icons/materials/food/dishes/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `dish_01_stew.png` | 1. Мясное рагу в миске | `—` | — | план |
| `dish_02_steak_platter.png` | 2. Стейк на доске | `—` | — | план |
| `dish_03_mushroom_soup.png` | 3. Грибной суп в горшочке | `—` | — | план |
| `dish_04_fish_soup.png` | 4. Уха из рыбы в котелке | `—` | — | план |
| `dish_05_goulash.png` | 5. Острый гуляш с перцем | `—` | — | план |
| `dish_06_chicken_broth.png` | 6. Куриный бульон с лапшой | `—` | — | план |
| `dish_07_kebab.png` | 7. Шашлык на шампуре | `—` | — | план |
| `dish_08_drumstick.png` | 8. Куриная ножка жареная | `—` | — | план |
| `dish_09_grilled_fish.png` | 9. Рыба гриль с лимоном | `—` | — | план |
| `dish_10_sausages.png` | 10. Колбаски с горчицей | `—` | — | план |
| `dish_11_meat_pie.png` | 11. Мясной пирог с корочкой | `—` | — | план |
| `dish_12_berry_pie.png` | 12. Ягодный пирог с вишней | `—` | — | план |
| `dish_13_bread.png` | 13. Каравай деревенский | `—` | — | план |
| `dish_14_pretzel.png` | 14. Брецель с солью | `—` | — | план |
| `dish_15_eggs_bacon.png` | 15. Яичница с беконом | `—` | — | план |
| `dish_16_fried_potatoes.png` | 16. Картофель с грибами | `—` | — | план |
| `dish_17_casserole.png` | 17. Запеканка с сыром | `—` | — | план |
| `dish_18_paella.png` | 18. Паэлья с морепродуктами | `—` | — | план |
| `dish_19_bbq_ribs.png` | 19. Рёбрышки BBQ на подносе | `—` | — | план |
| `dish_20_roast_duck.png` | 20. Утка гриль с яблоками | `—` | — | план |
| `dish_21_crayfish.png` | 21. Варёные раки с укропом | `—` | — | план |
| `dish_22_stuffed_pumpkin.png` | 22. Печёная тыква с мясом | `—` | — | план |
| `dish_23_cheese_board.png` | 23. Сырная тарелка с виноградом | `—` | — | план |
| `dish_24_jerky.png` | 24. Вяленое мясо (джерки) | `—` | — | план |
| `dish_25_salad.png` | 25. Свежий салат с зеленью | `—` | — | план |
| `dish_26_porridge.png` | 26. Овсяная каша с мёдом | `—` | — | план |
| `dish_27_honeycomb.png` | 27. Медовые соты с ложкой | `—` | — | план |
| `dish_28_baked_apple.png` | 28. Печёное яблоко с корицей | `—` | — | план |
| `dish_29_pancakes.png` | 29. Блины с сиропом | `—` | — | план |
| `dish_30_hot_spiced_cider.png` | 30. Пряный сидр в кружке | `—` | — | план |

### Материалы · Древесина · 24 шт. → `icons/materials/wood/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_log_t01_oak.png` | Бревно · Дуб | `t01` | Common | план |
| `mat_plank_t01_oak.png` | Доска · Дуб | `t01` | Common | план |
| `mat_log_t02_birch.png` | Бревно · Берёза | `t02` | Uncommon | план |
| `mat_plank_t02_birch.png` | Доска · Берёза | `t02` | Uncommon | план |
| `mat_log_t03_pine.png` | Бревно · Сосна | `t03` | Rare | план |
| `mat_plank_t03_pine.png` | Доска · Сосна | `t03` | Rare | план |
| `mat_log_t04_yew.png` | Бревно · Тис | `t04` | Epic-Low | план |
| `mat_plank_t04_yew.png` | Доска · Тис | `t04` | Epic-Low | план |
| `mat_log_t05_maple.png` | Бревно · Клён | `t05` | Epic | план |
| `mat_plank_t05_maple.png` | Доска · Клён | `t05` | Epic | план |
| `mat_log_t06_ironwood.png` | Бревно · Железное дерево | `t06` | Epic+ | план |
| `mat_plank_t06_ironwood.png` | Доска · Железное дерево | `t06` | Epic+ | план |
| `mat_log_t07_elvenwood.png` | Бревно · Эльфийское дерево | `t07` | Legendary | план |
| `mat_plank_t07_elvenwood.png` | Доска · Эльфийское дерево | `t07` | Legendary | план |
| `mat_log_t08_ancient.png` | Бревно · Древнее дерево | `t08` | Legendary+ | план |
| `mat_plank_t08_ancient.png` | Доска · Древнее дерево | `t08` | Legendary+ | план |
| `mat_log_t09_magmawood.png` | Бревно · Магмовое дерево | `t09` | Mythic | план |
| `mat_plank_t09_magmawood.png` | Доска · Магмовое дерево | `t09` | Mythic | план |
| `mat_log_t10_astralwood.png` | Бревно · Астральное дерево | `t10` | Mythic | план |
| `mat_plank_t10_astralwood.png` | Доска · Астральное дерево | `t10` | Mythic | план |
| `mat_log_t11_voidwood.png` | Бревно · Древесина Пустоты | `t11` | Ascended | план |
| `mat_plank_t11_voidwood.png` | Доска · Древесина Пустоты | `t11` | Ascended | план |
| `mat_log_t12_dragonwood.png` | Бревно · Драконье дерево | `t12` | Ascended+ | план |
| `mat_plank_t12_dragonwood.png` | Доска · Драконье дерево | `t12` | Ascended+ | план |

### Материалы · Инструменты · 4 шт. → `icons/materials/wood/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_tool_saw_blade_t01_iron.png` | Полотно пилы · железное | `t01` | Common | план |
| `mat_tool_saw_blade_t02_steel.png` | Полотно пилы · бронзовый | `t02` | Uncommon | план |
| `mat_tool_saw_blade_t03_blacksteel.png` | Полотно пилы · кованый (железо) | `t03` | Rare | план |
| `mat_tool_saw_blade_t04_mithril.png` | Полотно пилы · серебряный | `t04` | Epic-Low | план |

### Материалы · Лес/собирательство · 13 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_stick_v01.png` | Палка сучковатая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v02.png` | Палка оструганная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v03.png` | Палка-дубинка | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stick_v04.png` | Палка с обмоткой | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v01.png` | Ветка сухая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v02.png` | Ветка зелёная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_branch_v03.png` | Ветка хвойная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cone_v01.png` | Шишка сосновая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cone_v02.png` | Шишка еловая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v01.png` | Лист дубовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v02.png` | Лист кленовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leaf_v03.png` | Лист берёзовый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_stone.png` | Камень / булыжник | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Механизмы · 15 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_nuts.png` | Гайки (горка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bolts.png` | Болты (горка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_nails.png` | Гвозди (кучка) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gear_steel.png` | Шестерня стальная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gear_brass.png` | Шестерня латунная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_spring.png` | Пружина стальная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_piston.png` | Поршень со штоком | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bearing.png` | Подшипник шариковый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_windup_key.png` | Заводной ключ | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_valve.png` | Вентиль / клапан | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_copper_pipe.png` | Трубка медная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_gauge.png` | Манометр давления | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_chain.png` | Цепь приводная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_lever.png` | Рычаг / тумблер | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_plate.png` | Пластина крепёжная | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Мясо · 8 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_meat_haunch.png` | Окорочок на кости (сырой) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_steak.png` | Стейк (сырая говядина) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_poultry.png` | Тушка птицы ощипанная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_ribs.png` | Рёбрышки свежие | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_haunch_roast.png` | Окорочок жареный (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_steak_grill.png` | Стейк на гриле (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_poultry_roast.png` | Тушка запечённая (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_meat_ribs_bbq.png` | Рёбрышки BBQ (cooked) | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Напитки · 3 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_beer_bottle.png` | Пиво / эль в бутылке | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_wine_bottle.png` | Вино в бутылке | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_rum_bottle.png` | Ром пиратский | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Охота · 10 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_trophy_antlers.png` | Рога оленьи | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_trophy_ram_horn.png` | Рог бараний | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_beast_eye.png` | Глаз звериный | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_guts.png` | Кишки / потроха | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_cord_sinew.png` | Бечёвка жильная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_rope_fiber.png` | Верёвка растительная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_pelt_raw.png` | Шкура сырая | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_tanned.png` | Кожа дублёная | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_boar_thick.png` | Кожа вепря (толстая) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_leather_scaled.png` | Кожа чешуйчатая | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Стекло · 4 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_quartz_sand.png` | Песок кварцевый | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_window_glass.png` | Оконное стекло | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_bottle_empty.png` | Бутылка пустая (тара) | `—` | — | было в партии, скачано и удалено из воркспейса |
| `mat_flask_empty.png` | Колба пустая (тара) | `—` | — | было в партии, скачано и удалено из воркспейса |

### Материалы · Топливо · 4 шт. → `icons/materials/minerals/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `mat_coal_t01_charcoal.png` | Уголь · Древесный | `t01` | Common | план |
| `mat_coal_t02_coal.png` | Уголь · Каменный | `t02` | Uncommon | план |
| `mat_coal_t03_anthracite.png` | Уголь · Антрацит | `t03` | Rare | план |
| `mat_coal_t04_embers.png` | Уголь · Тлеющий | `t04` | Epic-Low | план |

### Материалы · Ферма · 4 шт. → `icons/materials/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `crop_wheat.png` | Колос пшеницы | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_carrot.png` | Морковь | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_potato.png` | Картофель | `—` | — | было в партии, скачано и удалено из воркспейса |
| `crop_tomato.png` | Томат | `—` | — | было в партии, скачано и удалено из воркспейса |

### Предметы · 23 шт. → `icons/items/misc/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `item_scroll_tp.png` | Свиток телепортации (расходник) | `t03` | Rare | план |
| `item_scroll_identify.png` | Свиток опознания | `t01` | Common | план |
| `item_scroll_enchant.png` | Свиток зачарования | `t05` | Epic | план |
| `item_enchant_stone_d.png` | Камень заточки (обычный) | `t01` | Common | план |
| `item_enchant_stone_c.png` | Камень заточки (крепкий) | `t02` | Uncommon | план |
| `item_enchant_stone_b.png` | Камень заточки (редкий) | `t03` | Rare | план |
| `item_enchant_stone_a.png` | Камень заточки (эпический) | `t04` | Epic-Low | план |
| `item_enchant_stone_s.png` | Камень заточки (легендарный) | `t05` | Epic | план |
| `item_lockpick.png` | Отмычка | `t01` | Common | план |
| `item_lockpick_silver.png` | Отмычка посеребрённая | `t03` | Rare | план |
| `item_torch.png` | Факел | `t01` | Common | план |
| `item_lantern_oil.png` | Масло для лампы | `t02` | Uncommon | план |
| `item_bag_small.png` | Сумка маленькая (+6 ячеек) | `t02` | Uncommon | план |
| `item_bag_medium.png` | Сумка средняя (+12 ячеек) | `t04` | Epic-Low | план |
| `item_bag_large.png` | Сумка большая (+20 ячеек) | `t06` | Epic+ | план |
| `item_fish_minnow.png` | Рыба мелкая (наживка) | `t01` | Common | план |
| `item_fish_bass.png` | Окунь | `t02` | Uncommon | план |
| `item_fish_pike.png` | Щука | `t03` | Rare | план |
| `item_fish_koi.png` | Карп-кои | `t05` | Epic | план |
| `item_fish_arcane.png` | Астральная рыба | `t09` | Mythic | план |
| `item_egg_chicken.png` | Яйцо куриное | `t01` | Common | план |
| `item_egg_raptor.png` | Яйцо раптара | `t05` | Epic | план |
| `item_egg_dragon.png` | Яйцо дракона | `t12` | Ascended+ | план |

### Расходники · Зелья · 25 шт. → `icons/materials/alchemy/potions/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `pot_potion_01_healing_small.png` | 1. Зелье исцеления (малое) | `t01` | Common | план |
| `pot_potion_02_mana_small.png` | 2. Зелье маны (малое) | `t01` | Common | план |
| `pot_potion_03_stamina.png` | 3. Эликсир выносливости | `t01` | Common | план |
| `pot_potion_04_haste.png` | 4. Зелье скорости | `t02` | Uncommon | план |
| `pot_potion_05_strength.png` | 5. Зелье силы | `t02` | Uncommon | план |
| `pot_potion_06_poison_vial.png` | 6. Флакон яда | `t02` | Uncommon | план |
| `pot_potion_07_stone_skin.png` | 7. Отвар каменной кожи | `t02` | Uncommon | план |
| `pot_potion_08_fire_oil.png` | 8. Масло огня (огненный настой) | `t03` | Rare | план |
| `pot_potion_09_frost.png` | 9. Зелье мороза | `t03` | Rare | план |
| `pot_potion_10_shock.png` | 10. Грозовой экстракт | `t03` | Rare | план |
| `pot_potion_11_invisibility.png` | 11. Зелье невидимости | `t04` | Epic-Low | план |
| `pot_potion_12_regeneration.png` | 12. Эликсир регенерации | `t04` | Epic-Low | план |
| `pot_potion_13_antidote.png` | 13. Антидот | `t04` | Epic-Low | план |
| `pot_potion_14_luck.png` | 14. Зелье удачи | `t05` | Epic | план |
| `pot_potion_15_xp.png` | 15. Эликсир опыта | `t05` | Epic | план |
| `pot_potion_16_water_breathing.png` | 16. Зелье водного дыхания | `t06` | Epic+ | план |
| `pot_potion_17_night_vision.png` | 17. Зелье ночного зрения | `t06` | Epic+ | план |
| `pot_potion_18_berserk.png` | 18. Кровь берсерка | `t07` | Legendary | план |
| `pot_potion_19_levitation.png` | 19. Эликсир левитации | `t07` | Legendary | план |
| `pot_potion_20_light_elixir.png` | 20. Эликсир света | `t08` | Legendary+ | план |
| `pot_potion_21_necro.png` | 21. Некромантический настой | `t09` | Mythic | план |
| `pot_potion_22_titan.png` | 22. Слеза титана | `t10` | Mythic | план |
| `pot_potion_23_chaos.png` | 23. Порождение хаоса | `t11` | Ascended | план |
| `pot_potion_24_void.png` | 24. Зелье Пустоты | `t11` | Ascended | план |
| `pot_potion_25_immortality.png` | 25. Роса бессмертия | `t12` | Ascended+ | план |

### Ресурсы · Валюты · 8 шт. → `icons/resources/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `res_coin_copper.png` | Медная монета (валюта, базовая) | `t01` | Common | план |
| `res_coin_silver.png` | Серебряная монета | `t02` | Uncommon | план |
| `res_coin_gold.png` | Золотая монета (основная валюта) | `t03` | Rare | план |
| `res_coin_platinum.png` | Платиновая монета | `t05` | Epic | план |
| `res_crystal_premium.png` | Кристаллы (премиум-валюта) | `t06` | Epic+ | план |
| `res_token_guild.png` | Гильдейский жетон | `t04` | Epic-Low | план |
| `res_soul_essence.png` | Душа/эссенция (валюта события) | `t09` | Mythic | план |
| `res_rune_shard.png` | Осколок руны (сезонная валюта) | `t10` | Mythic | план |

### Строения · Станции · 12 шт. → `icons/buildings/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `build_smelter_stone.png` | Плавильня каменная | `t01` | Common | план |
| `build_forge_bellows.png` | Кузнечный горн с мехами | `t02` | Uncommon | план |
| `build_workbench_mortise.png` | Верстак столярный | `t02` | Uncommon | план |
| `build_anvil.png` | Наковальня | `t02` | Uncommon | план |
| `build_alchemy_table.png` | Алхимический стол | `t03` | Rare | план |
| `build_enchant_altar.png` | Алтарь зачарования | `t06` | Epic+ | план |
| `build_jewel_lup.png` | Ювелирный станок (увеличитель) | `t04` | Epic-Low | план |
| `build_loom.png` | Ткацкий станок | `t02` | Uncommon | план |
| `build_tanning_pit.png` | Дубильная яма | `t02` | Uncommon | план |
| `build_sawmill.png` | Лесопилка | `t03` | Rare | план |
| `build_kiln.png` | Обжиговая печь | `t03` | Rare | план |
| `build_runewell.png` | Рунический источник | `t10` | Mythic | план |

### Украшения · Браслет · 15 шт. → `icons/jewelry/bracelets/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_bracelet_fire.png` | Браслет · Пламя | `t05` | Epic | done |
| `jew_bracelet_ice.png` | Браслет · Иней / лёд | `t03` | Rare | done |
| `jew_bracelet_lightning.png` | Браслет · Гроза | `t04` | Epic-Low | done |
| `jew_bracelet_poison.png` | Браслет · Яд | `t02` | Uncommon | done |
| `jew_bracelet_light.png` | Браслет · Свет | `t05` | Epic | done |
| `jew_bracelet_nature.png` | Браслет · Природа / древо | `t02` | Uncommon | done |
| `jew_bracelet_blood.png` | Браслет · Кровь | `t04` | Epic-Low | done |
| `jew_bracelet_wind.png` | Браслет · Ветер / полёт | `t05` | Epic | done |
| `jew_bracelet_lava.png` | Браслет · Лава | `t07` | Legendary | done |
| `jew_bracelet_stone.png` | Браслет · Камень / руны | `t03` | Rare | done |
| `jew_bracelet_void.png` | Браслет · Пустота | `t11` | Ascended | ожидает |
| `jew_bracelet_dragon.png` | Браслет · Дракон | `t12` | Ascended+ | ожидает |
| `jew_bracelet_plague.png` | Браслет · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_bracelet_holy.png` | Браслет · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_bracelet_primal.png` | Браслет · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Кольцо · 15 шт. → `icons/jewelry/rings/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_ring_fire.png` | Кольцо · Пламя | `t05` | Epic | done |
| `jew_ring_ice.png` | Кольцо · Иней / лёд | `t03` | Rare | done |
| `jew_ring_lightning.png` | Кольцо · Гроза | `t04` | Epic-Low | done |
| `jew_ring_poison.png` | Кольцо · Яд | `t02` | Uncommon | done |
| `jew_ring_light.png` | Кольцо · Свет | `t05` | Epic | done |
| `jew_ring_nature.png` | Кольцо · Природа / древо | `t02` | Uncommon | done |
| `jew_ring_blood.png` | Кольцо · Кровь | `t04` | Epic-Low | done |
| `jew_ring_wind.png` | Кольцо · Ветер / полёт | `t05` | Epic | done |
| `jew_ring_lava.png` | Кольцо · Лава | `t07` | Legendary | done |
| `jew_ring_stone.png` | Кольцо · Камень / руны | `t03` | Rare | done |
| `jew_ring_void.png` | Кольцо · Пустота | `t11` | Ascended | ожидает |
| `jew_ring_dragon.png` | Кольцо · Дракон | `t12` | Ascended+ | ожидает |
| `jew_ring_plague.png` | Кольцо · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_ring_holy.png` | Кольцо · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_ring_primal.png` | Кольцо · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Ожерелье · 15 шт. → `icons/jewelry/necklaces/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_necklace_fire.png` | Ожерелье · Пламя | `t05` | Epic | done |
| `jew_necklace_ice.png` | Ожерелье · Иней / лёд | `t03` | Rare | done |
| `jew_necklace_lightning.png` | Ожерелье · Гроза | `t04` | Epic-Low | done |
| `jew_necklace_poison.png` | Ожерелье · Яд | `t02` | Uncommon | done |
| `jew_necklace_light.png` | Ожерелье · Свет | `t05` | Epic | done |
| `jew_necklace_nature.png` | Ожерелье · Природа / древо | `t02` | Uncommon | done |
| `jew_necklace_blood.png` | Ожерелье · Кровь | `t04` | Epic-Low | done |
| `jew_necklace_wind.png` | Ожерелье · Ветер / полёт | `t05` | Epic | done |
| `jew_necklace_lava.png` | Ожерелье · Лава | `t07` | Legendary | done |
| `jew_necklace_stone.png` | Ожерелье · Камень / руны | `t03` | Rare | done |
| `jew_necklace_void.png` | Ожерелье · Пустота | `t11` | Ascended | ожидает |
| `jew_necklace_dragon.png` | Ожерелье · Дракон | `t12` | Ascended+ | ожидает |
| `jew_necklace_plague.png` | Ожерелье · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_necklace_holy.png` | Ожерелье · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_necklace_primal.png` | Ожерелье · Первобытный / шаманский | `t06` | Epic+ | ожидает |

### Украшения · Пояс · 15 шт. → `icons/jewelry/belts/`

| Файл | Предмет | Тир | Редкость | Статус |
|---|---|---|---|---|
| `jew_belt_fire.png` | Пояс · Пламя | `t05` | Epic | done |
| `jew_belt_ice.png` | Пояс · Иней / лёд | `t03` | Rare | done |
| `jew_belt_lightning.png` | Пояс · Гроза | `t04` | Epic-Low | done |
| `jew_belt_poison.png` | Пояс · Яд | `t02` | Uncommon | done |
| `jew_belt_light.png` | Пояс · Свет | `t05` | Epic | done |
| `jew_belt_nature.png` | Пояс · Природа / древо | `t02` | Uncommon | done |
| `jew_belt_blood.png` | Пояс · Кровь | `t04` | Epic-Low | done |
| `jew_belt_wind.png` | Пояс · Ветер / полёт | `t05` | Epic | done |
| `jew_belt_lava.png` | Пояс · Лава | `t07` | Legendary | done |
| `jew_belt_stone.png` | Пояс · Камень / руны | `t03` | Rare | done |
| `jew_belt_void.png` | Пояс · Пустота | `t11` | Ascended | ожидает |
| `jew_belt_dragon.png` | Пояс · Дракон | `t12` | Ascended+ | ожидает |
| `jew_belt_plague.png` | Пояс · Мор / гниение | `t09` | Mythic | ожидает |
| `jew_belt_holy.png` | Пояс · Ангельский / одухотворённый | `t08` | Legendary+ | ожидает |
| `jew_belt_primal.png` | Пояс · Первобытный / шаманский | `t06` | Epic+ | ожидает |
