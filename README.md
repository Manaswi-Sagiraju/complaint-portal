# 🛡️ Complaint Portal System

A full-stack complaint management system where users can submit complaints (with optional anonymity), and admins can manage, view, and update complaint statuses.

---

## 🚀 Features

### 👤 User Side
- Submit complaint
- Upload evidence files
- Optional anonymous submission
- Location capture
- Audio recording support

### 🔐 Admin Side
- Secure admin login
- View all complaints
- Search complaints
- Update complaint status
- Download reports

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- Multer (File Upload)
- JWT Authentication
- Nodemailer

### Frontend
- HTML
- CSS
- JavaScript

---

## 📂 Project Structure

```
complaint-portal/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│
├── frontend/
│   ├── index.html
│   ├── complaint.html
│   ├── admin-dashboard.html
│
└── README.md
```

---

## ⚙️ Installation (Local Setup)

### 1️⃣ Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/complaint-portal.git
cd complaint-portal/backend
```

### 2️⃣ Install Dependencies

```
npm install
```

### 3️⃣ Create `.env` File

Create a `.env` file inside `backend` folder:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
JWT_SECRET=your_secret_key
```

### 4️⃣ Start Server

```
npm start
```

Server runs on:
```
http://localhost:3000
```

---

## 🌍 Deployment

Backend deployed on:
- Render

Database hosted on:
- Railway (Cloud MySQL)

---

## 📌 API Endpoints

### Auth
- `POST /api/auth/login`

### Complaints
- `POST /api/complaints`
- `GET /api/complaints`
- `PUT /api/complaints/:id/status`

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Environment variables protection
- CORS enabled

---

---

## 👩‍💻 Author

Manaswi Sagiraju

---

## 📄 License

This project is licensed under ISC.
