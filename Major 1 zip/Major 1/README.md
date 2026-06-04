# Automated Timetable Generator

A complete MERN stack (without React) application for generating college timetables with PDF export functionality.

## Project Overview

This is a full-stack application for automating college timetable generation. It includes:
- Single admin authentication with JWT
- Complete CRUD operations for departments, subjects, faculty, classrooms, labs, and batches
- Smart timetable generation algorithm with constraint satisfaction
- PDF export functionality
- Clean, modern frontend using vanilla HTML, CSS, and JavaScript

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML, CSS, Vanilla JavaScript (No React/Angular/Vue)
- **PDF Generation**: PDFKit
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
timetable-generator/
├── backend/
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Department.js
│   │   ├── Subject.js
│   │   ├── Faculty.js
│   │   ├── Classroom.js
│   │   ├── Batch.js
│   │   └── Timetable.js
│   └── routes/
│       ├── authRoutes.js
│       ├── departmentRoutes.js
│       ├── subjectRoutes.js
│       ├── facultyRoutes.js
│       ├── classroomRoutes.js
│       ├── batchRoutes.js
│       └── timetableRoutes.js
├── frontend/
│   ├── html/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── departments.html
│   │   ├── subjects.html
│   │   ├── faculty.html
│   │   ├── classrooms.html
│   │   ├── batches.html
│   │   ├── generate.html
│   │   └── view-timetable.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── api.js
│       └── app.js
├── package.json
├── server.js
├── .env
└── README.md
```

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or cloud instance)

## Installation & Setup

### 1. Install Dependencies

```
bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```
env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timetable_generator
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update the MONGODB_URI to point to your MongoDB instance.

### 4. Run the Server

```
bash
npm start
```

The server will start on http://localhost:3000

### 5. Access the Application

Open your browser and navigate to: http://localhost:3000

## Default Login Credentials

- **Username**: admin
- **Password**: admin123

## Getting Started Guide

After logging in, follow these steps to generate a timetable:

### Step 1: Add Departments
Go to "Departments" and add your departments:
- EXTC (Electronics and Telecommunication)
- VLSI (Very Large Scale Integration)

### Step 2: Add Subjects
Go to "Subjects" and add subjects for each year (SE, TE, BE):
- Specify whether each subject is a Lecture or Lab
- Set lectures per week (default: 4)

### Step 3: Add Faculty
Go to "Faculty" and add faculty members:
- Assign subjects they can teach
- Each faculty can teach up to 8 lectures per week

### Step 4: Add Classrooms and Labs
Go to "Classrooms":
- Classrooms: 415, 416
- Labs: 409, 411B, 407, 410A, 402
- Use "Initialize Default Rooms" button to add all at once

### Step 5: Add Batches
Go to "Batches" and create batches:
- Batch A, Batch B, etc. for each department and year

### Step 6: Generate Timetable
Go to "Generate Timetable":
- Select department and year
- Click "Generate Timetable"

### Step 7: View and Download
Go to "View Timetable":
- Select department and year
- View the generated timetable
- Download as PDF

## Timetable Generation Constraints

The algorithm implements the following constraints:

1. **Faculty Workload**: Each faculty member gets exactly 8 lectures per week
2. **Break Time**: After each lecture, faculty gets at least 1 hour break
3. **Classrooms**: Only rooms 415 and 416 are used for lectures
4. **Labs**: Labs are scheduled in rooms 409, 411B, 407, 410A, 402
5. **Parallel Labs**: Multiple batches can have labs simultaneously in different labs
6. **No Clashes**: No faculty, classroom, or lab clashes

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Faculty
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Classrooms
- `GET /api/classrooms` - Get all classrooms
- `POST /api/classrooms` - Create classroom
- `POST /api/classrooms/initialize` - Initialize default rooms
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Timetable
- `GET /api/timetable` - Get all timetables
- `POST /api/timetable/generate` - Generate timetable
- `GET /api/timetable/:id` - Get timetable
- `DELETE /api/timetable/:id` - Delete timetable

## Sample Data

You can find sample test data in `sample-data.json` for testing the application.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the MONGODB_URI in .env file

### Port Already in Use
- Change the PORT in .env file
- Or stop the process using port 3000

### Timetable Generation Fails
- Ensure all prerequisites are met (departments, subjects, faculty, classrooms, labs, batches)
- Check that faculty have subjects assigned to them
- Ensure there are enough classrooms and labs

## License

ISC
