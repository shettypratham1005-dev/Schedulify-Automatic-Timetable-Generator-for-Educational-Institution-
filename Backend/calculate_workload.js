const config = require("./config/timetableConfig");

const sems = [4, 6, 8];
const workload = {};

for (const sem of sems) {
    const yr = config[sem].className;
    const batches = 3; // SE-A,B,C etc. Let's assume 3 batches per year
    
    config[sem].subjects.forEach(s => {
        if (s.faculty === "ANY") return;
        const name = s.faculty;
        if (!workload[name]) workload[name] = 0;
        
        if (s.type === "Practical") {
            // Labs are per batch
            workload[name] += (s.lectures || 2) * batches;
        } else {
            // Lectures are per year (one lecture for A+B+C)
            // Wait, is it one lecture for the whole year? 
            // Often "SE" means the whole year sits together for lectures.
            // But batches might have different labs.
            workload[name] += (s.lectures || 3);
        }
    });
}

console.log("EXPECTED WORKLOAD PER FACULTY (4, 6, 8):");
console.log(workload);
