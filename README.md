# MegaShift TMA Server

Серверное приложение для управления сменами с интеграцией Telegram Mini App.

## Технологии

- **NestJS** — Node.js фреймворк
- **PostgreSQL** — база данных (через Prisma)
- **Redis** — кеширование и сессии
- **Telegram Bot** (grammy) — бот для уведомлений
- **TMA** — Telegram Mini App для работы со сменами

## Функциональность

- Управление пользователями и профилями
- Создание и учёт рабочих смен
- Шаблоны смен
- Система доступа (владельцы и гости)
- Приглашения пользователей
- Статистика и отчёты
- Настройки зарплаты

## Установка

```bash
npm install
```

## Настройка

## Переменные окружения

Создайте файл `.env` со следующими переменными:

| Переменная             | Описание                                   | Значение по умолчанию |
| ---------------------- | ------------------------------------------ | --------------------- |
| `BOT_TOKEN`            | Токен Telegram-бота                        | —                     |
| `DATABASE_URL`         | URL подключения к PostgreSQL               | —                     |
| `REDIS_URL`            | URL подключения к Redis                    | —                     |
| `TELEGRAM_MODE`        | Режим работы бота: `polling` или `webhook` | `polling`             |
| `TELEGRAM_WEBHOOK_URL` | URL для webhook (если используется)        | —                     |
| `WEB_APP_URL`          | URL Telegram Mini App                      | —                     |
| `PORT`                 | Порт сервера                               | `8000`                |
| `NODE_ENV`             | Окружение: `development` или `production`  | `development`         |

Пример `.env`:

```env
BOT_TOKEN='your_telegram_bot_token'
DATABASE_URL="postgresql://user:password@localhost:5432/db"
REDIS_URL="redis://password@localhost:6379"
TELEGRAM_MODE='polling'
TELEGRAM_WEBHOOK_URL=''
WEB_APP_URL='https://your-app.vercel.app'
PORT=8000
NODE_ENV='development'
```

## Запуск

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

## Миграции БД

```bash
npx prisma migrate dev
npx prisma generate
```

## Linting

```bash
npm run lint
```
