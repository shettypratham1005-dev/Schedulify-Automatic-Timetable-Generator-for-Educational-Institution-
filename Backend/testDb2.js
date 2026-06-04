const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const Room = require("./models/room");

mongoose
  .connect("mongodb://127.0.0.1:27017/Timetable", {})
  .then(async () => {
    const teachers = await Teacher.find({});
    console.log("ALL TEACHERS COUNT:", teachers.length);
    if(teachers.length > 0) {
      console.log("TEACHER 1:", JSON.stringify(teachers[0], null, 2));
    }
    const rooms = await Room.find({});
    console.log("ALL ROOMS COUNT:", rooms.length);
    if(rooms.length > 0) {
      console.log("ROOM 1:", JSON.stringify(rooms[0], null, 2));
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
