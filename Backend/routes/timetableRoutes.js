const express = require("express");
const router = express.Router();
const Timetable = require("../models/timetable");
const Teacher = require("../models/teacher");
const Room = require("../models/room");
const Subject = require("../models/subject");
const Batch = require("../models/batch");
const auth = require("../middleware/auth");
const config = require("../config/timetableConfig");
const fs = require("fs");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["08:15", "09:15", "10:15", "10:30", "11:30", "12:30", "01:30", "02:30", "03:30", "04:30"];
const VALID_SLOTS = [0, 1, 3, 4, 5, 7, 8]; // 7 working slots per day (35 total)
const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]]; // Allowed 2-hour segments

const hasConflict = (existing, day, slotIdx, duration, faculty, room, batchId, currentSubName, currentIsParallel) => {
    const slotsToOccupy = Array.from({ length: duration }, (_, i) => slotIdx + i);

    for (const e of existing) {
        if (e.day !== day) continue;
        const eSlots = Array.from({ length: e.duration || 1 }, (_, i) => e.slotIdx + i);

        // Conflict exists if any slot being requested is already occupied by e
        if (slotsToOccupy.some(s => eSlots.includes(s))) {
            // Teacher Conflict
            if (faculty && e.faculty && String(e.faculty._id || e.faculty) === String(faculty._id || faculty)) return true;
            
            // Room Conflict
            if (room && e.room && String(e.room._id || e.room) === String(room._id || room)) return true;
            
            // Batch/Class Conflict
            if (batchId && e.batchId) {
                if (batchId === e.batchId) {
                    // EXCEPTION: Allow overlap if both are parallel subjects (Electives)
                    const sub1Par = currentIsParallel;
                    const sub2Par = e.isParallel || e.subject?.isParallel;
                    if (sub1Par && sub2Par && sub1Par === sub2Par && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow
                    } else {
                        return true;
                    }
                }
                
                const yr1 = batchId.split("-")[0];
                const yr2 = e.batchId.split("-")[0];
                const isAll1 = batchId.endsWith("-ALL");
                const isAll2 = e.batchId.endsWith("-ALL");
                
                if (yr1 === yr2 && (isAll1 || isAll2)) {
                    // EXCEPTION: Allow BE-ALL overlap for EM and PM
                    const sub1Par = currentIsParallel;
                    const sub2Par = e.isParallel || e.subject?.isParallel;
                    if (sub1Par && sub2Par && sub1Par === sub2Par && currentSubName !== (e.subjectLabel || e.subject?.name)) {
                        // Allow
                    } else {
                        return true;
                    }
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
            const commonFields = { 
                day: res.day, 
                subject: sub, 
                subjectLabel: res.name, // Guarantee name display
                type: "Project", 
                batchId: `${yr}-ALL`, 
                isReserved: true,
                semester: sem,
                roomLabel: res.room, 
                facultyLabel: res.faculty 
            };

            if (res.duration === "FullDay") {
                globalT.push({ ...commonFields, slotIdx: 0, duration: 2 });
                globalT.push({ ...commonFields, slotIdx: 3, duration: 3 });
                globalT.push({ ...commonFields, slotIdx: 7, duration: 2 });
            } else if (res.duration === "Remaining" && res.day === "Thursday" && sem === 8) {
                globalT.push({ ...commonFields, slotIdx: 1, duration: 1 });
                globalT.push({ ...commonFields, slotIdx: 3, duration: 3 });
                globalT.push({ ...commonFields, slotIdx: 7, duration: 2 });
            } else if (res.typeConstraint === "FirstSlot") {
                globalT.push({ ...commonFields, slotIdx: 0, duration: 1 });
            }
        });
    }
}

function scheduleParallelLabs(sems, globalT, teachersDB, roomsDB, dbSubs, allBatches) {
    const getT = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
    const getR = (n) => roomsDB.find(r => r.room_no === n);

    const labPool = [];
    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        const bList = allBatches.filter(b => b.year === yr).map(b => b.name).sort();
        const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: getT(s.faculty),
            r: getR(s.labRoom),
            allowedBatches: s.batches // For specific exclusions like OCN Batch D
        }));

        pList.forEach(p => {
            if (!p.sub) console.warn(`⚠️ Subject NOT FOUND for lab: ${p.name}`);
            if (!p.f) console.warn(`⚠️ Faculty NOT FOUND for lab: ${p.name}`);
            if (!p.r) console.warn(`⚠️ Room NOT FOUND for lab: ${p.name}`);
        });

        if (pList.length === 0) continue;

        const blocksNeeded = sem === 8 ? 1 : 4;
        for (let i = 0; i < blocksNeeded; i++) {
            labPool.push({ sem, yr, bList, pList, blockIdx: i });
        }
    }

    console.log(`[GENERATOR] Lab Pool Size: ${labPool.length}`);
    labPool.sort(() => Math.random() - 0.5);

    for (const item of labPool) {
        let placed = false;
        const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
        const shuffledBlocks = [...PRACTICAL_BLOCKS].sort(() => Math.random() - 0.5);

        outer: for (const d of shuffledDays) {
            // New Constraint: Max 1 practical per batch/year per day
            const yearHasLabToday = globalT.some(e => e.day === d && e.semester === item.sem && e.duration === 2 && !e.isReserved);
            if (yearHasLabToday) continue;

            for (const blk of shuffledBlocks) {
                let can = true;
                for (let i = 0; i < item.bList.length; i++) {
                    const bName = item.bList[i];
                    const p = item.pList[(i + item.blockIdx) % item.pList.length];
                    
                    // Skip if batch is excluded from this practical
                    const checkStr = bName.startsWith("Batch") ? bName : `Batch ${bName}`;
                    if (p.allowedBatches && !p.allowedBatches.includes(checkStr)) continue;

                    if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${item.yr}-${bName}`)) { can = false; break; }
                }

                if (can) {
                    item.bList.forEach((b, i) => {
                        const p = item.pList[(i + item.blockIdx) % item.pList.length];
                        
                        // Exclusion check again
                        const bCheck = b.startsWith("Batch") ? b : `Batch ${b}`;
                        if (p.allowedBatches && !p.allowedBatches.includes(bCheck)) return;

                        globalT.push({ 
                            day: d, slotIdx: blk[0], duration: 2, 
                            subject: p.sub, faculty: p.f, room: p.r, 
                            batch: b, batchId: `${item.yr}-${b}`, type: "Practical", semester: item.sem 
                        });
                    });
                    placed = true;
                    break outer;
                }
            }
        }
        if (!placed) {
            console.log(`[GENERATOR] ❌ Failed to place lab block for ${item.yr} (Block ${item.blockIdx})`);
            return false;
        }
    }
    return true;
}

async function backfillVacantSlots(sem, globalT, teachersDB, roomsDB, dbSubs, semBatches) {
    const c = config[sem];
    const yr = c.className;
    const bList = semBatches.map(b => b.name);
    const getT = (n) => teachersDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
    const getR = (n) => roomsDB.find(r => r.room_no === n);

    const lectureSubs = c.subjects.filter(s => s.type === "Lecture" || s.type === "Tutorial");

    for (const d of DAYS) {
        for (const s of VALID_SLOTS) {
            // Priority: Collective (Year-Wide) backfill if all batches are free
            const allFree = bList.every(b => !globalT.find(e => e.day === d && (e.batchId === `${yr}-${b}` || e.batchId === `${yr}-ALL`) && s >= e.slotIdx && s < e.slotIdx + (e.duration || 1)));

            if (allFree) {
                const bId = `${yr}-ALL`;
                let filled = false;
                const shuffledSubs = [...lectureSubs].sort(() => Math.random() - 0.5);

                for (const sc of shuffledSubs) {
                    const sub = dbSubs[sem][sc.name.toLowerCase()];
                    const faculty = getT(sc.faculty);
                    let rPool = (c.lectureRooms || []).map(r => getR(r)).filter(Boolean);
                    const allRooms = [...rPool, ...roomsDB].filter((v, idx, a) => a.indexOf(v) === idx);

                    for (const r of allRooms) {
                        if (!hasConflict(globalT, d, s, 1, faculty, r, bId, sub.name, null)) {
                            globalT.push({
                                day: d, slotIdx: s, duration: 1,
                                subject: sub, faculty, room: r,
                                batch: "ALL", batchId: bId, type: "Lecture",
                                semester: sem, isBackfill: true
                            });
                            filled = true; break;
                        }
                    }
                    if (filled) break;
                }
                
                if (!filled) {
                    const firstRoom = (config[sem].lectureRooms || []).map(r => getR(r)).filter(Boolean)[0] || roomsDB[0];
                    globalT.push({
                        day: d, slotIdx: s, duration: 1,
                        subjectLabel: "Library / Self-Study", 
                        facultyLabel: "N/A",
                        room: firstRoom, batch: "ALL", batchId: bId, type: "Lecture",
                        semester: sem, isBackfill: true
                    });
                }
            } else {
                // Individual backfill for remaining free batches
                for (const b of bList) {
                    const bId = `${yr}-${b}`;
                    if (globalT.find(e => e.day === d && (e.batchId === bId || e.batchId === `${yr}-ALL`) && s >= e.slotIdx && s < e.slotIdx + (e.duration || 1))) continue;

                    let filled = false;
                    const shuffledSubs = [...lectureSubs].sort(() => Math.random() - 0.5);
                    for (const sc of shuffledSubs) {
                        const sub = dbSubs[sem][sc.name.toLowerCase()];
                        const faculty = getT(sc.faculty);
                        let rPool = (c.lectureRooms || []).map(r => getR(r)).filter(Boolean);
                        const allRooms = [...rPool, ...roomsDB].filter((v, idx, a) => a.indexOf(v) === idx);
                        for (const r of allRooms) {
                            if (!hasConflict(globalT, d, s, 1, faculty, r, bId, sub.name, null)) {
                                globalT.push({
                                    day: d, slotIdx: s, duration: 1,
                                    subject: sub, faculty, room: r,
                                    batch: b, batchId: bId, type: "Lecture",
                                    semester: sem, isBackfill: true
                                });
                                filled = true; break;
                            }
                        }
                        if (filled) break;
                    }
                }
            }
        }
    }
}

router.post("/auto-generate-even", auth, async (req, res) => {
    try {
        console.log("🚀 Starting Production-Grade Even-Semester Generator...");
        const sems = [4, 6, 8];
        const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
        const dbSubs = {};
        for (const s of sems) {
            dbSubs[s] = {};
            (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
        }

        for (let attempt = 0; attempt < 1000; attempt++) {
            let globalT = [];
            prebookReserved(sems, globalT, dbSubs);
            if (!scheduleParallelLabs(sems, globalT, tDB, rDB, dbSubs, bDB)) continue;

            let universalPool = [];
            for (const s of sems) {
                const yr = config[s].className;
                config[s].subjects.filter(sc => sc.type === "Lecture" || sc.type === "Tutorial").forEach(sc => {
                    const sObj = dbSubs[s][sc.name.toLowerCase()];
                    const fObj = tDB.find(t => t.name.toLowerCase() === (sc.faculty || "").toLowerCase());
                    const rPool = (config[s].lectureRooms || []).map(rn => rDB.find(ro => ro.room_no === rn)).filter(Boolean);
                    for (let i = 0; i < (sc.lectures || 3); i++) {
                        universalPool.push({
                            sem: s, yr, batchId: `${yr}-ALL`, sub: sObj, faculty: fObj, rPool, type: sc.type, isParallel: sc.isParallel 
                        });
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
                            if (s === 9 && i.sem !== 6) continue; // Restrict slot 9 to TE only
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
                            if (s === 9 && i1.sem !== 6) continue; // Restrict slot 9 to TE only
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
                if (!placed) { allPlaced = false; break; }
            }

            if (allPlaced) {
                // Backfill
                for (const sem of sems) {
                    const yr = config[sem].className;
                    const semBatches = bDB.filter(b => b.year === yr);
                    await backfillVacantSlots(sem, globalT, tDB, rDB, dbSubs, semBatches);
                }

                const docs = globalT.map(e => ({
                    day: e.day,
                    startTime: TIMES[e.slotIdx],
                    endTime: TIMES[e.slotIdx + (e.duration || 1)],
                    subject: e.subject?._id || null,
                    subjectLabel: e.subjectLabel || e.subject?.name || null,
                    faculty: e.faculty?._id || null,
                    facultyLabel: e.facultyLabel || e.faculty?.name || null,
                    room: e.room?._id || null,
                    roomLabel: e.roomLabel || e.room?.room_no || null,
                    className: e.batchId.split("-")[0],
                    semester: e.semester,
                    type: e.type,
                    batch: (e.type === "Lecture" && !e.batch) ? "ALL" : (e.batch || "ALL"),
                    isParallel: e.isParallel
                }));

                await Timetable.deleteMany({ semester: { $in: sems } });
                await Timetable.insertMany(docs);
                console.log("🎉 SUCCESS! Generated " + docs.length + " entries.");
                return res.status(200).json({ message: "Success", count: docs.length });
            }
        }
        res.status(400).json({ message: "Failed to generate conflict-free timetable. Try checking teacher/room capacity." });
    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const [teachers, rooms, subjects, batches, entries] = await Promise.all([
      Teacher.find({}),
      Room.find({}),
      Subject.find({}),
      Batch.find({}),
      Timetable.find({})
    ]);

    // 1. Completion Metrics (Year-wise)
    const yearStats = { SE: {}, TE: {}, BE: {} };
    ["SE", "TE", "BE"].forEach(yr => {
      const yrEntries = entries.filter(e => e.className === yr);
      const uniqueSlots = new Set(yrEntries.map(e => `${e.day}-${e.startTime}`));
      const percent = Math.min(100, Math.round((uniqueSlots.size / 35) * 100));
      
      let statusLabel = "Ready to Sync";
      let statusColor = "grey";
      
      if (percent > 0 && percent < 100) {
        statusLabel = "In Progress";
        statusColor = "amber";
      } else if (percent === 100) {
        statusLabel = "Complete";
        statusColor = "green";
      } else if (entries.length > 0 && yrEntries.length === 0) {
          statusLabel = "Sync Required";
          statusColor = "red";
      }

      yearStats[yr] = { percent, statusLabel, statusColor, slotsFilled: uniqueSlots.size };
    });

    // 2. Faculty Workload & Load Levels
    const facultyWorkload = [];
    teachers.forEach(t => {
      const count = entries.filter(e => String(e.faculty) === String(t._id) || e.facultyLabel === t.name).length;
      let loadLevel = "Light";
      if (count > 15) loadLevel = "Heavy";
      else if (count > 8) loadLevel = "Optimal";
      
      if (count > 0) facultyWorkload.push({ name: t.name, count, loadLevel });
    });
    facultyWorkload.sort((a, b) => b.count - a.count);

    // 3. Room Occupancy Grid
    const roomOccupancyGrid = rooms.map(r => {
        const count = entries.filter(e => String(e.room) === String(r._id) || e.roomLabel === r.room_no).length;
        const utilPercent = Math.min(100, Math.round((count / 35) * 100));
        return {
            id: r._id,
            name: r.room_no,
            type: r.type,
            utilPercent,
            status: utilPercent > 80 ? "Critical" : utilPercent > 0 ? "Active" : "Vacant"
        };
    });

    const totalPossibleRoomSlots = rooms.length * 35;
    const totalUsedHours = entries.length; 
    const globalRoomUtilization = Math.min(100, Math.round((totalUsedHours / totalPossibleRoomSlots) * 100));

    // Calculate total hours needed across all subjects in config
    let totalNeededHours = 0;
    const configSems = [4, 6, 8];
    configSems.forEach(s => {
        if (config[s] && config[s].subjects) {
            config[s].subjects.forEach(sub => {
                const batches = sub.type === "Practical" || sub.type === "Lab" ? 3 : 1; 
                totalNeededHours += (sub.lectures || (sub.type === "Practical" || sub.type === "Lab" ? 2 : 3)) * batches;
            });
        }
    });

    const totalAvailableSlots = rooms.length * 35;
    const capacityStatus = totalAvailableSlots >= totalNeededHours ? "Optimal" : "Constrained";

    // 4. Pre-Synthesis Diagnostic Engine (v5.0 True Intelligence)
    const strategicInsights = [];
    let diagnosticScore = 100;

    const subjectBreakdown = {
        theory: subjects.filter(s => ["Theory", "Lecture", "Tutorial"].includes(s.type)).length,
        lab: subjects.filter(s => ["Lab", "Practical"].includes(s.type)).length
    };

    // A. Faculty Overload Check (Real config vs 20hr limit)
    const configFacultyLoad = {};
    const missingDataSems = [];
    
    configSems.forEach(s => {
        if (config[s]?.subjects) {
            config[s].subjects.forEach(sub => {
                if (sub.faculty) {
                    const hours = (sub.lectures || (sub.type === "Practical" || sub.type === "Lab" ? 2 : 3));
                    configFacultyLoad[sub.faculty] = (configFacultyLoad[sub.faculty] || 0) + hours;
                } else {
                    missingDataSems.push(`${s}: ${sub.name}`);
                }
            });
        }
    });

    Object.entries(configFacultyLoad).forEach(([name, load]) => {
        if (load > 20) {
            strategicInsights.push(`OVERLOAD: Professor ${name} is assigned ${load} hours (Limit: 20). This may cause scheduling bottlenecks.`);
            diagnosticScore -= 5;
        }
    });

    // B. Resource Integrity Check
    if (missingDataSems.length > 0) {
        strategicInsights.push(`GAP: ${missingDataSems.length} subjects are missing assigned faculty labels in your configuration.`);
        diagnosticScore -= (missingDataSems.length * 2);
    }

    // C. Capacity Buffer (from v4.2)
    const utilizationPotential = totalAvailableSlots > 0 ? Math.round((totalNeededHours / totalAvailableSlots) * 100) : 100;
    if (utilizationPotential > 90) {
        strategicInsights.push("CRITICAL CAPACITY: Room utilization exceeds 90%. Synthesis will require strict sequential packing.");
        diagnosticScore -= 10;
    } else if (utilizationPotential < 70) {
        strategicInsights.push("OPTIMAL BUFFER: High room flexibility detected (Under 70% utilization). Conflict-free synthesis is highly probable.");
    }

    // D. Lab Multiplier
    if (subjectBreakdown.lab > 5) {
        strategicInsights.push(`COMPLEXITY: High Lab density (${subjectBreakdown.lab} sessions) found. AI will prioritize locking these blocks first.`);
    }

    // Wrap diagnostic score
    diagnosticScore = Math.max(10, Math.min(100, diagnosticScore));

    res.status(200).json({
      counts: {
        teachers: teachers.length,
        rooms: rooms.length,
        subjects: subjects.length,
        entries: entries.length
      },
      analytics: {
        yearStats,
        facultyWorkload: facultyWorkload.slice(0, 6),
        roomUtilization: globalRoomUtilization,
        roomOccupancyGrid,
        freeTime: {
            SE: 35 - (yearStats.SE.slotsFilled || 0),
            TE: 35 - (yearStats.TE.slotsFilled || 0),
            BE: 35 - (yearStats.BE.slotsFilled || 0)
        },
        preSynthesis: {
            subjectBreakdown,
            totalNeededHours,
            totalAvailableSlots,
            capacityStatus,
            readyFaculties: teachers.length,
            readinessScore: diagnosticScore,
            strategicInsights
        }
      }
    });
  } catch (err) { 
    console.error("🔥 Stats Error:", err);
    res.status(500).json({ message: err.message }); 
  }
});

router.get("/", async (req, res) => {
  try {
    const timetables = await Timetable.find(req.query).populate("subject faculty room").sort({ day: 1, startTime: 1 });
    res.status(200).json(timetables);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/faculty/:id", async (req, res) => {
  try {
    console.log(`📡 [API] Fetching schedule for Faculty ID: ${req.params.id}`);
    const timetables = await Timetable.find({ faculty: req.params.id })
      .populate("subject room")
      .sort({ day: 1, startTime: 1 });
    res.status(200).json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a timetable entry
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Entry not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;