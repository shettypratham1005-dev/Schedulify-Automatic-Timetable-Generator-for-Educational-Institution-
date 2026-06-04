const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Batch = require('./models/Batch');
const config = require('./config/timetableConfig');
const fs = require('fs');

async function testGeneration() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Timetable');
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    
    const sems = [8];
    const dbSubs = {};
    for (const s of sems) {
        dbSubs[s] = {};
        (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
    }

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const PRACTICAL_BLOCKS = [[0, 1], [3, 4], [7, 8]];

    function hasConflict(existing, day, slotIdx, duration, faculty, room, batchId) {
        return false; // stub
    }

    let globalT = [];
    let labPool = [];

    for (const sem of sems) {
        const c = config[sem];
        const yr = c.className;
        const bList = bDB.filter(b => b.year === yr).map(b => b.name).sort();
        console.log(`[TEST] Sem ${sem} yr ${yr} bList:`, bList);

        const getT = (n) => tDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
        const getR = (n) => rDB.find(r => r.room_no === n);

        const pList = c.subjects.filter(s => s.type === "Practical").map(s => ({
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: getT(s.faculty),
            r: getR(s.labRoom),
            allowedBatches: s.batches 
        }));

        console.log(`[TEST] pList length: ${pList.length}`);
        if (pList.length === 0) continue;

        const blocksNeeded = sem === 8 ? 1 : 4;
        for (let i = 0; i < blocksNeeded; i++) {
            labPool.push({ sem, yr, bList, pList, blockIdx: i });
        }
    }

    for (const item of labPool) {
        let placed = false;
        outer: for (const d of DAYS) {
            for (const blk of PRACTICAL_BLOCKS) {
                let can = true;
                for (let i = 0; i < item.bList.length; i++) {
                    const bName = item.bList[i];
                    const p = item.pList[(i + item.blockIdx) % item.pList.length];
                    
                    const checkStr = bName.startsWith("Batch") ? bName : `Batch ${bName}`;
                    if (p.allowedBatches && !p.allowedBatches.includes(checkStr)) {
                        continue;
                    }
                    if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${item.yr}-${bName}`)) { 
                        can = false; break; 
                    }
                }

                if (can) {
                    item.bList.forEach((b, i) => {
                        const p = item.pList[(i + item.blockIdx) % item.pList.length];
                        const bCheck = b.startsWith("Batch") ? b : `Batch ${b}`;
                        if (p.allowedBatches && !p.allowedBatches.includes(bCheck)) {
                            console.log(`[EXCLUDED] ${bCheck} not in ${p.allowedBatches}`);
                            return;
                        }
                        globalT.push({ 
                            day: d, slotIdx: blk[0], duration: 2, 
                            subject: p.sub, faculty: p.f, room: p.r, 
                            batch: b, batchId: `${item.yr}-${b}`, type: "Practical", semester: item.sem 
                        });
                        console.log(`[PUSHED] Lab for ${b}`);
                    });
                    placed = true;
                    break outer;
                }
            }
        }
    }
    console.log("[TEST] globalT len:", globalT.length);
    mongoose.connection.close();
}
testGeneration();
