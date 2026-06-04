const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Batch = require('./models/Batch');
const config = require('./config/timetableConfig');
const fs = require('fs');

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["08:15", "09:15", "10:15", "10:30", "11:30", "12:30", "01:30", "02:30", "03:30", "04:30"];
const VALID_SLOTS = [0, 1, 3, 4, 5, 7, 8]; 
const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]];

function hasConflict(existing, day, slotIdx, duration, faculty, room, batchId) {
    const slotsToOccupy = Array.from({ length: duration }, (_, i) => slotIdx + i);
    for (const e of existing) {
        if (e.day !== day) continue;
        const eSlots = Array.from({ length: e.duration || 1 }, (_, i) => e.slotIdx + i);
        if (slotsToOccupy.some(s => eSlots.includes(s))) {
            if (faculty && e.faculty && String(e.faculty._id || e.faculty) === String(faculty._id || faculty)) return true;
            if (room && e.room && String(e.room._id || e.room) === String(room._id || room)) return true;
            if (e.batchId === batchId || e.batchId === `${batchId.split("-")[0]}-ALL`) return true;
        }
    }
    return false;
}

function scheduleParallelLabs(sems, globalT, tDB, rDB, dbSubs, bDB) {
    let labPool = [];
    
    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        const bList = bDB.filter(b => b.year === yr).map(b => b.name).sort();
        const getT = (n) => tDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
        const getR = (n) => rDB.find(r => r.room_no === n);

        const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: getT(s.faculty),
            r: getR(s.labRoom),
            allowedBatches: s.batches 
        }));

        if (pList.length === 0) continue;

        const blocksNeeded = sem === 8 ? 1 : 4;
        for (let i = 0; i < blocksNeeded; i++) {
            labPool.push({ sem, yr, bList, pList, blockIdx: i });
        }
    }

    labPool.sort(() => Math.random() - 0.5);

    for (const item of labPool) {
        let placed = false;
        outer: for (const d of DAYS) {
            for (const blk of PRACTICAL_BLOCKS) {
                let can = true;
                for (let i = 0; i < item.bList.length; i++) {
                    const bName = item.bList[i];
                    const p = item.pList[(i + item.blockIdx) % item.pList.length];
                    
                    const checkStr = bName.startsWith("Batch") ? bName : `Batch ${bName}`;
                    if (p.allowedBatches && !p.allowedBatches.includes(checkStr)) continue;

                    if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${item.yr}-${bName}`)) { 
                        can = false; break; 
                    }
                }

                if (can) {
                    item.bList.forEach((b, i) => {
                        const p = item.pList[(i + item.blockIdx) % item.pList.length];
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

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Timetable');
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    
    const dbSubs = {};
    for (const s of [4, 6, 8]) {
        dbSubs[s] = {};
        (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
    }

    let globalT = [];
    const success = scheduleParallelLabs([4,6,8], globalT, tDB, rDB, dbSubs, bDB);
    console.log("Success:", success);
    console.log("globalT keys:", globalT.length);
    console.log(globalT.filter(e => e.semester === 8));
    process.exit();
}
run();
