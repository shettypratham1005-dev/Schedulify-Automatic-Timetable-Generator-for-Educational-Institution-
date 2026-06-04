const mongoose = require("mongoose");
const Timetable = require("./models/timetable");
const Teacher = require("./models/teacher");
const Room = require("./models/room");
const Subject = require("./models/subject");
const Batch = require("./models/batch");
const config = require("./config/timetableConfig");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["08:15", "09:15", "10:15 (Break)", "10:30", "11:30", "12:30", "01:30 (Lunch)", "02:30", "03:30", "04:30"];
const VALID_SLOTS = [0, 1, 3, 4, 5, 7, 8]; 
const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]];

// Logic from updated timetableRoutes.js
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
                        // Allow
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

async function backfillVacantSlots(sem, globalT, teachersDB, roomsDB, dbSubs, semBatches) {
    const c = config[sem];
    const yr = c.className;
    const bList = semBatches.map(b => b.name);
    const getT = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
    const getR = (n) => roomsDB.find(r => r.room_no === n);
    const lectureSubs = c.subjects.filter(s => s.type === "Lecture" || s.type === "Tutorial");

    for (const d of DAYS) {
        for (const s of VALID_SLOTS) {
            const allFree = bList.every(b => !globalT.find(e => e.day === d && (e.batchId === `${yr}-${b}` || e.batchId === `${yr}-ALL`) && s >= e.slotIdx && s < e.slotIdx + (e.duration || 1)));
            if (allFree) {
                const bId = `${yr}-ALL`;
                let filled = false;
                for (const sc of lectureSubs) {
                    const sub = dbSubs[sem][sc.name.toLowerCase()];
                    const faculty = getT(sc.faculty);
                    const rPool = (c.lectureRooms || []).map(r => getR(r)).filter(Boolean);
                    for (const r of [...rPool, ...roomsDB]) {
                        if (!hasConflict(globalT, d, s, 1, faculty, r, bId, sub.name, null)) {
                            globalT.push({ day: d, slotIdx: s, duration: 1, subject: sub, faculty, room: r, batch: "ALL", batchId: bId, type: "Lecture", semester: sem });
                            filled = true; break;
                        }
                    }
                    if (filled) break;
                }
            } else {
                const isPracticalOngoing = bList.some(b => globalT.find(e => e.day === d && e.batchId === `${yr}-${b}` && e.type === "Practical" && s >= e.slotIdx && s < e.slotIdx + (e.duration || 1)));
                if (isPracticalOngoing) continue;
                for (const b of bList) {
                    const bId = `${yr}-${b}`;
                    if (globalT.find(e => e.day === d && (e.batchId === bId || e.batchId === `${yr}-ALL`) && s >= e.slotIdx && s < e.slotIdx + (e.duration || 1))) continue;
                    // ... (skipped for standalone simplicity)
                }
            }
        }
    }
}

async function run() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Timetable");
    console.log("🚀 Starting UPDATED Standalone Generator...");
    const sems = [4, 6, 8];
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    const dbSubs = {};
    for (const s of sems) {
        dbSubs[s] = {};
        (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
    }

    for (let attempt = 0; attempt < 500; attempt++) {
        let globalT = [];
        
        // Labs
        for (const sem of sems) {
            const c = config[sem];
            const yr = c.className;
            const bList = bDB.filter(b => b.year === yr).map(b => b.name).sort();
            const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
                name: s.name,
                sub: dbSubs[sem][s.name.toLowerCase()],
                f: tDB.find(t => t.name.toLowerCase() === (s.faculty || "").toLowerCase()),
                r: rDB.find(r => r.room_no === s.labRoom)
            }));

            if (sem === 8) {
                const ocn = pList.find(p => p.name === "OCN Lab");
                bList.forEach(batchName => {
                    const shuffledDays = ["Monday", "Tuesday", "Wednesday"].sort(() => Math.random() - 0.5);
                    for (const d of shuffledDays) {
                        const shuffledBlocks = [0, 3, 7].sort(() => Math.random() - 0.5);
                        for (const s of shuffledBlocks) {
                            if (!hasConflict(globalT, d, s, 2, ocn.f, ocn.r, `${yr}-${batchName}`, ocn.name, null)) {
                                globalT.push({ day: d, slotIdx: s, duration: 2, subject: ocn.sub, faculty: ocn.f, room: ocn.r, batch: batchName, batchId: `${yr}-${batchName}`, type: "Practical", semester: 8 });
                                break;
                            }
                        }
                    }
                });
            } else {
                // SE/TE Parallel Labs
                for (let i = 0; i < 4; i++) {
                    const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
                    for (const d of shuffledDays) {
                        const shuffledBlocks = [...PRACTICAL_BLOCKS].sort(() => Math.random() - 0.5);
                        for (const blk of shuffledBlocks) {
                            let can = true;
                            bList.forEach((b, j) => {
                                const p = pList[(j + i) % pList.length];
                                if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${yr}-${b}`, p.name, null)) can = false;
                            });
                            if (can) {
                                bList.forEach((b, j) => {
                                    const p = pList[(j + i) % pList.length];
                                    globalT.push({ day: d, slotIdx: blk[0], duration: 2, subject: p.sub, faculty: p.f, room: p.r, batch: b, batchId: `${yr}-${b}`, type: "Practical", semester: sem });
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Build Lectures Pool
        let universalPool = [];
        for (const s of sems) {
            const yr = config[s].className;
            config[s].subjects.filter(sc => sc.type === "Lecture" || sc.type === "Tutorial").forEach(sc => {
                const sObj = dbSubs[s][sc.name.toLowerCase()];
                const fObj = tDB.find(t => t.name.toLowerCase() === sc.faculty.toLowerCase());
                const rPool = (config[s].lectureRooms || []).map(rn => rDB.find(ro => ro.room_no === rn)).filter(Boolean);
                for (let i = 0; i < (sc.lectures || 3); i++) {
                    universalPool.push({ sem: s, yr, batchId: `${yr}-ALL`, sub: sObj, faculty: fObj, rPool, type: sc.type, isParallel: sc.isParallel });
                }
            });
        }

        // Group Parallel Tasks
        const taskPool = [];
        const parallelGroups = new Map();
        const singles = [];
        universalPool.forEach(item => {
            if (item.isParallel) {
                const key = `${item.sem}-${item.isParallel}`;
                if (!parallelGroups.has(key)) parallelGroups.set(key, []);
                parallelGroups.get(key).push(item);
            } else singles.push(item);
        });
        for (const [key, items] of parallelGroups) {
            while (items.length >= 2) {
                const i1 = items.shift();
                const partnerIdx = items.findIndex(o => (o.sub?.name || o.sub?._id) !== (i1.sub?.name || i1.sub?._id));
                if (partnerIdx !== -1) taskPool.push({ type: "Parallel", items: [i1, items.splice(partnerIdx, 1)[0]] });
                else singles.push(i1);
            }
            items.forEach(i => singles.push(i));
        }
        singles.forEach(item => taskPool.push({ type: "Single", item }));

        // Place Tasks
        let allPlaced = true;
        const workload = {};
        for (const task of taskPool) {
            let placed = false;
            const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
            const shuffledSlots = [...VALID_SLOTS].sort(() => Math.random() - 0.5);
            slotSearch: for (const d of shuffledDays) {
                for (const s of shuffledSlots) {
                    if (task.type === "Single") {
                        const i = task.item;
                        if (globalT.find(e => e.day === d && e.batchId === i.batchId && s === e.slotIdx)) continue;
                        const r = i.rPool[0] || rDB[0];
                        if (!hasConflict(globalT, d, s, 1, i.faculty, r, i.batchId, i.sub?.name, i.isParallel)) {
                            globalT.push({ day: d, slotIdx: s, duration: 1, subject: i.sub, faculty: i.faculty, room: r, batchId: i.batchId, type: i.type, semester: i.sem, isParallel: i.isParallel });
                            placed = true; break slotSearch;
                        }
                    } else {
                        const [i1, i2] = task.items;
                        if (globalT.find(e => e.day === d && e.batchId === i1.batchId && s === e.slotIdx)) continue;
                        const r1 = i1.rPool[0] || rDB[0];
                        const r2 = i1.rPool[1] || rDB[1];
                        if (!hasConflict(globalT, d, s, 1, i1.faculty, r1, i1.batchId, i1.sub?.name, i1.isParallel) &&
                            !hasConflict(globalT, d, s, 1, i2.faculty, r2, i2.batchId, i2.sub?.name, i2.isParallel)) {
                            globalT.push({ day: d, slotIdx: s, duration: 1, subject: i1.sub, faculty: i1.faculty, room: r1, batchId: i1.batchId, type: i1.type, semester: i1.sem, isParallel: i1.isParallel });
                            globalT.push({ day: d, slotIdx: s, duration: 1, subject: i2.sub, faculty: i2.faculty, room: r2, batchId: i2.batchId, type: i2.type, semester: i2.sem, isParallel: i2.isParallel });
                            placed = true; break slotSearch;
                        }
                    }
                }
            }
            if (!placed) { allPlaced = false; break; }
        }

        if (allPlaced) {
            const docs = globalT.map(e => ({
                day: e.day, startTime: TIMES[e.slotIdx], endTime: TIMES[e.slotIdx + (e.duration || 1)],
                subject: e.subject?._id || null, 
                subjectLabel: e.subjectLabel || e.subject?.name || null,
                faculty: e.faculty?._id || null,
                facultyLabel: e.facultyLabel || e.faculty?.name || null,
                room: e.room?._id || null,
                roomLabel: e.roomLabel || e.room?.room_no || null,
                className: e.batchId.split("-")[0], 
                semester: e.semester, 
                type: e.type, 
                batch: e.batch || "ALL", 
                isParallel: e.isParallel
            }));
            await Timetable.deleteMany({ semester: { $in: sems } });
            await Timetable.insertMany(docs);
            console.log("🎉 SUCCESS! Generated with EM/PM Parallelism.");
            process.exit(0);
        }
    }
    process.exit(1);
}
run();
