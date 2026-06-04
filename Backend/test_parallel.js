const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Batch = require('./models/Batch');
const config = require('./config/timetableConfig');

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

async function runTest() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Timetable');
    const [tDB, rDB, bDB] = await Promise.all([Teacher.find({}), Room.find({}), Batch.find({})]);
    
    const dbSubs = {};
    for (const s of [8]) {
        dbSubs[s] = {};
        (await Subject.find({ semester: s })).forEach(su => dbSubs[s][su.name.toLowerCase()] = su);
    }
    
    let globalT = [];
    const getT = (n) => tDB.find(t => t.name.toLowerCase() === (n || "").toLowerCase());
    const getR = (n) => rDB.find(r => r.room_no === n);
    
    const sem = 8;
    const c = config[sem];
    const yr = c.className;
    const bList = bDB.filter(b => b.year === yr).map(b => b.name).sort();
    
    const pList = c.subjects.filter(s => s.type === "Practical").map(s => {
        const p = {
            name: s.name,
            sub: dbSubs[sem][s.name.toLowerCase()],
            f: getT(s.faculty),
            r: getR(s.labRoom),
            allowedBatches: s.batches 
        };
        console.log(`Parsed Practical: ${p.name}, sub id: ${p.sub?._id}, f id: ${p.f?._id}, r id: ${p.r?._id}, allowed: ${p.allowedBatches}`);
        return p;
    });
    
    console.log(`bList: ${bList}`);
    
    const item = { sem, yr, bList, pList, blockIdx: 0 };
    let placed = false;
    
    outer: for (const d of DAYS) {
        for (const blk of PRACTICAL_BLOCKS) {
            let can = true;
            for (let i = 0; i < item.bList.length; i++) {
                const bName = item.bList[i];
                const p = item.pList[(i + item.blockIdx) % item.pList.length];
                const checkStr = bName.startsWith("Batch") ? bName : `Batch ${bName}`;
                
                console.log(`Checking Day ${d} Slot ${blk[0]}, bName: ${bName}, checking Batch: ${checkStr}`);
                
                if (p.allowedBatches && !p.allowedBatches.includes(checkStr)) {
                    console.log(`  -> exclude match for ${checkStr}`);
                    continue;
                }

                if (!p.sub || hasConflict(globalT, d, blk[0], 2, p.f, p.r, `${item.yr}-${bName}`)) { 
                    console.log(`  -> Conflict or no sub! p.sub: ${!!p.sub}`);
                    can = false; break; 
                }
            }

            if (can) {
                console.log(`>> CAN PLACE on ${d} at ${blk[0]}!`);
                item.bList.forEach((b, i) => {
                    const p = item.pList[(i + item.blockIdx) % item.pList.length];
                    const bCheck = b.startsWith("Batch") ? b : `Batch ${b}`;
                    if (p.allowedBatches && !p.allowedBatches.includes(bCheck)) {
                         console.log(`  Pushing excluded for ${bCheck}`);
                         return;
                    }
                    globalT.push({ 
                        day: d, slotIdx: blk[0], duration: 2, 
                        subject: p.sub, batch: b, type: "Practical", semester: item.sem 
                    });
                    console.log(`  -> Pushed for ${b}`);
                });
                placed = true;
                break outer;
            }
        }
    }
    
    console.log("GlobalT:");
    console.log(globalT);
    mongoose.connection.close();
}

runTest();
