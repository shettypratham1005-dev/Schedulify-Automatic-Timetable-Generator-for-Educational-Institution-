      const sample = require("../sample_data");
        
      // import fitness and operators
      const { crossover, mutate, initPopulation } = require("./operators");
      const { repair_temp } = require("./repair_temp");
      const { fitness, countHardViolations } = require("./fitness");
      const { formatTimetable_perm } = require("./formatTimetable_perm");

      let stagnation = 0;
      let bestScoreEver = -Infinity;

      async function  runGA(config = {}) {
        const popSize = config.popSize || 50;
        const gens = config.generations || 300;
        let pop = initPopulation(popSize, sample);

        let best = null;
        for (let gen=0; gen<gens; gen++) {
          // evaluate
          for (let c of pop) c.score = fitness(c, sample);
          pop.sort((a,b) => b.score - a.score);

      // ✅ STEP-14: Generation Logging
        if (gen % 20 === 0) {
          console.log(`Gen ${gen} | Best Score: ${pop[0].score}`);
        }

        if (!best || pop[0].score > best.score)
          best = JSON.parse(JSON.stringify(pop[0]));

      // Early stopping check
      if (pop[0].score > bestScoreEver) {
        bestScoreEver = pop[0].score;
        stagnation = 0;
      } else {
        stagnation++;
      }

      if (stagnation > 50) {
        console.log("Stopped early at generation:", gen);
        break;
      }
          if (!best || pop[0].score > best.score) best = JSON.parse(JSON.stringify(pop[0]));

        // selection + create new pop
      const newPop = [];

      // ✅ Elitism (clone best 2 safely)
      newPop.push(
        JSON.parse(JSON.stringify(pop[0])),
        JSON.parse(JSON.stringify(pop[1]))
      );

      const randomCount = Math.floor(popSize * 0.1);
      for (let i = 0; i < randomCount; i++) {
        newPop.push(initPopulation(1, sample)[0]);
      }
      // Adaptive mutation rate
      const mutationRate = 0.3 * (1 - gen / gens);

      // Tournament selection
      function tournamentSelect() {
        const size = 3;
        let best = null;
        for (let i = 0; i < size; i++) {
          const candidate = pop[Math.floor(Math.random() * pop.length)];
          if (!best || candidate.score > best.score) {
            best = candidate;
          }
        }
        return best;
      }

      while (newPop.length < popSize) {
        const p1 = tournamentSelect();
        const p2 = tournamentSelect();

        let child = crossover(p1, p2, sample);

        if (Math.random() < mutationRate) {
          child = mutate(child, sample);
        }

       child = repair_temp(child);
       newPop.push(child);
      }
          pop = newPop;
        }

       const formatted = formatTimetable_perm(best);

if (countHardViolations(best) === 0) {
    console.log("✅ Conflict-free timetable generated.");
} else {
    console.log("⚠ Warning: Best solution still has conflicts.");
}

return formatted;
}

 module.exports = { runGA };
