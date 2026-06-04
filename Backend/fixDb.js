const mongoose = require("mongoose");
const Teacher = require("./models/teacher");
const Room = require("./models/room");

mongoose
  .connect("mongodb://127.0.0.1:27017/Timetable", {})
  .then(async () => {
    console.log("Fixing Teacher and Room classes...");

    const teachers = await Teacher.find({});
    for (const t of teachers) {
      // Check if classNames has stringified arrays
      let newClassNames = [];
      let needsFix = false;
      const arrToFix = t.classNames || t.className || [];
      
      for (const item of arrToFix) {
        if (item.includes("[")) {
          needsFix = true;
          try {
            const parsed = JSON.parse(item);
            newClassNames.push(...parsed);
          } catch (e) {
            console.error("Parse fail", item);
          }
        } else {
          newClassNames.push(item);
        }
      }

      if (needsFix) {
        console.log(`Fixing teacher ${t.name} from`, arrToFix, `to`, newClassNames);
        await Teacher.updateOne({ _id: t._id }, { $set: { classNames: newClassNames } });
        // Also remove legacy className to avoid confusion
        await Teacher.updateOne({ _id: t._id }, { $unset: { className: 1 } });
      }
    }

    const rooms = await Room.find({});
    for (const r of rooms) {
      let newClassNames = [];
      let needsFix = false;
      const arrToFix = r.classNames || r.className || [];
      
      for (const item of arrToFix) {
        if (item.includes("[")) {
          needsFix = true;
          try {
            const parsed = JSON.parse(item);
            newClassNames.push(...parsed);
          } catch (e) {
            console.error("Parse fail", item);
          }
        } else {
          newClassNames.push(item);
        }
      }

      if (needsFix) {
        console.log(`Fixing room ${r.room_no} from`, arrToFix, `to`, newClassNames);
        await Room.updateOne({ _id: r._id }, { $set: { classNames: newClassNames } });
        await Room.updateOne({ _id: r._id }, { $unset: { className: 1 } });
      }
    }

    console.log("Done fixing!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
