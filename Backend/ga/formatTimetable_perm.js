function formatTimetable(chromosome) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6];

    let timetable = {};

    chromosome.forEach(slot => {
        const section = slot.section;

        if (!timetable[section]) {
            timetable[section] = {};
            days.forEach(day => {
                timetable[section][day] = {};
                periods.forEach(p => {
                    timetable[section][day][p] = "-";
                });
            });
        }

        timetable[section][slot.day][slot.period] =
            slot.subject + " (" + slot.teacher + ")";
    });

    return timetable;
}

module.exports = { formatTimetable };