# 🚀 API ИНТЕГРАЦИЯ ГОТОВА

## ✅ ЧТО СОЗДАНО

### 📁 Структура API:

\`\`\`
src/lib/api/
├── config.ts          # Конфигурация Supabase
├── client.ts          # HTTP клиент
├── installations.ts   # CRUD установок
├── equipment.ts       # Оборудование
├── events.ts          # Мероприятия
├── consumables.ts     # Расходники
├── statistics.ts      # Статистика и аналитика
├── reports.ts         # Отчеты
└── index.ts           # Экспорты

src/hooks/
├── useInstallations.ts   # Hook для установок
├── useEquipment.ts       # Hook для оборудования
├── useEvents.ts          # Hook для мероприятий
├── useConsumables.ts     # Hook для расходников
├── useStatistics.ts      # Hook для статистики
├── useTelegramAuth.ts    # Hook для Telegram WebApp
└── index.ts              # Экспорты
\`\`\`

---

## 🔌 КАК ИСПОЛЬЗОВАТЬ

### В компонентах React:

\`\`\`typescript
import { useInstallations } from '@/hooks';
import { useTelegramAuth } from '@/hooks';
import { toast } from 'sonner';

function MyComponent() {
  const { user } = useTelegramAuth();
  const { installations, loading, createInstallation } = useInstallations();

  const handleCreate = async () => {
    try {
      await createInstallation({
        rack: 'C3',
        laptop: 15,
        printer_type: 'brother',
        printer_number: 5,
        date: new Date().toISOString(),
        user_id: user?.id.toString(),
        username: user?.username,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return <div>{/* UI */}</div>;
}
\`\`\`

---

## 📊 API ENDPOINTS

### Installations:
- `GET /laptop_installations` - все установки
- `GET /laptop_installations?rack=like.C%` - по зоне
- `POST /laptop_installations` - создать
- `PATCH /laptop_installations?id=eq.X` - обновить
- `DELETE /laptop_installations?id=eq.X` - удалить

### Equipment:
- `GET /laptops` - все ноутбуки
- `GET /brother_printers` - принтеры Brother
- `GET /godex_printers` - принтеры Godex

### Events:
- `GET /events?status=eq.active` - активные
- `GET /future_events` - будущие
- `POST /future_events` - создать
- `GET /past_events` - архивные

### Consumables:
- `GET /brother_consumables` - Brother расходники
- `GET /godex_consumables` - Godex расходники
- `PATCH /brother_consumables?id=eq.X` - обновить
- `PATCH /godex_consumables?id=eq.X` - обновить
- `GET /consumables_history` - история изменений

### Statistics:
- Аналитика на клиенте из данных установок
- Тепловые карты
- Эффективность использования

### Reports:
- Данные для месячных/годовых отчетов
- PDF генерация (TODO: на бэкенде)

---

## 🎯 ЧТО ДАЛЬШЕ

### Интеграция в компоненты:

1. **HomePage** → `useStatistics().getOverview()`
2. **InstallationsPage** → `useInstallations()`
3. **EquipmentPage** → `useEquipment()`
4. **EventsPage** → `useEvents()`
5. **ConsumablesPage** → `useConsumables()`
6. **StatisticsPage** → `useStatistics()`
7. **SearchPage** → множественные API
8. **HistoryPage** → история из всех API

### Пример интеграции в InstallationsPage:

\`\`\`typescript
import { useInstallations, useTelegramAuth } from '@/hooks';
import { CreateInstallationDialog } from './CreateInstallationDialog';

export function InstallationsPage() {
  const { user } = useTelegramAuth();
  const { installations, loading, createInstallation } = useInstallations();

  const handleCreate = async (data) => {
    await createInstallation({
      ...data,
      date: new Date().toISOString(),
      user_id: user?.id.toString(),
      username: user?.username,
    });
  };

  if (loading) return <Skeleton />;

  return (
    <>
      {installations.map(inst => (
        <InstallationCard key={inst.id} installation={inst} />
      ))}
      <CreateInstallationDialog onSubmit={handleCreate} />
    </>
  );
}
\`\`\`

---

## 🔥 ПРИМЕРЫ

### Создание установки:
\`\`\`typescript
import { installationsApi } from '@/lib/api';

const installation = await installationsApi.create({
  rack: 'C3',
  laptop: 15,
  printer_type: 'brother',
  printer_number: 5,
  date: new Date().toISOString(),
  user_id: '694377627',
  username: 'test_user',
});
\`\`\`

### Обновление расходника:
\`\`\`typescript
import { consumablesApi } from '@/lib/api';

// Списать 5 единиц
const current = 45;
await consumablesApi.updateBrother(1, current - 5, 'username');

// Или добавить 10
await consumablesApi.updateBrother(1, current + 10, 'username');
\`\`\`

### Поиск оборудования:
\`\`\`typescript
import { equipmentApi } from '@/lib/api';

const laptop = await equipmentApi.getLaptop(15);
const brother = await equipmentApi.getBrotherPrinter(5);
\`\`\`

---

## 📝 TODO

- [ ] Интегрировать в все компоненты
- [ ] Добавить оптимистичные обновления
- [ ] Реализовать кэширование
- [ ] Добавить пагинацию
- [ ] PDF генерация на бэкенде
- [ ] WebSocket для real-time обновлений
- [ ] Обработка офлайн-режима

---

## 🐛 TROUBLESHOOTING

### Ошибка CORS:
- Supabase должен быть настроен правильно
- Проверить headers в config

### Ошибки 401/403:
- Проверить SUPABASE_KEY
- Проверить права доступа в Supabase dashboard

### Медленные запросы:
- Добавить кэширование
- Использовать оптимистичные обновления
- Pagination для больших списков

---

## 🎉 ГОТОВО!

API полностью настроен и готов к использованию. Теперь нужно:
1. Интегрировать hooks в компоненты
2. Заменить mock данные на реальные вызовы
3. Тестировать flow создания/редактирования
4. Добавить error handling и loading states
