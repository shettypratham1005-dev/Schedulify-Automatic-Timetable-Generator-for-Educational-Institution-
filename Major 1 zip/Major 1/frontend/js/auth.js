// Authentication JavaScript

const AUTH_KEY = 'timetable_auth_token';

// Check if user is logged in
function isAuthenticated() {
    const token = localStorage.getItem(AUTH_KEY);
    return token !== null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem(AUTH_KEY);
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem(AUTH_KEY, data.token);
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Server error. Please try again.' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/';
}

// Verify token
async function verifyToken() {
    const token = getAuthToken();
    if (!token) {
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// Protect page - redirect to login if not authenticated
async function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = '/html/login.html';
        return false;
    }
    
    const isValid = await verifyToken();
    if (!isValid) {
        logout();
        return false;
    }
    
    return true;
}

// Initialize login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        const result = await login(username, password);
        
        if (result.success) {
            window.location.href = '/html/dashboard.html';
        } else {
            errorMessage.textContent = result.message;
        }
    });
}

// Initialize logout button
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Check authentication on page load (except login page)
if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
    protectPage();
}
