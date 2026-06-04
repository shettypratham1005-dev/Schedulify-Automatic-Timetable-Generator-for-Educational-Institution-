# 📅 Schedulify – Automatic Timetable Generator

---

## 🚀 Banner

> Smart Timetable Generation System for Educational Institutions

---

## 🏷️ Badges

![Status](https://img.shields.io/badge/Status-Completed-green)
![Frontend](https://img.shields.io/badge/Frontend-React.js-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-Academic-lightgrey)

---

## 📌 Overview

**Schedulify** is a full-stack web application designed to automatically generate conflict-free timetables for educational institutions.

It considers multiple real-world constraints such as:
- Teacher availability  
- Subject allocation  
- Classroom capacity  
- Batch and division scheduling  
- Workload balancing  

👉 The goal is to **eliminate manual scheduling effort and reduce conflicts efficiently**.

---

## 🎯 Objectives

- Automate timetable generation  
- Reduce scheduling conflicts  
- Optimize teacher and classroom usage  
- Minimize administrative workload  
- Provide an intuitive dashboard  

---

## 🚀 Features

### 👨‍🏫 Management Modules
- Teacher Management  
- Subject Management  
- Classroom / Lab Management  
- Batch & Division Management  

### ⚙️ Core System
- Automatic Timetable Generation  
- Conflict Detection & Resolution  
- Timetable Viewer Interface  
- MongoDB Data Storage  
- Efficient Scheduling Logic  

---

## 🛠️ Tech Stack

### 🎨 Frontend
- React.js  
- HTML5  
- CSS3  
- JavaScript  

### ⚙️ Backend
- Node.js  
- Express.js  

### 🗄️ Database
- MongoDB  
- Mongoose  

### 🧰 Tools
- Git & GitHub  
- VS Code  
- MongoDB Compass  

---

## 📊 Database Structure

### 👨‍🏫 Teachers
```json
{
  "teacherId": "T001",
  "name": "John Doe",
  "subject": "Database Management",
  "maxLectures": 20
}

📚 Subjects
{
  "subjectId": "S001",
  "subjectName": "DBMS",
  "credits": 4
}
🏫 Rooms
{
  "roomId": "R101",
  "capacity": 60,
  "type": "Classroom"
}
📅 Timetable
{
  "day": "Monday",
  "slot": "09:00-10:00",
  "teacher": "T001",
  "subject": "S001",
  "room": "R101"
}

