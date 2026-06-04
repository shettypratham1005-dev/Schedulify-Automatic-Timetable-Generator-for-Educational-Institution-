 const SLOT_ORDER = [
"8:15-9:15",
"9:15-10:15",
"10:15-11:15",
"11:30-12:30",
"12:30-1:30",
"1:30-2:30",
"2:30-3:30",
"3:30-4:30",
"4:30-5:30"
];
function evaluate(chromosome) {
  let penalty = 0;
  const teacherLoad = {};
  const slotMap = {};
 

  for (const gene of chromosome) {
    if (gene.teacher) {
      teacherLoad[gene.teacher] = (teacherLoad[gene.faculty] || 0) + 1;
    }

    if (!gene.day || !gene.slot) continue;

    const key = `${gene.day}-${gene.slot}`;

    if (!slotMap[key]) slotMap[key] = [];

    slotMap[key].push(gene);
  }

  // Check conflicts per slot
  for (const slot in slotMap) {
    const entries = slotMap[slot];

    const teachers = new Set();
    const rooms = new Set();
    const batches = new Set();

    for (const e of entries) {
      if (teachers.has(e.teacher)) penalty += 50;
      teachers.add(e.teacher);

      if (rooms.has(e.room)) penalty += 40;
      rooms.add(e.room);

      if (batches.has(e.batch)) penalty += 60;
      batches.add(e.batch);
    }
  }

  // Teacher workload balancing
const MAX_LOAD = 15;

for (const teacher in teacherLoad) {
  if (teacherLoad[teacher] > MAX_LOAD) {
    penalty += (teacherLoad[teacher] - MAX_LOAD) * 10;
  }
}

//  Subject spacing

const batchDayMap = {};

for (const gene of chromosome) {
  if (!gene.batch || !gene.day) continue;

  const key = `${gene.batch}-${gene.day}`;

  if (!batchDayMap[key]) batchDayMap[key] = [];

  batchDayMap[key].push(gene);
}

// Check consecutive subjects
for (const key in batchDayMap) {
 const sessions = batchDayMap[key].sort((a, b) => {
  return SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
});

  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i].subject === sessions[i - 1].subject) {
      penalty += 20;
    }
  }
}

// Free day preference

const batchDays = {};

for (const gene of chromosome) {
  if (!gene.batch || !gene.day) continue;

  if (!batchDays[gene.batch]) {
    batchDays[gene.batch] = new Set();
  }

  batchDays[gene.batch].add(gene.day);
}

for (const batch in batchDays) {
  const activeDays = batchDays[batch].size;

  if (activeDays === 5) {
    penalty += 25; // small penalty if no free day
  }
}

// Practical sessions must be consecutive

const practicalMap = {};

for (const gene of chromosome) {
  if (gene.type !== "practical") continue;

  const key = `${gene.batch}-${gene.subject}-${gene.day}`;

  if (!practicalMap[key]) practicalMap[key] = [];

  practicalMap[key].push(gene);
}

for (const key in practicalMap) {
  const sessions = practicalMap[key].sort((a, b) => {
    return a.slot.localeCompare(b.slot);
  });

  for (let i = 1; i < sessions.length; i++) {
  if (sessions[i].slot === sessions[i - 1].slot) continue;

  const prevIndex = sessions.findIndex(s => s === sessions[i - 1]);
  const currIndex = sessions.findIndex(s => s === sessions[i]);

  if (currIndex !== prevIndex + 1) {
    penalty += 30;
  }
}
}

// Room type validation

for (const gene of chromosome) {
  if (!gene.room) continue;

  // practical must be in lab
  if (gene.type === "practical") {
    if (!gene.room || !String(gene.room).toLowerCase().includes("lab")) {
      penalty += 25;
    }
  }

  // lecture/tutorial should not be in lab
  if (gene.type === "lecture" || gene.type === "tutorial") {
    if (gene.room && String(gene.room).toLowerCase().includes("lab")) {
      penalty += 20;
    }
  }
}

  const fitness = Math.max(0, 1000 - penalty);

  return {
    fitness,
    penalties: penalty
  };
}

module.exports = { evaluate };