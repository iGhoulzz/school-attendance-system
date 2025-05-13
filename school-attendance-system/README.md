# School Attendance System

A full-stack school management and attendance tracking system built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

## ✨ Features

- 🔐 Secure login system for Admins and Teachers
- 👩‍🏫 Teacher dashboard to record daily attendance
- 📧 Automatic email alerts for student absences
- 🧮 Admin panel to manage students, grades, and teachers
- 📄 Export attendance reports as PDF
- 🌍 Supports bilingual interface (Arabic / English)
- ⚙️ Built with scalability and real-world usage in mind

---

## 📦 Tech Stack

- **Frontend:** React (with i18n for translation)
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT + bcrypt
- **Emails:** Nodemailer (Ethereal for dev)
- **PDF Export:** jsPDF + autoTable

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/school-attendance-system.git
cd school-attendance-system

## 2.cd backend
npm install
cp .env.example .env     # then edit .env with your real Mongo URI and secrets
npm start


 ## 3.Run the frontend
bash
Copy
Edit
cd ../
npm install
npm start.....Frontend runs on http://localhost:3000
Backend runs on http://localhost:5001

## 4.Create a .env file inside the backend/ folder:

env
Copy
Edit
PORT=5001
MONGO_URI=mongodb://<your-host>/<your-db>
JWT_SECRET=yourSecret




