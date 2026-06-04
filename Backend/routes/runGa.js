// backend/routes/runGa.js
const express = require("express");
const router = express.Router();
const subjectLoads = require("../config");

// timetable structure
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const SLOTS = [
"08:15-09:15",
"09:15-10:15",
"10:15-11:15",
"11:30-12:30",
"12:30-01:30",
"02:30-03:30",
"03:30-04:30"
];

const Timetable = require("../models/timetable");
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Room = require("../models/room");
const Batch = require("../models/batch");

// GA imports
const { initPopulation, crossover, mutate, repairChromosome } = require("../ga/operators");
const { evaluate } = require("../ga/fitness");

const POP_SIZE = 20;
const GENERATIONS = 50;
const MUTATION_RATE = 0.08;
const ELITE_COUNT = 2; // STEP 6: number of best chromosomes preserved

router.post("/run-ga", async (req, res) => {
  console.log("GA API CALLED");
  try {
/* -------------------- 1. Use subject loads from config -------------------- */
if (!subjectLoads || Object.keys(subjectLoads).length === 0) {
  return res.status(400).json({
    error: "Subject loads not defined in config.js",
  });
}

    /* -------------------- 2. Load DB data -------------------- */
    const [teachers, subjects, rooms, batches] = await Promise.all([
      Teacher.find().lean(),
      Subject.find().lean(),
      Room.find().lean(),
      Batch.find().lean(),
    ]);
    
    console.log("Teachers:", teachers.length);
    console.log("Subjects:", subjects.length);
    console.log("Rooms:", rooms.length);
    console.log("Batches:", batches.length);

    console.log(
  "Subjects from DB:",
  subjects.map(s => ({
    id: s._id,
    name: s.name,
    code: s.code,
    shortName: s.shortName,
    title: s.title
  }))
);

    if (![teachers, subjects, rooms, batches].every((arr) => arr.length)) {
      return res.status(400).json({
        error: "Database missing required data",
      });
    }

    /* -------------------- 3. Initialize population -------------------- */
    let population = initPopulation(POP_SIZE, {
      subjects,
      teachers,
      rooms,
      batches,
      subjectLoads,
    });

    if (!population || !population.length) {
      return res.status(500).json({
        error: "Failed to initialize population",
      });
    }

    let bestSolution = null;

    console.log("Sample chromosome:", population[0]?.slice(0, 10));

    /* -------------------- 4. GA Loop -------------------- */
    for (let gen = 0; gen < GENERATIONS; gen++) {
      const evaluated = population.map((chromo) => {
        const result = evaluate(chromo, {
          teachers,
          rooms,
          batches,
          subjectLoads,
        });
        return { chromo, ...result };
      });

      evaluated.sort((a, b) => b.fitness - a.fitness);

      if (!bestSolution || evaluated[0].fitness > bestSolution.fitness) {
        bestSolution = evaluated[0];
      }

      console.log(
        `Gen ${gen + 1} | Fitness: ${evaluated[0].fitness} | Penalties: ${evaluated[0].penalties}`
      );

      // STEP 6 — Elite Selection
      const elites = evaluated
     .slice(0, ELITE_COUNT)
     .map((e) => e.chromo);

    // Start next generation with elites
      const nextPopulation = [...elites];

      const tournament = () => {
        const picks = Array.from({ length: 3 }, () =>
          population[Math.floor(Math.random() * population.length)]
        );

        return picks
          .map((c) => ({
            chromo: c,
            fitness: evaluate(c, {
              teachers,
              rooms,
              batches,
              subjectLoads,
            }).fitness,
          }))
          .sort((a, b) => b.fitness - a.fitness)[0].chromo;
      };

      while (nextPopulation.length < POP_SIZE) {
        const p1 = tournament();
        const p2 = tournament();
        let child = crossover(p1, p2);
        child = mutate(child, rooms, teachers, MUTATION_RATE);

      // Repair conflicts
        child = repairChromosome(child, rooms, teachers, batches);
        nextPopulation.push(child);
      }

      population = nextPopulation;
    }

    /* -------------------- 5. Validate result -------------------- */
    if (!bestSolution || !bestSolution.chromo?.length) {
      return res.status(500).json({
        error: "GA failed to produce timetable",
      });
    }

    const bestChromosome = bestSolution.chromo;
    console.log("Sample chromosome entry:", bestChromosome[0]);

    /* -------------------- 6. Save timetable -------------------- */
    await Timetable.deleteMany({});

   const timetableDocs = bestChromosome
  .filter(
    (entry) =>
      entry &&
      entry.subject &&
      entry.teacher &&
      entry.room &&
      entry.batch &&
      (entry.subject._id || entry.subject) &&
      (entry.teacher._id || entry.teacher) &&
      (entry.room._id || entry.room) &&
      (entry.batch._id || entry.batch)
  )
  .map((entry) => {
    const normalizedType =
      entry.type === "lecture"
        ? "Lecture"
        : entry.type === "tutorial"
        ? "Tutorial"
        : "Practical";

    return {
  className: entry.className || entry.batch?.year || "TE",
  batch: entry.batch?._id || entry.batch,
  subject: entry.subject?._id || entry.subject,
  faculty: entry.teacher?._id || entry.teacher,
  room: entry.room?._id || entry.room,
  day: entry.day,
  time: entry.slot,
  type: normalizedType,
  };
  });

    await Timetable.insertMany(timetableDocs);

    /* -------------------- 7. Response -------------------- */
    return res.status(200).json({
      success: true,
      message: "GA completed and timetable saved",
      fitness: bestSolution.fitness,
      penalties: bestSolution.penalties,
      totalEntries: timetableDocs.length,
      timetable: timetableDocs,
    });
  } catch (error) {
    console.error("GA Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

module.exports = router;