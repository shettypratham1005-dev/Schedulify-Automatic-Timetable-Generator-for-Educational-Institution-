📘 Schedulify: Genetic Algorithm Design Notes

1. Chromosome Structure:
   Each timetable = Array of sessions
   Each session = { day, slot(time), batch, subject, teacher, room, type }

2. Hard Constraints:
   - No teacher clash
   - No room clash
   - No batch overlap
   - Max 3 lectures/week per teacher
   - Correct room type for each subject
   - Each subject should meet required lecture/lab count

3. Soft Constraints:
   - Avoid consecutive lectures
   - Evenly distribute subjects
   - Prefer tutorials on fixed days

4. Fitness Function Logic:
   Fitness = 100
   Penalties for clashes or violations (-10 or -20 each)
   Higher fitness = better timetable

5. Pseudocode:
   1. Initialize population of random timetables
   2. Evaluate fitness for each
   3. Select top schedules
   4. Perform crossover (mix sessions)
   5. Apply mutation (swap random sessions)
   6. Repeat for N generations
   7. Output best timetable
