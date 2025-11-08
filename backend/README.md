# Backend - NestJS Chatbot API

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` với các biến môi trường:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chatbox

OPENAI_API_KEY=your_openai_api_key_here

PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Chạy ứng dụng

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Database

Ứng dụng sử dụng TypeORM với PostgreSQL. Database sẽ tự động tạo tables khi chạy.

Để tạo migrations trong production:

```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
```

