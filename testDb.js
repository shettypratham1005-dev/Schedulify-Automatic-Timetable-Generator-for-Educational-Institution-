const mongoose = require("mongoose");
const Teacher = require("./Backend/models/teacher");

mongoose
  .connect("mongodb://127.0.0.1:27017/Timetable", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    const teachers = await Teacher.find({});
    console.log("ALL TEACHERS:", JSON.stringify(teachers, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
