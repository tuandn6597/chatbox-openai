# Chatbox - AI Chatbot với OpenAI

Một ứng dụng chatbot tích hợp với OpenAI, được xây dựng với NestJS (Backend) và Next.js (Frontend).

## Công nghệ sử dụng

### Backend
- **NestJS** - Framework Node.js
- **PostgreSQL** - Database
- **TypeORM** - ORM
- **OpenAI API** - AI Chatbot

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type safety
- **CSS Modules** - Styling

## Cài đặt

### Yêu cầu
- Node.js 18+
- PostgreSQL 12+
- OpenAI API Key

### 1. Cài đặt Backend

```bash
cd backend
npm install
# hoặc
yarn install
```

Tạo file `.env` trong thư mục `backend`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chatbox

OPENAI_API_KEY=your_openai_api_key_here

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Quan trọng**: 
- Thay `your_openai_api_key_here` bằng API key thật từ https://platform.openai.com/api-keys
- Thay `your-super-secret-jwt-key-change-in-production` bằng một secret key mạnh cho JWT

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local` trong thư mục `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Cài đặt PostgreSQL

Đảm bảo PostgreSQL đang chạy và tạo database:

```sql
CREATE DATABASE chatbox;
```

Hoặc sử dụng Docker:

```bash
docker run --name chatbox-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chatbox -p 5432:5432 -d postgres
```

## Chạy ứng dụng

### Chạy Backend

```bash
cd backend
npm run start:dev
```

Backend sẽ chạy tại `http://localhost:3001`

### Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Đăng ký tài khoản mới
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/login` - Đăng nhập
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `GET /api/auth/me` - Lấy thông tin user hiện tại (requires authentication)

### Conversations (Protected - requires JWT token)
Tất cả endpoints yêu cầu header: `Authorization: Bearer <token>`

- `POST /api/chat/conversations` - Tạo conversation mới
- `GET /api/chat/conversations` - Lấy danh sách conversations của user
- `GET /api/chat/conversations/:id` - Lấy conversation theo ID
- `DELETE /api/chat/conversations/:id` - Xóa conversation

### Messages (Protected - requires JWT token)
- `POST /api/chat/messages` - Gửi message và nhận phản hồi từ AI

## Tính năng

- ✅ **Authentication**: Đăng ký, đăng nhập với JWT
- ✅ **User Isolation**: Mỗi user chỉ thấy conversations của chính họ
- ✅ Chat với AI sử dụng OpenAI GPT-3.5-turbo
- ✅ Quản lý nhiều conversations
- ✅ Lưu trữ lịch sử chat trong database
- ✅ Giao diện đẹp và responsive
- ✅ Real-time messaging
- ✅ Protected routes và API endpoints

## Cấu trúc dự án

```
chatbox/
├── backend/
│   ├── src/
│   │   ├── chat/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.module.ts
│   │   │   └── openai.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.module.css
│   └── package.json
└── README.md
```

## Lưu ý

- Đảm bảo bạn có OpenAI API Key hợp lệ
- Database sẽ tự động tạo tables khi chạy ứng dụng (synchronize: true)
- Trong môi trường production, nên tắt synchronize và sử dụng migrations

