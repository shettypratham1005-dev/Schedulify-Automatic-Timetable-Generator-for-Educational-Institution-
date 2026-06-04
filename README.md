📅 Schedulify – Automatic Timetable Generator for Educational Institutions
📌 Overview

Schedulify is a web-based automatic timetable generation system designed for educational institutions. The system automates the timetable creation process by considering various scheduling constraints such as teacher availability, subject allocation, room availability, workload limits, and class schedules.

The project aims to reduce manual effort, eliminate scheduling conflicts, and improve the efficiency of timetable management.

🎯 Objectives
Automate timetable generation.
Minimize scheduling conflicts.
Reduce manual workload for administrators.
Optimize teacher and classroom allocation.
Provide an easy-to-use interface for timetable management.

🚀 Features
Teacher Management
Subject Management
Classroom/Lab Management
Batch & Division Management
Automatic Timetable Generation
Conflict Detection & Resolution
Timetable Viewing & Management
Database Storage and Retrieval
User-Friendly Interface

🛠️ Tech Stack
Frontend
React.js
HTML5
CSS3
JavaScript
Backend
Node.js
Express.js
Database
MongoDB
Mongoose
Additional Tools
MongoDB Compass
VS Code
Git & GitHub


📊 Database Collections
Teachers
{
  "teacherId": "T001",
  "name": "John Doe",
  "subject": "Database Management",
  "maxLectures": 20
}
Subjects
{
  "subjectId": "S001",
  "subjectName": "DBMS",
  "credits": 4
}
Rooms
{
  "roomId": "R101",
  "capacity": 60,
  "type": "Classroom"
}
Timetable
{
  "day": "Monday",
  "slot": "09:00-10:00",
  "teacher": "T001",
  "subject": "S001",
  "room": "R101"
}
🔒 Constraints Considered
1.Hard Constraints
No teacher overlap.
No classroom overlap.
One lecture per class per slot.
Teacher workload limits.
Room capacity constraints.

2.Soft Constraints
Teacher preferences.
Balanced workload distribution.
Avoid consecutive lectures.
Preferred classroom allocation.

🔄 System Workflow
Admin enters teacher, subject, room, and batch details.
Data is stored in MongoDB.
Timetable generation algorithm processes constraints.
Conflict-free timetable is generated.
Timetable is displayed and can be managed by the administrator.
⚙️ Installation & Setup
Clone Repository
git clone <repository-url>
Backend Setup
cd backend
npm install
node server.js
Frontend Setup
cd frontend
npm install
npm start

📈 Future Enhancements
Genetic Algorithm based optimization.
AI-powered timetable recommendations.
Faculty preference management.
Timetable export to PDF/Excel.
Mobile application support.
Multi-campus timetable management.
👨‍💻 Authors

Pratham H. Shetty
Major Project – Final Year Engineering

📄 License

This project is developed for academic and educational purposes.
