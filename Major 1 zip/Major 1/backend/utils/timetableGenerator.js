// Timetable Generator Utility
// Contains the core algorithm for generating timetables with configurable constraints

// Days of the week
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Generate time slots based on configuration
function generateTimeSlots(config) {
    const slots = [];
    const startParts = config.startTime.split(':');
    let currentHour = parseInt(startParts[0]);
    let currentMinute = parseInt(startParts[1]);
    
    let lectureCount = 0;
    let slotId = 1;
    
    while (true) {
        // Calculate end time for this lecture
        let endHour = currentHour + Math.floor((currentMinute + config.lectureDuration) / 60);
        let endMinute = (currentMinute + config.lectureDuration) % 60;
        
        // Format times
        const startTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        // Check if we should stop (after max lectures + breaks)
        if (lectureCount >= config.lunchBreakAfterLectures + config.shortBreakAfterLectures + 2) {
            break;
        }
        
        slots.push({
            id: slotId++,
            time: `${startTimeStr} - ${endTimeStr}`,
            startHour: currentHour,
            startMinute: currentMinute,
            endHour: endHour,
            endMinute: endMinute,
            lectureNumber: lectureCount + 1
        });
        
        // Update for next slot
        lectureCount++;
        
        // Add break duration
        let breakDuration = 0;
        
        // Check if it's time for short break
        if (lectureCount > 0 && lectureCount % config.shortBreakAfterLectures === 0 && 
            lectureCount < config.lunchBreakAfterLectures) {
            breakDuration = config.shortBreakDuration;
        }
        // Check if it's time for lunch break
        else if (lectureCount === config.lunchBreakAfterLectures) {
            breakDuration = config.lunchBreakDuration;
        }
        
        // Move to next start time
        currentHour = endHour + Math.floor((endMinute + breakDuration) / 60);
        currentMinute = (endMinute + breakDuration) % 60;
        
        // Stop if we've gone past reasonable hours (after 6 PM)
        if (currentHour >= 18) break;
    }
    
    return slots;
}

// Initialize empty timetable structure
function initializeTimetable(timeSlots) {
    const timetable = {};
    DAYS.forEach(day => {
        timetable[day] = [];
        timeSlots.forEach(slot => {
            timetable[day].push({
                ...slot,
                subjects: [],
                faculty: null,
                room: null,
                batch: null,
                isLab: false,
                isBreak: false,
                breakType: null
            });
        });
    });
    return timetable;
}

// Add break slots to timetable
function addBreakSlots(timetable, timeSlots, config) {
    DAYS.forEach(day => {
        // Mark short breaks
        timeSlots.forEach((slot, index) => {
            if (slot.lectureNumber > 0 && 
                slot.lectureNumber % config.shortBreakAfterLectures === 0 &&
                slot.lectureNumber < config.lunchBreakAfterLectures) {
                timetable[day][index].isBreak = true;
                timetable[day][index].breakType = 'short';
            }
        });
        
        // Mark lunch break (after lunch break after lectures)
        const lunchSlotIndex = timeSlots.findIndex(s => s.lectureNumber === config.lunchBreakAfterLectures);
        if (lunchSlotIndex >= 0 && lunchSlotIndex < timeSlots.length) {
            timetable[day][lunchSlotIndex].isBreak = true;
            timetable[day][lunchSlotIndex].breakType = 'lunch';
            timetable[day][lunchSlotIndex].isLunch = true;
        }
    });
    return timetable;
}

// Check if a slot is valid for assignment (not a break, empty)
function isSlotAvailable(timetable, dayIndex, slotIndex) {
    const slot = timetable[DAYS[dayIndex]][slotIndex];
    return !slot.isBreak && slot.subjects.length === 0;
}

// Check if a slot is valid for lab (break or empty lab slot)
function isLabSlotAvailable(timetable, dayIndex, slotIndex) {
    const slot = timetable[DAYS[dayIndex]][slotIndex];
    // Lab can go into break slot or empty slot
    return slot.subjects.length === 0 || (slot.isLab && slot.isBreak);
}

// Check if a faculty is available (no clash, respects gap rule)
function isFacultyAvailable(facultySchedule, facultyId, dayIndex, slotIndex) {
    const fs = facultySchedule[facultyId];
    if (!fs) return true;
    
    // Check if faculty already has lecture at this time
    if (fs.lastLectureDay === dayIndex && fs.lastLectureSlot === slotIndex) {
        return false;
    }
    
    // Check if faculty had a lecture in previous slot (gap constraint)
    if (fs.lastLectureDay === dayIndex && fs.lastLectureSlot === slotIndex - 1) {
        return false;
    }
    
    return true;
}

// Check if a room is available
function isRoomAvailable(timetable, dayIndex, slotIndex, roomNumber) {
    const slot = timetable[DAYS[dayIndex]][slotIndex];
    return !slot.room || slot.room.roomNumber !== roomNumber;
}

// Check if faculty already has a lab on this day (HARD CONSTRAINT)
function hasLabOnDay(facultyDailyLab, facultyId, dayIndex) {
    return facultyDailyLab[facultyId] && facultyDailyLab[facultyId][dayIndex] === true;
}

// Assign lecture to timetable
function assignLecture(timetable, facultySchedule, subject, faculty, classroom, dayIndex, slotIndex) {
    timetable[DAYS[dayIndex]][slotIndex] = {
        ...timetable[DAYS[dayIndex]][slotIndex],
        subjects: [subject],
        faculty: { _id: faculty._id.toString(), name: faculty.name },
        room: { roomNumber: classroom.roomNumber, type: 'classroom' },
        batch: null,
        isLab: false
    };
    
    // Update faculty schedule
    const facId = faculty._id.toString();
    if (!facultySchedule[facId]) {
        facultySchedule[facId] = {
            faculty: faculty,
            lecturesPerWeek: 0,
            lastLectureDay: -1,
            lastLectureSlot: -1,
            daysWithSubject: {} // Track which days each subject is scheduled
        };
    }
    facultySchedule[facId].lecturesPerWeek++;
    facultySchedule[facId].lastLectureDay = dayIndex;
    facultySchedule[facId].lastLectureSlot = slotIndex;
    
    // Track subject days for this faculty
    const subjectId = subject._id.toString();
    if (!facultySchedule[facId].daysWithSubject[subjectId]) {
        facultySchedule[facId].daysWithSubject[subjectId] = [];
    }
    facultySchedule[facId].daysWithSubject[subjectId].push(dayIndex);
    
    return true;
}

// Check if subject already has lecture on this day for this faculty
function hasSubjectOnDay(facultySchedule, facultyId, subjectId, dayIndex) {
    const fs = facultySchedule[facultyId];
    if (!fs || !fs.daysWithSubject[subjectId]) return false;
    return fs.daysWithSubject[subjectId].includes(dayIndex);
}

// Assign lab to timetable
function assignLab(timetable, facultySchedule, facultyDailyLab, subject, faculty, lab, batch, dayIndex, slotIndex) {
    timetable[DAYS[dayIndex]][slotIndex] = {
        ...timetable[DAYS[dayIndex]][slotIndex],
        subjects: [subject],
        faculty: { _id: faculty._id.toString(), name: faculty.name },
        room: { roomNumber: lab.roomNumber, type: 'lab' },
        batch: { _id: batch._id.toString(), name: batch.name },
        isLab: true
    };
    
    // Update faculty schedule (lab counts as 1 lecture)
    const facId = faculty._id.toString();
    if (!facultySchedule[facId]) {
        facultySchedule[facId] = {
            faculty: faculty,
            lecturesPerWeek: 0,
            lastLectureDay: -1,
            lastLectureSlot: -1,
            daysWithSubject: {}
        };
    }
    facultySchedule[facId].lecturesPerWeek++;
    facultySchedule[facId].lastLectureDay = dayIndex;
    facultySchedule[facId].lastLectureSlot = slotIndex;
    
    // Track subject days for this faculty
    const subjectId = subject._id.toString();
    if (!facultySchedule[facId].daysWithSubject[subjectId]) {
        facultySchedule[facId].daysWithSubject[subjectId] = [];
    }
    facultySchedule[facId].daysWithSubject[subjectId].push(dayIndex);
    
    // Track faculty lab per day (HARD CONSTRAINT - max 1 lab per day)
    if (!facultyDailyLab[facId]) {
        facultyDailyLab[facId] = {};
    }
    facultyDailyLab[facId][dayIndex] = true;
    
    return true;
}

// Get available slots for a subject (respects subject spread across days)
function getAvailableSlots(timetable, subject, dayIndex, startSlotIndex = 0) {
    const slots = [];
    for (let i = startSlotIndex; i < timetable[DAYS[dayIndex]].length; i++) {
        if (isSlotAvailable(timetable, dayIndex, i)) {
            slots.push(i);
        }
    }
    return slots;
}

// Main timetable generation function
async function generateTimetable(departmentId, year, subjects, faculty, classrooms, labs, batches, config) {
    // Use default config if not provided
    const timetableConfig = config || {
        startTime: '08:15',
        lectureDuration: 60,
        shortBreakDuration: 15,
        shortBreakAfterLectures: 2,
        lunchBreakDuration: 60,
        lunchBreakAfterLectures: 4,
        maxFacultyLecturesPerWeek: 8,
        workingDays: DAYS
    };
    
    // Generate time slots based on configuration
    const timeSlots = generateTimeSlots(timetableConfig);
    
    if (timeSlots.length === 0) {
        throw new Error('Failed to generate time slots. Please check configuration.');
    }
    
    // Initialize empty timetable
    let timetable = initializeTimetable(timeSlots);
    
    // Add break slots
    timetable = addBreakSlots(timetable, timeSlots, timetableConfig);
    
    // Initialize faculty schedule tracking
    const facultySchedule = {};
    faculty.forEach(f => {
        facultySchedule[f._id.toString()] = {
            faculty: f,
            lecturesPerWeek: 0,
            lastLectureDay: -1,
            lastLectureSlot: -1,
            daysWithSubject: {}
        };
    });
    
    // Initialize faculty daily lab tracking (HARD CONSTRAINT: max 1 lab per day per faculty)
    const facultyDailyLab = {};
    faculty.forEach(f => {
        facultyDailyLab[f._id.toString()] = {};
        DAYS.forEach((day, dayIndex) => {
            facultyDailyLab[f._id.toString()][dayIndex] = false;
        });
    });
    
    // Filter subjects into lectures and labs
    const lectureSubjects = subjects.filter(s => !s.isLab);
    const labSubjects = subjects.filter(s => s.isLab);
    
    // Track subject assignments
    const subjectAssignments = {};
    subjects.forEach(s => {
        subjectAssignments[s._id.toString()] = 0;
    });
    
    // Phase 1: Assign lectures with subject spread across days
    // Sort lecture subjects by lecturesPerWeek (highest first) for better distribution
    const sortedLectureSubjects = [...lectureSubjects].sort((a, b) => 
        (b.lecturesPerWeek || 4) - (a.lecturesPerWeek || 4)
    );
    
    let lectureAssigned = false;
    let lectureAttempts = 0;
    const maxLectureAttempts = 2000;
    
    while (!lectureAssigned && lectureAttempts < maxLectureAttempts) {
        lectureAttempts++;
        
        // Track if any subject needs more lectures
        let progressMade = false;
        
        for (const subject of sortedLectureSubjects) {
            const lecturesNeeded = subject.lecturesPerWeek || 4;
            const subjectId = subject._id.toString();
            const currentAssigned = subjectAssignments[subjectId];
            
            if (currentAssigned >= lecturesNeeded) continue;
            
            // Find available faculty for this subject
            const availableFaculty = faculty.filter(f => 
                f.subjects.some(s => s._id.toString() === subjectId) &&
                facultySchedule[f._id.toString()].lecturesPerWeek < timetableConfig.maxFacultyLecturesPerWeek
            );
            
            if (availableFaculty.length === 0) continue;
            
            // Try to assign remaining lectures
            const remainingNeeded = lecturesNeeded - currentAssigned;
            
            for (let lec = 0; lec < remainingNeeded; lec++) {
                let assigned = false;
                
                // Try each day
                for (let dayIndex = 0; dayIndex < DAYS.length && !assigned; dayIndex++) {
                    // Check if this subject already has lecture on this day (spread constraint)
                    // Only for faculty that can teach this subject
                    const facultyForSubject = availableFaculty.map(f => f._id.toString());
                    let hasLectureOnDay = false;
                    
                    for (const facId of facultyForSubject) {
                        if (hasSubjectOnDay(facultySchedule, facId, subjectId, dayIndex)) {
                            hasLectureOnDay = true;
                            break;
                        }
                    }
                    
                    if (hasLectureOnDay) continue;
                    
                    // Get available slots for this day
                    const availableSlots = getAvailableSlots(timetable, subject, dayIndex);
                    
                    // Try each available slot
                    for (const slotIndex of availableSlots) {
                        // Try each faculty
                        for (const fac of availableFaculty) {
                            const facId = fac._id.toString();
                            
                            // Check faculty availability (gap constraint)
                            if (!isFacultyAvailable(facultySchedule, facId, dayIndex, slotIndex)) continue;
                            
                            // Check if faculty already teaches this subject on this day
                            if (hasSubjectOnDay(facultySchedule, facId, subjectId, dayIndex)) continue;
                            
                            // Check classroom availability
                            for (const classroom of classrooms) {
                                if (!isRoomAvailable(timetable, dayIndex, slotIndex, classroom.roomNumber)) continue;
                                
                                // Assign lecture
                                assignLecture(timetable, facultySchedule, subject, fac, classroom, dayIndex, slotIndex);
                                subjectAssignments[subjectId]++;
                                assigned = true;
                                progressMade = true;
                                break;
                            }
                            
                            if (assigned) break;
                        }
                        
                        if (assigned) break;
                    }
                }
            }
        }
        
        // Check if all lectures are assigned
        let allLecturesAssigned = true;
        for (const subject of lectureSubjects) {
            const needed = subject.lecturesPerWeek || 4;
            if (subjectAssignments[subject._id.toString()] < needed) {
                allLecturesAssigned = false;
                break;
            }
        }
        
        if (allLecturesAssigned) {
            lectureAssigned = true;
        } else if (!progressMade) {
            // No progress made, might be stuck - try random shuffle and continue
            // This helps escape local optima
            sortedLectureSubjects.sort(() => Math.random() - 0.5);
        }
    }
    
    // Phase 2: Generate lab schedule (multiple batches can have labs simultaneously)
    // HARD CONSTRAINT: Faculty can have AT MOST ONE lab session per day
    if (labSubjects.length > 0 && batches.length > 0 && labs.length > 0) {
        for (const labSubject of labSubjects) {
            const subjectId = labSubject._id.toString();
            
            // Find available faculty for this lab subject
            const availableFaculty = faculty.filter(f =>
                f.subjects.some(s => s._id.toString() === subjectId)
            );
            
            if (availableFaculty.length === 0) continue;
            
            // Try to schedule lab for each batch
            for (const batch of batches) {
                let labAssigned = false;
                let labAttempts = 0;
                
                while (!labAssigned && labAttempts < 200) {
                    labAttempts++;
                    
                    for (let dayIndex = 0; dayIndex < DAYS.length && !labAssigned; dayIndex++) {
                        // HARD CONSTRAINT: Check if faculty already has a lab on this day
                        // Skip this day if any available faculty already has a lab
                        let canAssignOnThisDay = false;
                        for (const fac of availableFaculty) {
                            const facId = fac._id.toString();
                            if (!hasLabOnDay(facultyDailyLab, facId, dayIndex)) {
                                canAssignOnThisDay = true;
                                break;
                            }
                        }
                        if (!canAssignOnThisDay) continue;
                        
                        // Try afternoon slots for labs (typically after lunch)
                        const afternoonStart = Math.floor(timeSlots.length * 0.5);
                        
                        for (let slotIndex = afternoonStart; slotIndex < timeSlots.length && !labAssigned; slotIndex++) {
                            // Check if slot is available for lab
                            if (!isLabSlotAvailable(timetable, dayIndex, slotIndex)) continue;
                            
                            // Try each faculty
                            for (const fac of availableFaculty) {
                                const facId = fac._id.toString();
                                
                                // HARD CONSTRAINT: Check if faculty already has a lab on this day
                                if (hasLabOnDay(facultyDailyLab, facId, dayIndex)) continue;
                                
                                // Check faculty availability
                                if (!isFacultyAvailable(facultySchedule, facId, dayIndex, slotIndex)) continue;
                                
                                // Find available lab
                                for (const lab of labs) {
                                    if (!isRoomAvailable(timetable, dayIndex, slotIndex, lab.roomNumber)) continue;
                                    
                                    // Assign lab (this also updates facultyDailyLab)
                                    assignLab(timetable, facultySchedule, facultyDailyLab, labSubject, fac, lab, batch, dayIndex, slotIndex);
                                    labAssigned = true;
                                    break;
                                }
                                
                                if (labAssigned) break;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Generate Important Notes based on configuration
    const importantNotes = generateImportantNotes(timetableConfig, timeSlots);
    
    // Return generated timetable with additional metadata
    return {
        timetable,
        timeSlots,
        config: timetableConfig,
        importantNotes,
        facultyLoad: Object.entries(facultySchedule).map(([id, data]) => ({
            facultyId: id,
            name: data.faculty.name,
            lecturesPerWeek: data.lecturesPerWeek
        }))
    };
}

// Generate Important Notes based on configuration
function generateImportantNotes(config, timeSlots) {
    const notes = [];
    
    notes.push(`Lecture duration: ${config.lectureDuration} minutes`);
    notes.push(`Short break: ${config.shortBreakDuration} minutes after ${config.shortBreakAfterLectures} lectures`);
    notes.push(`Lunch break: ${config.lunchBreakDuration} minutes after ${config.lunchBreakAfterLectures} lectures`);
    notes.push(`Maximum faculty load per week: ${config.maxFacultyLecturesPerWeek} lectures`);
    notes.push(`Working days: ${config.workingDays.join('–')}`);
    notes.push(`Faculty can conduct at most 1 lab per day`);
    
    if (timeSlots.length > 0) {
        notes.push(`First lecture: ${timeSlots[0].time}`);
        const lastSlot = timeSlots[timeSlots.length - 1];
        notes.push(`Last lecture: ${lastSlot.time}`);
    }
    
    return notes;
}

module.exports = {
    generateTimetable,
    generateTimeSlots,
    DAYS,
    addBreakSlots
};
