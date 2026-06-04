// frontend/js/app.js

// ==================== DASHBOARD PAGE ====================
if (window.location.pathname.includes('dashboard.html') || document.getElementById('deptCount')) {
    async function loadDashboardStats() {
        try {
            const [departments, subjects, faculty, timetables] = await Promise.all([
                getDepartments(),
                getSubjects(),
                getFaculty(),
                getTimetables()
            ]);
            
            document.getElementById('deptCount').textContent = departments.length;
            document.getElementById('subjectCount').textContent = subjects.length;
            document.getElementById('facultyCount').textContent = faculty.length;
            document.getElementById('timetableCount').textContent = timetables.length;
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    loadDashboardStats();
}

// ==================== DEPARTMENTS PAGE ====================
if (window.location.pathname.includes('departments.html') || document.getElementById('departmentForm')) {
    async function loadDepartments() {
        try {
            const departments = await getDepartments();
            const tbody = document.querySelector('#departmentsTable tbody');
            tbody.innerHTML = '';
            
            departments.forEach(dept => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dept.name}</td>
                    <td>${dept.fullName}</td>
                    <td class="table-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteDepartment('${dept._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    document.getElementById('departmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('deptName').value;
        const fullName = document.getElementById('deptFullName').value;
        
        try {
            await createDepartment({ name, fullName });
            document.getElementById('departmentForm').reset();
            loadDepartments();
            alert('Department added successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    window.deleteDepartment = async function(id) {
        if (confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(id);
                loadDepartments();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };
    
    loadDepartments();
}

// ==================== SUBJECTS PAGE ====================
if (window.location.pathname.includes('subjects.html') || document.getElementById('subjectForm')) {
    async function loadDepartmentsForSubjects() {
        try {
            const departments = await getDepartments();
            const select = document.getElementById('subjectDept');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = dept.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    async function loadSubjects() {
        try {
            const subjects = await getSubjects();
            const tbody = document.querySelector('#subjectsTable tbody');
            tbody.innerHTML = '';
            
            subjects.forEach(subject => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${subject.code}</td>
                    <td>${subject.name}</td>
                    <td>${subject.department?.name || 'N/A'}</td>
                    <td>${subject.year}</td>
                    <td>${subject.isLab ? 'Lab' : 'Lecture'}</td>
                    <td>${subject.lecturesPerWeek || 4}</td>
                    <td class="table-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteSubject('${subject._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }
    
    document.getElementById('subjectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('subjectName').value;
        const code = document.getElementById('subjectCode').value;
        const department = document.getElementById('subjectDept').value;
        const year = document.getElementById('subjectYear').value;
        const isLab = document.getElementById('isLab').value === 'true';
        const lecturesPerWeek = parseInt(document.getElementById('lecturesPerWeek').value);
        
        try {
            await createSubject({ name, code, department, year, isLab, lecturesPerWeek });
            document.getElementById('subjectForm').reset();
            loadSubjects();
            alert('Subject added successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    window.deleteSubject = async function(id) {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await deleteSubject(id);
                loadSubjects();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };
    
    loadDepartmentsForSubjects();
    loadSubjects();
}

// ==================== FACULTY PAGE ====================
if (window.location.pathname.includes('faculty.html') || document.getElementById('facultyForm')) {
    async function loadDepartmentsForFaculty() {
        try {
            const departments = await getDepartments();
            const select = document.getElementById('facultyDept');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = dept.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    async function loadSubjectsForFaculty() {
        try {
            const subjects = await getSubjects();
            const select = document.getElementById('facultySubjects');
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject._id;
                option.textContent = `${subject.code} - ${subject.name}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }
    
    async function loadFaculty() {
        try {
            const faculty = await getFaculty();
            const tbody = document.querySelector('#facultyTable tbody');
            tbody.innerHTML = '';
            
            faculty.forEach(member => {
                const subjects = member.subjects?.map(s => s.name).join(', ') || 'None';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${member.name}</td>
                    <td>${member.employeeId}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.department?.name || 'N/A'}</td>
                    <td>${subjects}</td>
                    <td class="table-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteFacultyMember('${member._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading faculty:', error);
        }
    }
    
    document.getElementById('facultyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('facultyName').value;
        const employeeId = document.getElementById('employeeId').value;
        const email = document.getElementById('facultyEmail').value;
        const phone = document.getElementById('facultyPhone').value;
        const department = document.getElementById('facultyDept').value;
        const subjectsSelect = document.getElementById('facultySubjects');
        const subjects = Array.from(subjectsSelect.selectedOptions).map(opt => opt.value);
        
        try {
            await createFaculty({ name, employeeId, email, phone, department, subjects });
            document.getElementById('facultyForm').reset();
            loadFaculty();
            alert('Faculty added successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    window.deleteFacultyMember = async function(id) {
        if (confirm('Are you sure you want to delete this faculty member?')) {
            try {
                await deleteFaculty(id);
                loadFaculty();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };
    
    loadDepartmentsForFaculty();
    loadSubjectsForFaculty();
    loadFaculty();
}

// ==================== CLASSROOMS PAGE ====================
if (window.location.pathname.includes('classrooms.html') || document.getElementById('classroomForm')) {
    async function loadClassrooms() {
        try {
            const classrooms = await getClassrooms();
            const tbody = document.querySelector('#classroomsTable tbody');
            tbody.innerHTML = '';
            
            classrooms.forEach(room => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${room.roomNumber}</td>
                    <td>${room.type}</td>
                    <td>${room.capacity}</td>
                    <td>${room.isAvailable ? 'Available' : 'Not Available'}</td>
                    <td class="table-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteClassroomRoom('${room._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading classrooms:', error);
        }
    }
    
    document.getElementById('classroomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const roomNumber = document.getElementById('roomNumber').value;
        const type = document.getElementById('roomType').value;
        const capacity = parseInt(document.getElementById('capacity').value);
        const isAvailable = document.getElementById('isAvailable').value === 'true';
        
        try {
            await createClassroom({ roomNumber, type, capacity, isAvailable });
            document.getElementById('classroomForm').reset();
            loadClassrooms();
            alert('Room added successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    document.getElementById('initDefaultRooms').addEventListener('click', async () => {
        try {
            await initializeDefaultClassrooms();
            alert('Default rooms initialized!');
            loadClassrooms();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    window.deleteClassroomRoom = async function(id) {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteClassroom(id);
                loadClassrooms();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };
    
    loadClassrooms();
}

// ==================== BATCHES PAGE ====================
if (window.location.pathname.includes('batches.html') || document.getElementById('batchForm')) {
    async function loadDepartmentsForBatches() {
        try {
            const departments = await getDepartments();
            const select = document.getElementById('batchDept');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = dept.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    async function loadBatches() {
        try {
            const batches = await getBatches();
            const tbody = document.querySelector('#batchesTable tbody');
            tbody.innerHTML = '';
            
            batches.forEach(batch => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${batch.name}</td>
                    <td>${batch.department?.name || 'N/A'}</td>
                    <td>${batch.year}</td>
                    <td>${batch.isActive ? 'Active' : 'Inactive'}</td>
                    <td class="table-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteBatchRecord('${batch._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading batches:', error);
        }
    }
    
    document.getElementById('batchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('batchName').value;
        const department = document.getElementById('batchDept').value;
        const year = document.getElementById('batchYear').value;
        const isActive = document.getElementById('batchActive').value === 'true';
        
        try {
            await createBatch({ name, department, year, isActive });
            document.getElementById('batchForm').reset();
            loadBatches();
            alert('Batch added successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    window.deleteBatchRecord = async function(id) {
        if (confirm('Are you sure you want to delete this batch?')) {
            try {
                await deleteBatch(id);
                loadBatches();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };
    
    loadDepartmentsForBatches();
    loadBatches();
}

// ==================== GENERATE TIMETABLE PAGE ====================
if (window.location.pathname.includes('generate.html') || document.getElementById('generateForm')) {
    let currentConfig = null;
    
    async function loadDepartmentsForGenerate() {
        try {
            const departments = await getDepartments();
            const select = document.getElementById('genDept');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = `${dept.name} - ${dept.fullName}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    // Load saved configuration when department and year are selected
    async function loadSavedConfig() {
        const departmentId = document.getElementById('genDept').value;
        const year = document.getElementById('genYear').value;
        
        if (departmentId && year) {
            try {
                const config = await getTimetableConfig(departmentId, year);
                currentConfig = config;
                
                // Update form fields
                document.getElementById('startTime').value = config.startTime || '08:15';
                document.getElementById('lectureDuration').value = config.lectureDuration || 60;
                document.getElementById('shortBreakDuration').value = config.shortBreakDuration || 15;
                document.getElementById('shortBreakAfterLectures').value = config.shortBreakAfterLectures || 2;
                document.getElementById('lunchBreakDuration').value = config.lunchBreakDuration || 60;
                document.getElementById('lunchBreakAfterLectures').value = config.lunchBreakAfterLectures || 4;
                document.getElementById('maxFacultyLectures').value = config.maxFacultyLecturesPerWeek || 8;
                
                // Update Important Notes
                updateImportantNotes(config);
            } catch (error) {
                console.log('No saved config found, using defaults');
            }
        }
    }
    
    function updateImportantNotes(config) {
        const notesList = document.getElementById('importantNotesList');
        const notes = [
            `Lecture duration: ${config.lectureDuration || 60} minutes`,
            `Short break: ${config.shortBreakDuration || 15} minutes after ${config.shortBreakAfterLectures || 2} lectures`,
            `Lunch break: ${config.lunchBreakDuration || 60} minutes after ${config.lunchBreakAfterLectures || 4} lectures`,
            `Maximum faculty load per week: ${config.maxFacultyLecturesPerWeek || 8} lectures`,
            `Working days: Monday–Friday`
        ];
        
        notesList.innerHTML = notes.map(note => `<li>${note}</li>`).join('');
    }
    
    async function loadPrerequisites() {
        try {
            const [departments, subjects, faculty, classrooms, labs, batches] = await Promise.all([
                getDepartments(),
                getSubjects(),
                getFaculty(),
                getClassrooms({ type: 'classroom' }),
                getClassrooms({ type: 'lab' }),
                getBatches()
            ]);
            
            const list = document.getElementById('prerequisitesList');
            list.innerHTML = '';
            
            const items = [
                { check: departments.length > 0, text: 'At least one department added' },
                { check: subjects.length > 0, text: 'Subjects added for SE/TE/BE' },
                { check: faculty.length > 0, text: 'Faculty members added' },
                { check: classrooms.length >= 1, text: 'At least one classroom added' },
                { check: labs.length >= 1, text: 'Lab rooms added' },
                { check: batches.length > 0, text: 'Batches created' }
            ];
            
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = `checklist-item ${item.check ? 'check' : 'uncheck'}`;
                div.innerHTML = `
                    <span class="icon">${item.check ? '✓' : '✗'}</span>
                    <span>${item.text}</span>
                `;
                list.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading prerequisites:', error);
        }
    }
    
    // Event listeners for department and year selection
    document.getElementById('genDept').addEventListener('change', loadSavedConfig);
    document.getElementById('genYear').addEventListener('change', loadSavedConfig);
    
    document.getElementById('generateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const departmentId = document.getElementById('genDept').value;
        const year = document.getElementById('genYear').value;
        
        // Get configuration from form
        const config = {
            startTime: document.getElementById('startTime').value,
            lectureDuration: parseInt(document.getElementById('lectureDuration').value),
            shortBreakDuration: parseInt(document.getElementById('shortBreakDuration').value),
            shortBreakAfterLectures: parseInt(document.getElementById('shortBreakAfterLectures').value),
            lunchBreakDuration: parseInt(document.getElementById('lunchBreakDuration').value),
            lunchBreakAfterLectures: parseInt(document.getElementById('lunchBreakAfterLectures').value),
            maxFacultyLecturesPerWeek: parseInt(document.getElementById('maxFacultyLectures').value)
        };
        
        const messageDiv = document.getElementById('generateMessage');
        
        messageDiv.textContent = 'Generating timetable... Please wait...';
        messageDiv.className = 'message';
        
        try {
            const result = await generateTimetable(departmentId, year, config);
            messageDiv.textContent = 'Timetable generated successfully!';
            messageDiv.className = 'message success';
            
            // Update Important Notes with result notes if available
            if (result.importantNotes && result.importantNotes.length > 0) {
                const notesList = document.getElementById('importantNotesList');
                notesList.innerHTML = result.importantNotes.map(note => `<li>${note}</li>`).join('');
            }
            
            alert('Timetable generated successfully!');
        } catch (error) {
            messageDiv.textContent = 'Error: ' + error.message;
            messageDiv.className = 'message error';
        }
    });
    
    loadDepartmentsForGenerate();
    loadPrerequisites();
}

// ==================== VIEW TIMETABLE PAGE ====================
if (window.location.pathname.includes('view-timetable.html') || document.getElementById('viewForm')) {
    let currentTimetable = null;
    let currentDepartmentId = null;
    let currentYear = null;
    
    async function loadDepartmentsForView() {
        try {
            const departments = await getDepartments();
            const select = document.getElementById('viewDept');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = `${dept.name} - ${dept.fullName}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    document.getElementById('viewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const departmentId = document.getElementById('viewDept').value;
        const year = document.getElementById('viewYear').value;
        
        currentDepartmentId = departmentId;
        currentYear = year;
        
        try {
            currentTimetable = await getTimetableByDeptYear(departmentId, year);
            if (currentTimetable) {
                displayTimetable(currentTimetable);
            } else {
                document.getElementById('timetableDisplay').innerHTML = '<p class="no-data">No timetable found for this selection</p>';
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    function displayTimetable(timetable) {
        const dept = timetable.department?.name || 'Unknown';
        const year = timetable.year || 'Unknown';
        
        document.getElementById('timetableTitle').textContent = `${dept} - ${year} Timetable`;
        
        const weekData = timetable.weekData;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // Get time slots from timetable or use default
        let timeSlots = timetable.timeSlots || [
            { time: '09:00 - 10:00' },
            { time: '10:00 - 11:00' },
            { time: '11:00 - 12:00' },
            { time: '12:00 - 01:00' },
            { time: '01:00 - 02:00' },
            { time: '02:00 - 03:00' },
            { time: '03:00 - 04:00' },
            { time: '04:00 - 05:00' }
        ];
        
        let html = '<div class="timetable-grid"><table><thead><tr><th>Time</th>';
        days.forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        timeSlots.forEach((slot, slotIndex) => {
            const timeStr = slot.time || '';
            html += `<tr><td class="time-column">${timeStr}</td>`;
            
            days.forEach(day => {
                const slotData = weekData[day]?.[slotIndex];
                
                if (slotData?.isLunch) {
                    html += '<td class="timetable-slot lunch">Lunch Break</td>';
                } else if (slotData?.isBreak) {
                    html += '<td class="timetable-slot break">' + 
                        (slotData.breakType === 'short' ? 'Short Break' : 'Break') + '</td>';
                } else if (slotData?.subjects?.length > 0) {
                    const subject = slotData.subjects[0];
                    const subjectName = subject?.name || 'Unknown';
                    const facultyName = slotData.faculty?.name || '';
                    const roomNum = slotData.room?.roomNumber || '';
                    const batchName = slotData.batch?.name || '';
                    const isLab = slotData.isLab ? 'lab' : '';
                    
                    html += `<td class="timetable-slot ${isLab}">
                        <div class="subject">${subjectName}</div>
                        ${facultyName ? `<div class="faculty">${facultyName}</div>` : ''}
                        ${roomNum ? `<div class="room">${roomNum}</div>` : ''}
                        ${batchName ? `<div class="batch">${batchName}</div>` : ''}
                    </td>`;
                } else {
                    html += '<td class="timetable-slot empty">-</td>';
                }
            });
            
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        // Add Important Notes section if available
        if (timetable.importantNotes && timetable.importantNotes.length > 0) {
            html += '<div class="important-notes">';
            html += '<h3>Important Notes</h3>';
            html += '<ul>';
            timetable.importantNotes.forEach(note => {
                html += `<li>${note}</li>`;
            });
            html += '</ul></div>';
        }
        
        // Add Faculty Load section if available
        if (timetable.facultyLoad && timetable.facultyLoad.length > 0) {
            html += '<div class="faculty-load">';
            html += '<h3>Faculty Load</h3>';
            html += '<ul>';
            timetable.facultyLoad.forEach(load => {
                html += `<li>${load.name}: ${load.lecturesPerWeek} lectures</li>`;
            });
            html += '</ul></div>';
        }
        
        document.getElementById('timetableDisplay').innerHTML = html;
    }
    
    // Download PDF button
    const downloadBtn = document.getElementById('downloadPdf');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            if (!currentTimetable) {
                alert('Please load the timetable first');
                return;
            }
            
            try {
                await downloadTimetablePDF(
                    currentTimetable.department,
                    currentTimetable.year
                );
                console.log('PDF downloaded successfully');
            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Error downloading PDF: ' + error.message);
            }
        });
    }
    
    loadDepartmentsForView();
}
