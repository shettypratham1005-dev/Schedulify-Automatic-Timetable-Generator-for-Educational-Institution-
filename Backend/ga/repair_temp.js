function repair(chromosome) {
  const usedSlots = {};

  for (let gene of chromosome) {
    const key = `${gene.day}-${gene.slot}`;

    if (!usedSlots[key]) {
      usedSlots[key] = {
        teachers: new Set(),
        rooms: new Set(),
        batches: new Set()
      };
    }

    const slot = usedSlots[key];

    // If conflict detected, move to random new slot
    if (
      slot.teachers.has(gene.faculty) ||
      slot.rooms.has(gene.room) ||
      slot.batches.has(gene.batch)
    ) {
      // assign new random slot
      gene.day = randomDay();
      gene.slot = randomSlot();
    }

    slot.teachers.add(gene.faculty);
    slot.rooms.add(gene.room);
    slot.batches.add(gene.batch);
  }

  return chromosome;
}

function randomDay() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  return days[Math.floor(Math.random() * days.length)];
}

function randomSlot() {
  return Math.floor(Math.random() * 6) + 1;
}

module.exports = { repair };