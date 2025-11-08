# Hướng dẫn thiết lập nhanh

## Bước 1: Khởi động PostgreSQL

### Option 1: Sử dụng Docker (Khuyến nghị)

```bash
docker-compose up -d
```

### Option 2: Cài đặt PostgreSQL local

Tạo database:
```sql
CREATE DATABASE chatbox;
```

## Bước 2: Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env`:
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

**Quan trọng**: Thay `your_openai_api_key_here` bằng API key thật của bạn từ https://platform.openai.com/api-keys

Khởi động backend:
```bash
npm run start:dev
```

## Bước 3: Cài đặt Frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Khởi động frontend:
```bash
npm run dev
```

## Bước 4: Truy cập ứng dụng

Mở trình duyệt và truy cập: http://localhost:3000

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đang chạy: `docker ps` hoặc `pg_isready`
- Kiểm tra thông tin kết nối trong file `.env`

### Lỗi OpenAI API
- Kiểm tra API key đã được cấu hình đúng
- Kiểm tra bạn có credits trong tài khoản OpenAI

### Lỗi CORS
- Đảm bảo `FRONTEND_URL` trong backend `.env` trùng với URL frontend
- Kiểm tra backend đang chạy trên port 3001

