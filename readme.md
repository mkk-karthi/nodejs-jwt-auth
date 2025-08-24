# Node.js Microservice Project with JWT Authentication

A Node.js scaffolding project with **microservice architecture** supporting **User CRUD and Authentication operations**.  
It integrates **Sequelize ORM** with migrations & seeders, JWT-based authentication, password recovery via OTP & email, file uploads, and modern tooling for security, logging, API documentation, and testing.

---

## 🚀 Features

- **User Management**: Full CRUD operations  
- **Authentication**: JWT-based login & signup  
- **Forgot Password**: OTP-based reset via email (using Nodemailer)  
- **File Upload**: Handled via Multer  
- **Database**: Sequelize with migrations & seeders  
- **Security**: CORS & Helmet middleware  
- **Logging**: Winston with `winston-daily-rotate-file`  
- **API Documentation**: Swagger at [http://localhost:8888/api-docs/](http://localhost:8888/api-docs/)  
- **Testing**: Jest & Supertest with coverage reports  
- **Node Version**: Requires **Node.js >= 20.0.0**

---

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/mkk-karthi/nodejs-jwt-auth.git
cd <project-folder>
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

* Copy the example environment files:

```bash
cp .env.example .env
cp .env.example .env.test
```

* Add required configs:

  * **Database credentials**
  * **Mail server (SMTP) details** for OTP/forgot password
  * Other properties in `config.js`

### 4. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🗄️ Database Commands

```bash
# Run migrations
npm run db:migrate

# Refresh database (drop, migrate again)
npm run db:refresh

# Seed database
npm run db:seed
```

---

## 🔐 Authentication Features

* **Signup**: Create new user account
* **Login**: JWT-based authentication
* **Forgot Password**: Request OTP (sent via email using Nodemailer)
* **Reset Password**: Verify OTP & update password
* **Token Security**: Access & refresh tokens with expiry handling

---

## 📤 File Upload

* Handled using **Multer** middleware
* Supports single & multiple file uploads (e.g., profile pictures, documents)

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Get coverage report
npm run test:coverage
```

---

## 📖 API Documentation

Swagger UI is available at:
👉 [http://localhost:8888/api-docs/](http://localhost:8888/api-docs/)

---

## 📜 Scripts Summary

| Script                  | Description                       |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Start in development mode         |
| `npm start`             | Start in production mode          |
| `npm run db:migrate`    | Run database migrations           |
| `npm run db:refresh`    | Refresh database (drop + migrate) |
| `npm run db:seed`       | Run seeders                       |
| `npm test`              | Run Jest unit tests               |
| `npm run test:coverage` | Generate Jest coverage report     |

---

## ✅ Requirements

* Node.js **20.0.0 or above**
* A configured database (MySQL/PostgreSQL/SQLite as per Sequelize setup)
* SMTP email service (Gmail, SendGrid, etc.) for OTP-based reset

---

## 🎉 Next Steps

Start the server and enjoy building secure microservices with authentication, OTP-based recovery, and file uploads!
