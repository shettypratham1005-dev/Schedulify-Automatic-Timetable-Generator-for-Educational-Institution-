// backend/ga/operators.js
// MongoDB-safe, GA-stable version (NO .id usage)

const _ = require("lodash");

// Constants
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = ["S1", "S2", "S3", "S4", "S5", "S6"];
const PRACTICAL_BLOCKS = [["S1", "S2"], ["S3", "S4"]];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* -------------------- HELPER: Find empty slot -------------------- */
function findEmptySlot(chromo, batchId, requiredSlots = 1, preferredSlots = []) {
  // First try preferred slots
  if (preferredSlots.length > 0) {
    for (const slot of preferredSlots) {
      for (const day of DAYS) {
        const key = `${day}-${slot}`;
        if (!isSlotOccupied(chromo, batchId, key, requiredSlots)) {
          return { day, slot };
        }
      }
    }
  }
  
  // Then try all slots
  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const key = `${day}-${slot}`;
      if (!isSlotOccupied(chromo, batchId, key, requiredSlots)) {
        return { day, slot };
      }
    }
  }
  
  return null; // No slot available
}

function isSlotOccupied(chromo, batchId, key, requiredSlots) {
  // Check if the slot is already occupied for this batch
  for (const gene of chromo) {
    if (gene.occupied && gene.batch === batchId && `${gene.day}-${gene.slot}` === key) {
      return true;
    }
  }
  return false;
}

/* -------------------- PLACE SESSIONS (Lectures/Tutorials) -------------------- */
function placeSessions(chromo, batchId, subject, count, type, teachers, rooms) {
  let placed = 0;
  let attempts = 0;

  while (placed < count && attempts < 300) {
    attempts++;

    const day = pickRandom(DAYS);
    const slot = pickRandom(SLOTS);

    const idx = chromo.findIndex(
      g => g.day === day && g.slot === slot && g.batch === batchId && !g.occupied
    );

    if (idx === -1) continue;

    const teacher = pickRandom(teachers);
    const suitableRooms = type === "lecture"
      ? rooms.filter(r => r.type !== "lab")
      : rooms;

    const room = pickRandom(suitableRooms);

    chromo[idx] = {
  ...chromo[idx],
  subject: subject._id.toString(),
  teacher: teacher._id.toString(),
  room: room._id.toString(),
  type,
  occupied: true
};

    placed++;
  }
}
/* -------------------- PLACE PRACTICALS -------------------- */
function placePracticals(chromo, batchId, subject, blocks, teachers, rooms) {
  let placed = 0;
  let attempts = 0;

  while (placed < blocks && attempts < 300) {
    attempts++;

    const day = pickRandom(DAYS);
    const block = pickRandom(PRACTICAL_BLOCKS);

    const idx1 = chromo.findIndex(
      g => g.day === day && g.slot === block[0] && g.batch === batchId && !g.occupied
    );

    const idx2 = chromo.findIndex(
      g => g.day === day && g.slot === block[1] && g.batch === batchId && !g.occupied
    );

    if (idx1 === -1 || idx2 === -1) continue;

   const labRooms = rooms.filter(r => String(r.type).toLowerCase() === "lab");
    if (!labRooms.length) continue;

    const teacher = pickRandom(teachers);
    const room = pickRandom(labRooms);

    for (const idx of [idx1, idx2]) {
      chromo[idx] = {
      ...chromo[idx],
      subject: subject._id.toString(),
      teacher: teacher._id.toString(),
      room: room._id.toString(),
      type: "practical",
      occupied: true
    };
    }

    placed++;
  }
}

/* -------------------- CREATE EMPTY CHROMOSOME -------------------- */
function makeEmptyGenes(batches) {
  const genes = [];

  for (const day of DAYS) {
    for (const slot of SLOTS) {
      for (const batch of batches) {
        const batchId = batch._id ? batch._id.toString() : batch.id || batch.toString();
        genes.push({
          day,
          slot,
          batch: batchId,
          subject: null,
          teacher: null,
          room: null,
          type: null,
          occupied: false
        });
      }
    }
  }

  return genes;
}

/* -------------------- INITIAL POPULATION -------------------- */
function initPopulation(
  popSize = 40,
  { teachers, rooms, batches, subjects, subjectLoads }
) {
  const population = [];

  for (let i = 0; i < popSize; i++) {
    const chromo = makeEmptyGenes(batches);

    for (const batch of batches) {
      const batchId = batch._id ? batch._id.toString() : batch.id || batch.toString();
for (const [subject, load] of Object.entries(subjectLoads)) {

  const subjectObj = subjects.find(s =>
    Object.values(s).some(
      v => typeof v === "string" && v.toUpperCase() === subject
    )
  );

  //console.log("Matching subject:", subject, subjectObj);

  if (!subjectObj) continue;

  // lectures
  placeSessions(
    chromo,
    batchId,
    subjectObj,
    load.lectures || 0,
    "lecture",
    teachers,
    rooms
  );

  // tutorials
  placeSessions(
    chromo,
    batchId,
    subjectObj,
    load.tutorials || 0,
    "tutorial",
    teachers,
    rooms
  );

  // practicals
  placePracticals(
    chromo,
    batchId,
    subjectObj,
    load.practicals || 0,
    teachers,
    rooms
  );
}
    }

    population.push(chromo);
  }

  return population;
}


/* -------------------- CROSSOVER -------------------- */
function crossover(parentA, parentB) {
  const cut = Math.floor(Math.random() * parentA.length);
  return parentA
    .slice(0, cut)
    .concat(parentB.slice(cut))
    .map(g => ({ ...g }));
}

/* -------------------- MUTATION -------------------- */
function mutate(chromosome, rooms, teachers, rate = 0.08) {

  if (Math.random() > rate) return chromosome;

  const index = Math.floor(Math.random() * chromosome.length);

  const gene = { ...chromosome[index] };

  const mutationType = Math.floor(Math.random() * 3);

  // 0 → change teacher
  if (mutationType === 0) {

    const randomTeacher =
      teachers[Math.floor(Math.random() * teachers.length)];

    gene.teacher =
     randomTeacher._id.toString();

  }

  // 1 → change room
  else if (mutationType === 1) {

    const randomRoom =
      rooms[Math.floor(Math.random() * rooms.length)];

    gene.room = randomRoom._id.toString();

  }

  // 2 → change slot
  else {

    const days = ["Mon","Tue","Wed","Thu","Fri"];

    const slots = ["S1","S2","S3","S4","S5","S6"];

    gene.day = days[Math.floor(Math.random() * days.length)];

    gene.slot = slots[Math.floor(Math.random() * slots.length)];

  }

  chromosome[index] = gene;

  return chromosome;
}

function repairChromosome(chromosome, rooms, teachers) {

  const slotMap = {};

  for (const gene of chromosome) {

    const key = `${gene.day}-${gene.slot}`;

    if (!slotMap[key]) slotMap[key] = [];

    slotMap[key].push(gene);
  }

  for (const slot in slotMap) {

    const entries = slotMap[slot];

    const teachersUsed = new Set();
    const roomsUsed = new Set();

    for (const gene of entries) {

      // Fix teacher clash
      if (teachersUsed.has(String(gene.teacher))) {

        const newTeacher =
          teachers[Math.floor(Math.random() * teachers.length)];

        gene.teacher = newTeacher._id.toString();
      }

      teachersUsed.add(String(gene.teacher));

      // Fix room clash
      if (roomsUsed.has(String(gene.room))) {

        const newRoom =
          rooms[Math.floor(Math.random() * rooms.length)];

        gene.room = newRoom._id.toString();
      }

      roomsUsed.add(String(gene.room));
    }
  }

  return chromosome;
}
module.exports = { initPopulation, crossover, mutate, repairChromosome };