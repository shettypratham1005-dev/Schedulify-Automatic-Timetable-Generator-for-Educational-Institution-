// backend/ga/sample_data.js

module.exports = {
  // Time slots for each day (you can later map them to actual hours)
  slots: ["S1", "S2", "S3", "S4", "S5", "S6"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],

  // Example teachers
  teachers: [
    { id: "T1", name: "Prof A", subjects: ["S001", "S002"], maxLectures: 12 },
    { id: "T2", name: "Prof B", subjects: ["S003"], maxLectures: 12 },
  ],

  // Rooms (lecture + lab)
  rooms: [
    { id: "R101", name: "Room 101", type: "lecture", capacity: 60 },
    { id: "L1", name: "Lab 1", type: "lab", capacity: 30 },
  ],

  // Batch info
  batches: [
    { id: "SE-A", year: "SE", students: 60 },
  ],

  // Subjects
  subjects: [
    { id: "S001", name: "DCOM", type: "theory", hoursPerWeek: 4 },
    { id: "S002", name: "EDC-Lab", type: "practical", hoursPerWeek: 3, duration: 2 },
    { id: "S003", name: "DSP", type: "theory", hoursPerWeek: 4 },
  ],
};
