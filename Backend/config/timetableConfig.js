module.exports = {
  3: {
    className: "SE",
    lectureRooms: ["417"],
    subjects: [
      { name: "ENAS", type: "Lecture", lectures: 3, faculty: "Mr.VG" },
      { name: "DSD", type: "Lecture", lectures: 3, faculty: "Ms.TS" },
      { name: "ED", type: "Lecture", lectures: 3, faculty: "Mr.SP" },
      { name: "EDC", type: "Lecture", lectures: 3, faculty: "Ms.BG" },
      { name: "EM", type: "Lecture", lectures: 3, faculty: "Mr.MG" },
      { name: "EVS", type: "Lecture", lectures: 2, faculty: "Mr.SP" },
      { name: "OE", type: "Lecture", lectures: 2, faculty: "Ms.SP" },
      
      { name: "ENAS Lab", type: "Practical", lectures: 2, faculty: "Mr.VG", labRoom: "411" },
      { name: "DSD Lab", type: "Practical", lectures: 2, faculty: "Ms.TS", labRoom: "411B" },
      { name: "EDC Lab", type: "Practical", lectures: 2, faculty: "Ms.BG", labRoom: "407" }
    ],
    reserved: []
  },
  4: {
    className: "SE",
    lectureRooms: ["415", "416", "417", "317", "411B"],
    subjects: [
      { name: "ADC", type: "Lecture", lectures: 3, faculty: "Ms.AR" },
      { name: "NNFL", type: "Lecture", lectures: 3, faculty: "Ms.SJ" },
      { name: "SES", type: "Lecture", lectures: 3, faculty: "Ms.SK" },
      { name: "MC", type: "Lecture", lectures: 3, faculty: "Ms.TS" },
      { name: "MDM", type: "Lecture", lectures: 3, faculty: "Ms.RR" },
      { name: "BMD", type: "Lecture", lectures: 3, faculty: "Mr.MG" },
      { name: "DT", type: "Lecture", lectures: 2, faculty: "Mr.GT" },

      { name: "ADC Lab", type: "Practical", lectures: 2, faculty: "Ms.AR", labRoom: "402" },
      { name: "SES Lab", type: "Practical", lectures: 2, faculty: "Ms.SK", labRoom: "403" },
      { name: "MC Lab", type: "Practical", lectures: 2, faculty: "Ms.TS", labRoom: "401" },
      { name: "MDM Lab", type: "Practical", lectures: 2, faculty: "Ms.RR", labRoom: "411" }
    ],
    reserved: []
  },
  5: {
    className: "TE",
    lectureRooms: ["415", "416"],
    subjects: [
      { name: "DCOM", type: "Lecture", lectures: 3, faculty: "Ms.SJ" },
      { name: "DTSP", type: "Lecture", lectures: 3, faculty: "Mr.AV" },
      { name: "DVLSI", type: "Lecture", lectures: 3, faculty: "Ms.SK" },
      { name: "RSA", type: "Lecture", lectures: 3, faculty: "Ms.SS" },
      { name: "DSA", type: "Lecture", lectures: 3, faculty: "Ms.AK" },
      { name: "ST", type: "Lecture", lectures: 2, faculty: "Ms.KS" },
      { name: "BCE", type: "Lecture", lectures: 2, faculty: "Mr.PG" },

      { name: "DCOM Lab", type: "Practical", lectures: 2, faculty: "Ms.SJ", labRoom: "402" },
      { name: "DVLSI Lab", type: "Practical", lectures: 2, faculty: "Ms.SK", labRoom: "401" },
      { name: "DTSP Lab", type: "Practical", lectures: 2, faculty: "Mr.AV", labRoom: "410A" },

      { name: "BCE Tutorial", type: "Tutorial", lectures: 1, faculty: "Mr.PG", labRoom: "317" },
      { name: "RSA Tutorial", type: "Tutorial", lectures: 1, faculty: "Ms.SS", labRoom: "317" }
    ],
    reserved: [
      { name: "Mini Project", type: "Project", day: "Friday", duration: 2, typeConstraint: "Consecutive" }
    ]
  },
  6: {
    className: "TE",
    lectureRooms: ["415", "416", "417", "317", "411B"],
    subjects: [
      { name: "EMA", type: "Lecture", lectures: 3, faculty: "Ms.SS" },
      { name: "CCN", type: "Lecture", lectures: 3, faculty: "Ms.AK" },
      { name: "IPMV", type: "Lecture", lectures: 3, faculty: "Mr.AV" },
      { name: "ANN & FL", type: "Lecture", lectures: 3, faculty: "Ms.NG" },
      { name: "DBMS", type: "Lecture", lectures: 3, faculty: "Ms.AK" },
      { name: "IOT", type: "Lecture", lectures: 3, faculty: "Ms.SJ" },

      { name: "EMA Lab", type: "Practical", lectures: 2, faculty: "Ms.SS", labRoom: "411" },
      { name: "CCN Lab", type: "Practical", lectures: 2, faculty: "Ms.AK", labRoom: "410B" },
      { name: "IPMV Lab", type: "Practical", lectures: 2, faculty: "Mr.AV", labRoom: "410A" },
      { name: "Skill Lab", type: "Practical", lectures: 2, faculty: "Ms.NG", labRoom: "401" }
    ],
    reserved: [
      { name: "Mini Project", type: "Project", day: "Thursday", duration: 1, typeConstraint: "Single" },
      { name: "Mini Project", type: "Project", day: "Friday", duration: 1, typeConstraint: "Single" }
    ]
  },
  7: {
    className: "BE",
    lectureRooms: ["416"],
    subjects: [
      { name: "MCS", type: "Lecture", lectures: 3, faculty: "Ms.AR" },
      { name: "ME", type: "Lecture", lectures: 3, faculty: "Ms.NG" },
      { name: "ICE", type: "Lecture", lectures: 3, faculty: "Ms.AK" },
      { name: "DL", type: "Lecture", lectures: 3, faculty: "Ms.SK" },
      { name: "CC", type: "Lecture", lectures: 3, faculty: "Mr.SP" },
      { name: "DMMM", type: "Lecture", lectures: 2, faculty: "Ms.PK" },
      { name: "MIS", type: "Lecture", lectures: 2, faculty: "Mr.TR" },

      { name: "MCS Lab", type: "Practical", lectures: 2, faculty: "Ms.AR", labRoom: "410B" },
      { name: "ME Lab", type: "Practical", lectures: 2, faculty: "Ms.NG", labRoom: "410A" }
    ],
    reserved: [
      { name: "Major Project", type: "Project", day: "Friday", duration: "FullDay" }
    ]
  },
  8: {
    className: "BE",
    lectureRooms: ["415", "416", "218", "409"],
    subjects: [
      { name: "OCN", type: "Lecture", lectures: 3, faculty: "Mr.VG" },
      { name: "NMT", type: "Lecture", lectures: 3, faculty: "Ms.NG" },
      { name: "WD", type: "Lecture", lectures: 3, faculty: "Mr.SP" },
      { name: "PM", type: "Lecture", lectures: 3, faculty: "Mr.VP", isParallel: "BE-Elective" }, 
      { name: "EM", type: "Lecture", lectures: 3, faculty: "Mr.UA", isParallel: "BE-Elective" },

      { name: "OCN Lab", type: "Practical", lectures: 2, faculty: "Mr.VG", labRoom: "409" }
    ],
    reserved: [
      { name: "Honors", type: "Project", day: "Thursday", duration: 1, typeConstraint: "FirstSlot" },
      { name: "PAT Activity", type: "Project", day: "Thursday", duration: "Remaining" },
      { name: "Major Project", type: "Project", day: "Friday", duration: "FullDay", room: "403", faculty: "Guide" }
    ]
  }
};