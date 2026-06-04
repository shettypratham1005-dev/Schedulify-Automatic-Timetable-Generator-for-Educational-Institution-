const mongoose = require("mongoose");
const Timetable = require("./models/timetable");
const Teacher = require("./models/teacher");
const Room = require("./models/room");
const Subject = require("./models/subject");
const Batch = require("./models/batch");
const config = require("./config/timetableConfig");
const fs = require('fs');

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["08:15", "09:15", "10:15 (Break)", "10:30", "11:30", "12:30", "01:30 (Lunch)", "02:30", "03:30", "04:30"];
const VALID_SLOTS = [0, 1, 3, 4, 5, 7, 8]; 
const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]];

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
                    const sub1Par = currentIsParallel;
                    const sub2Par = e.isParallel || e.subject?.isParallel;
                    if (sub1Par && sub2Par && sub1Par === sub2Par && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow
                    } else return true;
                }
                const yr1 = batchId.split("-")[0];
                const yr2 = e.batchId.split("-")[0];
                const isAll1 = batchId.endsWith("-ALL");
                const isAll2 = e.batchId.endsWith("-ALL");
                if (yr1 === yr2 && (isAll1 || isAll2)) {
                    const sub1Par = currentIsParallel;
                    const sub2Par = e.isParallel || e.subject?.isParallel;
                    if (sub1Par && sub2Par && sub1Par === sub2Par && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow
                    } else return true;
                }
            }
        }
    }
    return false;
};

function prebookReserved(sems, globalT, dbSubs) {
    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        if (!c.reserved) continue;
        c.reserved.forEach(res => {
            const sub = dbSubs[sem][res.name.toLowerCase()];
            if (res.duration === "FullDay") {
                VALID_SLOTS.forEach(s => {
                    globalT.push({ day: res.day, slotIdx: s, duration: 1, subject: sub, type: "Project", batchId: `${yr}-ALL`, isReserved: true, semester: sem });
                });
            } else if (res.duration === "Remaining" && res.day === "Thursday" && sem === 8) {
                [3, 4, 5, 7, 8].forEach(s => {
                    globalT.push({ day: res.day, slotIdx: s, duration: 1, subject: sub, type: "Project", batchId: `${yr}-ALL`, isReserved: true, semester: sem });
                });
            } else if (res.typeConstraint === "FirstSlot") {
                globalT.push({ day: res.day, slotIdx: 0, duration: 1, subject: sub, type: "Project", batchId: `${yr}-ALL`, isReserved: true, semester: sem });
            }
        });
    }
}

function scheduleParallelLabs(sems, globalT, teachersDB, roomsDB, dbSubs, allBatches) {
    const getT = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
    const getR = (n) => roomsDB.find(r => r.room_no === n);

    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        const bList = allBatches.filter(b => b.year === yr).map(b => b.name).sort();
        const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: getT(s.faculty),
            r: getR(s.labRoom)
        }));
        if (pList.length === 0) continue;

        if (sem === 8) {
            const ocn = pList.find(p => p.name === "OCN Lab");
            for (const bn of bList) {
                let placed = false;
                const shuffledDays = ["Monday", "Tuesday", "Wednesday"].sort(() => Math.random() - 0.5);
                dayLoop: for (const d of shuffledDays) {
                    const shuffledBlocks = [0, 3, 7].sort(() => Math.random() - 0.5);
                    for (const s of shuffledBlocks) {
                        if (!hasConflict(globalT, d, s, 2, ocn.f, ocn.r, `${yr}-${bn}`)) {
                            globalT.push({ day: d, slotIdx: s, duration: 2, subject: ocn.sub, faculty: ocn.f, room: ocn.r, batch: bn, batchId: `${yr}-${bn}`, type: "Practical", semester: 8 });
                            placed = true; break dayLoop;
                        }
                    }
                }
                if (!placed) return false;
            }
        } else {
            // SE/TE Parallel
            for (let i = 0; i < 4; i++) {
                let placed = false;
                const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
                dayLoop: for (const d of shuffledDays) {
                    const shuffledBlocks = [...PRACTICAL_BLOCKS].sort(() => Math.random() - 0.5);
                    for (const blk of shuffledBlocks) {
                        let can = true;
                        for (let j = 0; j < bList.length; j++) {
                            const p = pList[(j + i) % pList.length];
                            if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${yr}-${bList[j]}`)) { can = false; break; }
                        }
                        if (can) {
                            bList.forEach((b, j) => {
                                const p = pList[(j + i) % pList.length];
                                globalT.push({ day: d, slotIdx: blk[0], duration: 2, subject: p.sub, faculty: p.f, room: p.r, batch: b, batchId: `${yr}-${b}`, type: "Practical", semester: sem });
                            });
                            placed = true; break dayLoop;
                        }
                    }
                }
                if (!placed) return false;
            }
        }
    }
    return true;
}

async function backfillVacantSlots(sem, globalT, teachersDB, roomsDB, dbSubs, semBatches) { } // Keep empty for diagnostic run

async function run() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Timetable");
    const sems = [4, 6, 8];
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    const dbSubs = {};
    for (const s of sems) { dbSubs[s] = {}; (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su); }

    for (let attempt = 0; attempt < 500; attempt++) {
        let globalT = [];
        prebookReserved(sems, globalT, dbSubs);
        if (!scheduleParallelLabs(sems, globalT, tDB, rDB, dbSubs, bDB)) continue;

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

        const theoreticalWorkload = {};
        universalPool.forEach(item => { if (item.faculty) theoreticalWorkload[String(item.faculty._id)] = (theoreticalWorkload[String(item.faculty._id)] || 0) + 1; });
        universalPool.sort((a, b) => (theoreticalWorkload[String(b.faculty?._id)] || 0) - (theoreticalWorkload[String(a.faculty?._id)] || 0) || Math.random() - 0.5);

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
                        if (globalT.find(e => e.day === d && (e.batchId === i.batchId || e.batchId === `${i.yr}-ALL`) && s === e.slotIdx)) continue;
                        const rr = [...i.rPool, ...rDB].filter((v, idx, a) => a.indexOf(v) === idx);
                        for (const r of rr) {
                            if (!hasConflict(globalT, d, s, 1, i.faculty, r, i.batchId, i.sub?.name, i.isParallel)) {
                                globalT.push({ day: d, slotIdx: s, duration: 1, subject: i.sub, faculty: i.faculty, room: r, batchId: i.batchId, type: i.type, semester: i.sem, isParallel: i.isParallel });
                                placed = true; break slotSearch;
                            }
                        }
                    } else {
                        const [i1, i2] = task.items;
                        if (globalT.find(e => e.day === d && (e.batchId === i1.batchId || e.batchId === `${i1.yr}-ALL`) && s === e.slotIdx)) continue;
                        const rooms1 = [...i1.rPool, ...rDB].filter((v, idx, a) => a.indexOf(v) === idx);
                        const rooms2 = [...i2.rPool, ...rDB].filter((v, idx, a) => a.indexOf(v) === idx);
                        for (const r1 of rooms1) {
                            if (hasConflict(globalT, d, s, 1, i1.faculty, r1, i1.batchId, i1.sub?.name, i1.isParallel)) continue;
                            for (const r2 of rooms2) {
                                if (String(r1._id) === String(r2._id)) continue;
                                if (hasConflict(globalT, d, s, 1, i2.faculty, r2, i2.batchId, i2.sub?.name, i2.isParallel)) continue;
                                globalT.push({ day: d, slotIdx: s, duration: 1, subject: i1.sub, faculty: i1.faculty, room: r1, batchId: i1.batchId, type: i1.type, semester: i1.sem, isParallel: i1.isParallel });
                                globalT.push({ day: d, slotIdx: s, duration: 1, subject: i2.sub, faculty: i2.faculty, room: r2, batchId: i2.batchId, type: i2.type, semester: i2.sem, isParallel: i2.isParallel });
                                placed = true; break slotSearch;
                            }
                        }
                    }
                }
            }
            if (!placed) {
                console.log(`[ATTEMPT ${attempt}] ❌ Failed to place: ${task.type === "Single" ? task.item.sub?.name : task.items.map(i => i.sub?.name).join(' & ')} for ${task.type === "Single" ? task.item.yr : task.items[0].yr}`);
                allPlaced = false; break;
            }
        }
        if (allPlaced) { console.log("🎉 SUCCESS!"); process.exit(0); }
    }
    console.log("❌ Exhausted attempts.");
    process.exit(1);
}
run();
