const mongoose = require('mongoose');
const Subject = require('./models/subject');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Batch = require('./models/batch');
const config = require('./config/timetableConfig');
const Timetable = require('./models/timetable');

const uri = "mongodb://127.0.0.1:27017/Timetable";

async function forceGenerate() {
  await mongoose.connect(uri);
  console.log("Forcing Generation for BE Semester 8...");
  
  const className = "BE";
  const semester = 8;
  const classConfig = config[semester];

  // Mock Request/Response
  let resStatus = null;
  let resJson = null;

  const mockRes = {
    status: (s) => { resStatus = s; return mockRes; },
    json: (j) => { resJson = j; return mockRes; }
  };

  // Mock Request
  const mockReq = { body: { className, semester } };

  // Need to import the router or just call the logic.
  // Since I can't easily import the route handler, I'll just run a node script 
  // that hits the local server if it's running, or I'll just look at the code.
  
  // Wait, I already added console.error logs to the backend.
  // I'll just ask the user to check the console for the "Auto-generate error" message.
  
  mongoose.disconnect();
}

forceGenerate();
