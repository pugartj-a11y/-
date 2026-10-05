# GAMEHUB — Inworld TTS

Игровой каталог с кнопками озвучки. Текст передаётся на собственный `/api/tts`, а сервер обращается к Inworld TTS API. API-ключ не хранится во frontend-коде.

## Запуск

1. Установите Node.js 18+.
2. Выполните `npm install`.
3. Создайте файл `.env` и задайте `INWORLD_API_KEY`.
4. Запустите `node --env-file=.env server.js`.
5. Откройте `http://localhost:3000`.

Используется Inworld TTS 2, голос `posh-penguin-9779__design-voice-16146089`, MP3 и режим BALANCED.

## Безопасность

Не публикуйте API-ключ в `app.js`, HTML, CSS или git. Для production используйте секреты хостинга и HTTPS.