<div align="center">

<img src="./assets/banner.svg" alt="NeFish — океанский симулятор рыбалки" width="100%" />

# NeFish

### Современный браузерный симулятор океанской рыбалки

Живой океан, наполненный десятками видов рыб, физический заброс по дуге,
борьба с натяжением лески и красивый стеклянный интерфейс.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-432d18?style=for-the-badge&logo=react&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas_API-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## <img src="https://api.iconify.design/mdi/waves.svg?color=%2338bdf8" width="26" align="top" /> О проекте

**NeFish** — это казуальная браузерная игра-рыбалка с дневной мультяшно-реалистичной
атмосферой. Вся сцена рисуется на `Canvas` в одном цикле `requestAnimationFrame`,
а интерфейс построен на React с эффектами glassmorphism и анимациями Framer Motion.
Прогресс сохраняется между сессиями в `localStorage`.

> Заброс → ожидание → поклёвка → борьба → поимка/сход → возврат снасти → новый заброс.

---

## <img src="https://api.iconify.design/mdi/star-four-points.svg?color=%2338bdf8" width="26" align="top" /> Возможности

| | |
|---|---|
| <img src="https://api.iconify.design/game-icons/fishing-pole.svg?color=%2338bdf8" width="26" /> **Заброс по дуге** | Прицеливание мышью (вправо / вниз / влево под причал), шкала силы и пунктирный предпросмотр траектории. Физический полёт крючка, всплеск, круги на воде и звук удара. |
| <img src="https://api.iconify.design/mdi/thermometer-water.svg?color=%2338bdf8" width="26" /> **Глубина и слои** | Управление глубиной колесом мыши или `W`/`S`. Слои океана и термоклины, индикатор глубины. Максимум зависит от лески и катушки — до самого дна. |
| <img src="https://api.iconify.design/mdi/fish.svg?color=%2338bdf8" width="26" /> **40+ видов рыб** | Каждый вид — отдельное существо: уникальный силуэт, голова, глаза, плавники, хвост, цвета и анимация. От сардины до Рыбы Тёмной Материи. |
| <img src="https://api.iconify.design/mdi/compass-outline.svg?color=%2338bdf8" width="26" /> **Живой океан** | Вероятностное распределение по глубине, постоянный роуминг, миграции редких рыб, стаи, охота хищников и избегание препятствий. |
| <img src="https://api.iconify.design/game-icons/fishing-hook.svg?color=%2338bdf8" width="26" /> **Борьба с леской** | Мини-игра натяжения и выносливости: рывки, фазы ярости, анти-чит против «зажал и держу». Сложность растёт с редкостью. |
| <img src="https://api.iconify.design/game-icons/fishing-lure.svg?color=%2338bdf8" width="26" /> **Система приманок** | 10 типов наживки с анимированными моделями и частицами. Без подходящей приманки рыба не клюёт. Расходуемый ресурс. |
| <img src="https://api.iconify.design/mdi/cart-outline.svg?color=%2338bdf8" width="26" /> **Магазин и улучшения** | Удочки, катушки, крючки, леска + 8 веток улучшений (скорость, удача, глубина, контроль, инвентарь, наживка…). |
| <img src="https://api.iconify.design/mdi/bag-personal-outline.svg?color=%2338bdf8" width="26" /> **Инвентарь и коллекция** | Каждая рыба — экземпляр с весом, длиной, ценой и датой. Фильтры, сортировка, продажа. Рекорды по видам сохраняются. |

---

## <img src="https://api.iconify.design/mdi/medal-outline.svg?color=%2338bdf8" width="26" align="top" /> Редкости

<div align="center">

![Common](https://img.shields.io/badge/Common-9ca3af?style=flat-square)
![Uncommon](https://img.shields.io/badge/Uncommon-4ade80?style=flat-square)
![Rare](https://img.shields.io/badge/Rare-38bdf8?style=flat-square)
![Epic](https://img.shields.io/badge/Epic-a855f7?style=flat-square)
![Legendary](https://img.shields.io/badge/Legendary-f59e0b?style=flat-square)
![Mythic](https://img.shields.io/badge/Mythic-f43f5e?style=flat-square)

</div>

| Редкость | Поведение | Размер | Примеры |
|---|---|---|---|
| <img src="https://api.iconify.design/mdi/circle.svg?color=%239ca3af" width="14" /> **Common** | стаи, серебристый блеск | маленькие | Сардина, Анчоус, Сельдь, Бычок |
| <img src="https://api.iconify.design/mdi/circle.svg?color=%234ade80" width="14" /> **Uncommon** | любопытство, рывки | мелкие/средние | Ставрида, Карась, Рыба-лиса, Спинорог |
| <img src="https://api.iconify.design/mdi/circle.svg?color=%2338bdf8" width="14" /> **Rare** | плавное скольжение | средние | Махи-махи, Лунная рыба, Парусник, Помпано |
| <img src="https://api.iconify.design/mdi/circle.svg?color=%23a855f7" width="14" /> **Epic** | охота, хищники | крупные | Ваху, Каранкс, Барракуда, Наполеон |
| <img src="https://api.iconify.design/mdi/circle.svg?color=%23f59e0b" width="14" /> **Legendary** | мощь, god-rays | огромные | Белая акула, Марлины, Манта |
| <img src="https://api.iconify.design/mdi/circle.svg?color=%23f43f5e" width="14" /> **Mythic** | сверхъестественные эффекты | колоссальные | <img src="https://api.iconify.design/mdi/diamond-stone.svg?color=%237fd3ff" width="15" /> Алмазная · <img src="https://api.iconify.design/mdi/radioactive.svg?color=%239dff3a" width="15" /> Радиоактивная · <img src="https://api.iconify.design/mdi/orbit.svg?color=%23b15cff" width="15" /> Тёмная Материя |

---

## <img src="https://api.iconify.design/mdi/gamepad-variant-outline.svg?color=%2338bdf8" width="26" align="top" /> Управление

| Действие | Клавиша |
|---|---|
| Заброс (прицел + сила) | Зажать **ЛКМ**, целиться мышью |
| Изменить глубину | **Колесо мыши** или **W** / **S** |
| Смотать снасть | **R** |
| Подмотка в борьбе | Зажимать **ЛКМ** (отпускать на рывках!) |
| Магазин / Улучшения / Инвентарь / Коллекция / Приманки | Кнопки в панели справа сверху |

---

## <img src="https://api.iconify.design/mdi/rocket-launch-outline.svg?color=%2338bdf8" width="26" align="top" /> Запуск

```bash
# установить зависимости
npm install

# режим разработки → http://localhost:3000
npm run dev

# продакшен-сборка
npm run build && npm start
```

> Требуется **Node.js 18+**.

---

## <img src="https://api.iconify.design/mdi/file-tree-outline.svg?color=%2338bdf8" width="26" align="top" /> Архитектура

```
NeFish/
├─ app/                    # Next.js App Router (layout, page, globals)
├─ components/
│  ├─ FishingCanvas.tsx    # игровой движок: океан, рыбы, заброс, физика, эффекты
│  ├─ fishRenderer.ts      # уникальная Canvas-отрисовка каждого вида рыб
│  ├─ GameRoot.tsx         # композиция сцены и UI
│  └─ ui/                  # Hud, модалки, мини-игра, иконки (React Icons)
├─ data/                   # контент: fish, bait, rods, shop, upgrades
├─ lib/                    # economy, combat, minigame — игровая логика
└─ store/gameStore.ts      # Zustand store + сохранение в localStorage
```

**Стек:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · Zustand · Canvas API · React Icons.

---

## <img src="https://api.iconify.design/mdi/sync.svg?color=%2338bdf8" width="26" align="top" /> Игровой цикл

```mermaid
flowchart LR
    A[Заброс] --> B[Ожидание]
    B --> C[Поклёвка]
    C --> D[Борьба с леской]
    D -->|успех| E[Поимка]
    D -->|сход| F[Рыба ушла]
    E --> G[Возврат снасти]
    F --> G
    G --> A
```

---

<div align="center">

<sub>Сделано с <img src="https://api.iconify.design/mdi/waves.svg?color=%2338bdf8" width="14" /> и <img src="https://api.iconify.design/mdi/coffee.svg?color=%23caa23a" width="14" /> 

</div>
