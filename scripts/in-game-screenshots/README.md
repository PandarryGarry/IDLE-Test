# Скриншоты из игры — headless-браузер в песочнице Arena

Зачем: снимать **реальные** экраны игры (десктоп/мобильная версия) для превью
артов, логотипов и интерфейсов — без изменения кода игры. Проверено и
отработано 30.08 (снимки логотипа «Топор и Перо» в интерфейсе).

## Ограничения песочницы Arena (важно!)

- **root НЕТ** — `apt-get` недоступен, системные пакеты не поставить.
- Заблокированы хосты: `cdn.playwright.dev`, `deb.debian.org`,
  `archive.ubuntu.com`, `dl-cdn.alpinelinux.org`,
  `objects.githubusercontent.com` (прямые скачивания с GitHub-релизов не работают).
- **Работают**: `registry.npmjs.org` (ставить пакеты можно) и
  `api.github.com` (`gh api`).
- Поэтому браузер берём целиком из npm-пакета `@sparticuz/chromium`,
  а недостающие системные библиотеки — из его же архива `al2023.tar.br`.

## Установка (проверенная последовательность)

```bash
# 1. Приложение (если node_modules пуст после пересоздания песочницы)
npm i -g pnpm@9
cd /home/user/IDLE-Test/artifacts/my-app && pnpm install

# 2. Браузер (локальная папка вне репо, чтобы не мусорить)
mkdir -p /home/user/ui_shot && cd /home/user/ui_shot
npm init -y >/dev/null 2>&1
npm i puppeteer-core@23 @sparticuz/chromium

# 3. Библиотеки (nss) и шрифты из пакета @sparticuz/chromium
node -e "
const zlib = require('zlib'), fs = require('fs');
const pkg = '/home/user/ui_shot/node_modules/@sparticuz/chromium/bin/';
for (const f of ['al2023.tar', 'fonts.tar']) {
  fs.writeFileSync('/tmp/' + f, zlib.brotliDecompressSync(fs.readFileSync(pkg + f + '.br')));
  console.log(f, 'OK');
}"
mkdir -p /tmp/al2023 /tmp/fonts
tar -xf /tmp/al2023.tar -C /tmp/al2023
tar -xf /tmp/fonts.tar  -C /tmp/fonts
# Кириллица! Без этого русский текст превратится в «тофу».
cp /usr/share/fonts/truetype/dejavu/DejaVu*.ttf /tmp/fonts/fonts/

# 4. Dev-сервер (отдельным фоновым процессом, не через bash!)
cd /home/user/IDLE-Test/artifacts/my-app && ./node_modules/.bin/vite --host 0.0.0.0 --port 5173
```

## Ключевые детали (без них не работает)

1. **Бинарник браузера**: первый вызов `chromium.executablePath()` распаковывает
   `/tmp/chromium`. Ему не хватает `libnspr4.so`, `libnss3.so`, `libnssutil3.so` —
   они лежат в `/tmp/al2023/lib`, поэтому процесс запускают с
   `LD_LIBRARY_PATH=/tmp/al2023/lib`.
2. **Шрифты**: `FONTCONFIG_PATH=/tmp/fonts` (в пакете только Open Sans).
   DejaVu добавляем копированием (см. выше) — иначе кириллица не отрисуется.
3. **Флаги localStorage** (ставить через `page.evaluateOnNewDocument` ДО загрузки):
   - `aethelia_prologue_seen_v1 = '1'` — пропустить пролог первого запуска;
   - `aethelia_last_seen_version = '<текущая версия из src/data/changelog.ts>'` —
     НЕ показывать окно «Что нового», иначе модалка с блюром закрывает весь экран.
4. **Гостевой вход**: кнопка `button.auth-link--guest` («Войти гостем») ведёт
   сразу в игровой шелл (правила/создание персонажа для гостей пропускаются).
5. **Подмена логотипа/артов для превью** — только CSS-инъекцией через `<style>`
   (псевдоэлемент с `background-image:url(data:...)`).
   Правка `innerHTML` НЕ подходит: React перерисовывает узел и возвращает меч.
6. Проверка результата: пиксельная разница `compare -metric AE new.png base.png null:`
   должна быть примерно равна площади зоны логотипа (не 0 и не весь экран).

## Скрипт

`screenshot.mjs` в этой папке — готовый проход: сплэш → «Войти гостем» →
игровой шелл; скриншоты `base/v1/v2` (десктоп 1440×900@1.5 и мобилка 390×844@2),
где v1/v2 подставляют знак логотипа через CSS. Параметры — переменные окружения:

```bash
EMBLEM=/path/to/emblem.webp OUT=/home/user/ui_shot URL=http://localhost:5173 node screenshot.mjs
```

Сборка сравнительных листов — ImageMagick (`montage`, `+smush`, подписи
`-annotate` c DejaVuSans-Bold; `bc` НЕТ — считать в `awk`).
