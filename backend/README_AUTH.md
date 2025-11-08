# Authentication Setup

## Environment Variables

Thêm vào file `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Authentication

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
  Headers: `Authorization: Bearer <token>`

### Protected Endpoints

Tất cả endpoints trong `/api/chat/*` yêu cầu authentication:
- Headers: `Authorization: Bearer <token>`

## Security Features

1. **Password Hashing**: Sử dụng bcrypt để hash passwords
2. **JWT Tokens**: Tokens có thời hạn 7 ngày
3. **User Isolation**: Mỗi user chỉ có thể xem/conversations của chính họ
4. **Protected Routes**: Tất cả chat endpoints yêu cầu authentication

## Installation

```bash
cd backend
yarn install
# hoặc
npm install
```

Dependencies mới được thêm:
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `bcrypt`

