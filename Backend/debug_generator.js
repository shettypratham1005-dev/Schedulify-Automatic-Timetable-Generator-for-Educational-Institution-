const mongoose = require('mongoose');
const Teacher = require('./models/teacher');
const Room = require('./models/room');
const Subject = require('./models/subject');
const Batch = require('./models/batch');
const config = require('./config/timetableConfig');

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const VALID_SLOTS = [0, 1, 3, 4, 5, 7, 8];
const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]];

// Mock conflict check from timetableRoutes.js
const hasConflict = (existing, day, slotIdx, duration, faculty, room, batchId, currentSubName, currentIsParallel) => {
    const slotsToOccupy = Array.from({ length: duration }, (_, i) => slotIdx + i);
    for (const e of existing) {
        if (e.day !== day) continue;
        const eSlots = Array.from({ length: e.duration || 1 }, (_, i) => e.slotIdx + i);
        if (slotsToOccupy.some(s => eSlots.includes(s))) {
            if (faculty && e.faculty && String(e.faculty._id || e.faculty) === String(faculty._id || faculty)) return true;
            if (room && e.room && String(e.room._id || e.room) === String(room._id || room)) return true;
            if (batchId && e.batchId) {
                if (batchId === e.batchId) {
                    if (currentIsParallel && (e.isParallel || e.subject?.isParallel) === currentIsParallel && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow parallel subjects
                    } else return true;
                }
                const yr1 = batchId.split("-")[0];
                const yr2 = e.batchId.split("-")[0];
                const isAll1 = batchId.endsWith("-ALL");
                const isAll2 = e.batchId.endsWith("-ALL");
                if (yr1 === yr2 && (isAll1 || isAll2)) {
                    if (currentIsParallel && (e.isParallel || e.subject?.isParallel) === currentIsParallel && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow
                    } else return true;
                }
            }
        }
    }
    return false;
};

async function run() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Timetable");
    console.log("🚀 Starting Debug Generator...");
    
    const sems = [4, 6, 8];
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    const dbSubs = {};
    for (const s of sems) {
        dbSubs[s] = {};
        (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
    }

    // SIMULATE ONE ATTEMPT
    let globalT = [];
    
    // scheduleParallelLabs logic
    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        const bList = bDB.filter(b => b.year === yr).map(b => b.name).sort();
        const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: tDB.find(t => t.name.toLowerCase() === (s.faculty || "").toLowerCase()),
            r: rDB.find(r => r.room_no === s.labRoom),
            allowedBatches: s.batches
        }));

        if (pList.length === 0) continue;

        if (sem === 8 && pList.some(p => p.name === "OCN Lab")) {
            const ocn = pList.find(p => p.name === "OCN Lab");
            console.log(`[DEBUG] Adding 4 separate OCN Lab tasks for BE...`);
            bList.forEach(batchName => {
                let placed = false;
                const shuffledDays = ["Monday", "Tuesday", "Wednesday"].sort(() => Math.random() - 0.5);
                const shuffledBlocks = [0, 3, 7].sort(() => Math.random() - 0.5); // Practical start slots

                dayLoop: for (const d of shuffledDays) {
                    if (globalT.some(e => e.day === d && e.semester === 8 && e.duration === 2)) continue;

                    for (const s of shuffledBlocks) {
                        if (!hasConflict(globalT, d, s, 2, ocn.f, ocn.r, `${yr}-${batchName}`, ocn.name, null)) {
                            globalT.push({ 
                                day: d, slotIdx: s, duration: 2, subject: ocn.sub, faculty: ocn.f, room: ocn.r, 
                                batch: batchName, batchId: `${yr}-${batchName}`, type: "Practical", semester: 8 
                            });
                            placed = true;
                            console.log(`[DEBUG] Placed OCN Lab - ${batchName} on ${d} at slot ${s}`);
                            break dayLoop;
                        }
                    }
                }
                if (!placed) console.log(`[DEBUG] FAILED to place OCN Lab - ${batchName}`);
            });
        }
        // ... other sems (skipping for brevity in debug)
    }

    // Build Universal Pool
    let universalPool = [];
    for (const s of sems) {
        const yr = config[s].className;
        config[s].subjects.forEach(sc => {
            if (sc.type === "Lecture" || sc.type === "Tutorial") {
                const sObj = dbSubs[s][sc.name.toLowerCase()];
                const fObj = tDB.find(t => t.name.toLowerCase() === sc.faculty.toLowerCase());
                const rPool = (config[s].lectureRooms || []).map(rn => rDB.find(ro => ro.room_no === rn)).filter(Boolean);
                for (let i = 0; i < (sc.lectures || 3); i++) {
                    universalPool.push({ sem: s, yr, batch: "ALL", batchId: `${yr}-ALL`, sub: sObj, faculty: fObj, rPool, type: sc.type, isParallel: sc.isParallel });
                }
            }
        });
    }
    console.log(`[DEBUG] universalPool Size: ${universalPool.length}`);
    const parallelItems = universalPool.filter(i => i.isParallel);
    console.log(`[DEBUG] Parallel Items count: ${parallelItems.length}`);
    parallelItems.forEach(i => console.log(`  - ${i.sub?.name} (${i.isParallel}) sem:${i.sem}`));

    const processed = new Set();
    const taskPool = [];
    for (const item of universalPool) {
        if (processed.has(item)) continue;
        if (item.isParallel) {
            const partner = universalPool.find(o => !processed.has(o) && o !== item && o.isParallel === item.isParallel && o.sem === item.sem);
            if (partner) {
                console.log(`[DEBUG] GROUPED: ${item.sub?.name} and ${partner.sub?.name}`);
                taskPool.push({ type: "Parallel", items: [item, partner] });
                processed.add(item); processed.add(partner);
                continue;
            } else {
                console.log(`[DEBUG] NO PARTNER for: ${item.sub?.name} (${item.isParallel})`);
            }
        }
        taskPool.push({ type: "Single", item });
        processed.add(item);
    }
    console.log(`[DEBUG] Task Pool Size: ${taskPool.length} (Parallel tasks: ${taskPool.filter(t => t.type === 'Parallel').length})`);

    // Try to place EM/PM
    const emPmTasks = taskPool.filter(t => t.type === "Parallel");
    for (const task of emPmTasks) {
        let placed = false;
        const [i1, i2] = task.items;
        for (const d of DAYS) {
            for (const s of VALID_SLOTS) {
                if (globalT.find(e => e.day === d && e.batchId === i1.batchId && s === e.slotIdx)) continue;
                const r1 = i1.rPool[0] || rDB[0];
                const r2 = i2.rPool[0] || rDB[1];
                if (!hasConflict(globalT, d, s, 1, i1.faculty, r1, i1.batchId, i1.sub?.name, i1.isParallel) &&
                    !hasConflict(globalT, d, s, 1, i2.faculty, r2, i2.batchId, i2.sub?.name, i2.isParallel)) {
                    console.log(`[DEBUG] SUCCESSFULLY paired ${i1.sub?.name} and ${i2.sub?.name} on ${d} at slot ${s}`);
                    placed = true; break;
                }
            }
            if (placed) break;
        }
    }

    await mongoose.disconnect();
}
run();
