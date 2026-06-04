// API Helper Functions

const API_BASE_URL = '/api';

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('timetable_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Generic fetch wrapper
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== DEPARTMENT API ====================

// Get all departments
async function getDepartments() {
    return await apiCall('/departments');
}

// Get single department
async function getDepartment(id) {
    return await apiCall(`/departments/${id}`);
}

// Create department
async function createDepartment(data) {
    return await apiCall('/departments', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Update department
async function updateDepartment(id, data) {
    return await apiCall(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete department
async function deleteDepartment(id) {
    return await apiCall(`/departments/${id}`, {
        method: 'DELETE'
    });
}

// ==================== SUBJECT API ====================

// Get all subjects
async function getSubjects(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`/subjects${params ? `?${params}` : ''}`);
}

// Get single subject
async function getSubject(id) {
    return await apiCall(`/subjects/${id}`);
}

// Create subject
async function createSubject(data) {
    return await apiCall('/subjects', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Update subject
async function updateSubject(id, data) {
    return await apiCall(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete subject
async function deleteSubject(id) {
    return await apiCall(`/subjects/${id}`, {
        method: 'DELETE'
    });
}

// ==================== FACULTY API ====================

// Get all faculty
async function getFaculty(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`/faculty${params ? `?${params}` : ''}`);
}

// Get single faculty
async function getFacultyMember(id) {
    return await apiCall(`/faculty/${id}`);
}

// Create faculty
async function createFaculty(data) {
    return await apiCall('/faculty', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Update faculty
async function updateFaculty(id, data) {
    return await apiCall(`/faculty/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete faculty
async function deleteFaculty(id) {
    return await apiCall(`/faculty/${id}`, {
        method: 'DELETE'
    });
}

// ==================== CLASSROOM API ====================

// Get all classrooms
async function getClassrooms(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`/classrooms${params ? `?${params}` : ''}`);
}

// Get single classroom
async function getClassroom(id) {
    return await apiCall(`/classrooms/${id}`);
}

// Create classroom
async function createClassroom(data) {
    return await apiCall('/classrooms', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Update classroom
async function updateClassroom(id, data) {
    return await apiCall(`/classrooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete classroom
async function deleteClassroom(id) {
    return await apiCall(`/classrooms/${id}`, {
        method: 'DELETE'
    });
}

// Initialize default classrooms
async function initializeDefaultClassrooms() {
    return await apiCall('/classrooms/initialize', {
        method: 'POST'
    });
}

// ==================== BATCH API ====================

// Get all batches
async function getBatches(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`/batches${params ? `?${params}` : ''}`);
}

// Get single batch
async function getBatch(id) {
    return await apiCall(`/batches/${id}`);
}

// Create batch
async function createBatch(data) {
    return await apiCall('/batches', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Update batch
async function updateBatch(id, data) {
    return await apiCall(`/batches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete batch
async function deleteBatch(id) {
    return await apiCall(`/batches/${id}`, {
        method: 'DELETE'
    });
}

// ==================== TIMETABLE API ====================

// Get all timetables
async function getTimetables(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`/timetable${params ? `?${params}` : ''}`);
}

// Get single timetable
async function getTimetable(id) {
    return await apiCall(`/timetable/${id}`);
}

// Get timetable config
async function getTimetableConfig(departmentId, year) {
    return await apiCall(`/timetable/config/${departmentId}/${year}`);
}

// Save timetable config
async function saveTimetableConfig(data) {
    return await apiCall('/timetable/config', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Generate timetable with configuration
async function generateTimetable(departmentId, year, config = {}) {
    return await apiCall('/timetable/generate', {
        method: 'POST',
        body: JSON.stringify({ departmentId, year, ...config })
    });
}

// Delete timetable
async function deleteTimetable(id) {
    return await apiCall(`/timetable/${id}`, {
        method: 'DELETE'
    });
}

// Get timetable by department and year
async function getTimetableByDeptYear(departmentId, year) {
    const timetables = await getTimetables({ department: departmentId, year });
    return timetables.length > 0 ? timetables[0] : null;
}

// Download timetable as PDF
async function downloadTimetablePDF(departmentId, year) {
    const token = localStorage.getItem('timetable_auth_token');
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    try {
        const response = await fetch(`/api/timetable/download/${departmentId}/${year}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to download PDF');
        }
        
        // Get the blob from response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `timetable_${year}.pdf`;
        
        // Append to body, click and remove
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
}
