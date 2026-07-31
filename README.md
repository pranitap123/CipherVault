# 🔐 SecureVault

SecureVault is a full-stack secure file storage application that allows users to upload, store, manage, and download encrypted files securely.

Built with a modern TypeScript stack, SecureVault focuses on security, clean architecture, and production-ready backend practices.

---

## ✨ Features

### Authentication
- JWT Authentication
- User Registration
- User Login
- Protected Routes

### Secure File Storage
- AES Encryption before storage
- Secure File Upload
- Download Encrypted Files
- Delete Files
- List User Files

### Security
- Helmet
- CORS
- Rate Limiting
- Input Validation
- Password Hashing (bcrypt)
- JWT Authorization

### Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Audit Logging
- Global Error Handling
- Request Logging
- Swagger/OpenAPI Documentation

### Frontend
- React
- TypeScript
- Vite
- Axios
- Secure Authentication Flow

---

# 🏗 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Axios
- React Router

## Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

## Security

- JWT
- bcrypt
- AES Encryption
- Helmet
- Rate Limiter

## Documentation

- Swagger / OpenAPI

---

# 📂 Project Structure

```
SecureVault/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── auth/
│   │   ├── audit/
│   │   ├── config/
│   │   ├── files/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validations/
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── pages/
│   │   └── types/
│
└── README.md
```

---

# 🚀 Getting Started

## Clone

```bash
git clone https://github.com/pranitap123/SecureVault.git

cd SecureVault
```

---

## Backend

```bash
cd backend

npm install
```

Create `.env`

```env
DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

PORT=3000
```

Run Prisma

```bash
npx prisma migrate dev

npx prisma generate
```

Start server

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:3000
```

Start

```bash
npm run dev
```

---

# 📖 API Documentation

Swagger UI

```
http://localhost:3000/api-docs
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- AES File Encryption
- Input Validation
- Request Rate Limiting
- Audit Logging
- Protected Routes
- Secure HTTP Headers

---

# 🛣 Roadmap

## Completed

- User Authentication
- Secure File Upload
- Secure File Download
- File Management
- AES Encryption
- Swagger Documentation
- Audit Logging
- Rate Limiting
- Frontend Integration

## Planned

- Docker Support
- Docker Compose
- CI/CD Pipeline
- Refresh Tokens
- Password Reset
- Email Verification
- Testing
- Production Deployment

---

# 📄 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

**Pranita Panchal**

GitHub: https://github.com/pranitap123