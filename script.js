// Data storage with Firebase
let classes = [];
let assignments = [];
let assessments = [];
let userDataRef = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth state to be ready
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, setup database reference
            userDataRef = database.ref('users/' + user.uid);
            loadData();
        }
    });
    
    // Determine which page we're on
    const currentPage = window.location.pathname.split('/').pop();
    
    // Setup form handlers
    setupFormHandlers();
});

// Firebase Database Functions
function loadData() {
    if (!userDataRef) {
        console.error('User not authenticated');
        return;
    }
    
    // Load classes
    userDataRef.child('classes').on('value', (snapshot) => {
        classes = [];
        snapshot.forEach((childSnapshot) => {
            classes.push(childSnapshot.val());
        });
        populateClassDropdowns();
        
        // Determine which page and render
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'assessments.html') {
            renderAssessments();
        } else if (currentPage === 'index.html' || currentPage === '') {
            renderAssignments();
        }
    });
    
    // Load assignments
    userDataRef.child('assignments').on('value', (snapshot) => {
        assignments = [];
        snapshot.forEach((childSnapshot) => {
            assignments.push(childSnapshot.val());
        });
        
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '') {
            renderAssignments();
        }
    });
    
    // Load assessments
    userDataRef.child('assessments').on('value', (snapshot) => {
        assessments = [];
        snapshot.forEach((childSnapshot) => {
            assessments.push(childSnapshot.val());
        });
        
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'assessments.html') {
            renderAssessments();
        }
    });
}

function saveClass(classData) {
    if (!userDataRef) return;
    return userDataRef.child('classes').child(classData.id.toString()).set(classData);
}

function saveAssignment(assignmentData) {
    if (!userDataRef) return;
    return userDataRef.child('assignments').child(assignmentData.id.toString()).set(assignmentData);
}

function saveAssessment(assessmentData) {
    if (!userDataRef) return;
    return userDataRef.child('assessments').child(assessmentData.id.toString()).set(assessmentData);
}

function deleteClassFromDB(classId) {
    if (!userDataRef) return;
    return userDataRef.child('classes').child(classId.toString()).remove();
}

function deleteAssignmentFromDB(assignmentId) {
    if (!userDataRef) return;
    return userDataRef.child('assignments').child(assignmentId.toString()).remove();
}

function deleteAssessmentFromDB(assessmentId) {
    if (!userDataRef) return;
    return userDataRef.child('assessments').child(assessmentId.toString()).remove();
}

// Modal Functions
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        populateClassDropdowns();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Form Setup
function setupFormHandlers() {
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', handleClassSubmit);
    }
    
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentSubmit);
    }
    
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleAssessmentSubmit);
    }
}

// Handle Class Form Submission
function handleClassSubmit(e) {
    e.preventDefault();
    
    const newClass = {
        id: Date.now(),
        name: document.getElementById('className').value,
        startDate: document.getElementById('classStart').value,
        endDate: document.getElementById('classEnd').value
    };
    
    saveClass(newClass).then(() => {
        console.log('Class saved successfully');
        e.target.reset();
        toggleModal('classModal');
        alert('Class added successfully!');
    }).catch((error) => {
        console.error('Error saving class:', error);
        alert('Error adding class. Please try again.');
    });
}

// Handle Assignment Form Submission
function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const newAssignment = {
        id: Date.now(),
        classId: document.getElementById('assignmentClass').value,
        name: document.getElementById('assignmentName').value,
        type: document.getElementById('assignmentType').value,
        dueDate: document.getElementById('assignmentDue').value,
        status: document.getElementById('assignmentStatus').value
    };
    
    saveAssignment(newAssignment).then(() => {
        console.log('Assignment saved successfully');
        e.target.reset();
        toggleModal('assignmentModal');
    }).catch((error) => {
        console.error('Error saving assignment:', error);
        alert('Error adding assignment. Please try again.');
    });
}

// Handle Assessment Form Submission
function handleAssessmentSubmit(e) {
    e.preventDefault();
    
    const newAssessment = {
        id: Date.now(),
        classId: document.getElementById('assessmentClass').value,
        name: document.getElementById('assessmentName').value,
        date: document.getElementById('assessmentDate').value,
        topics: document.getElementById('assessmentTopics').value,
        status: document.getElementById('assessmentStatus').value
    };
    
    saveAssessment(newAssessment).then(() => {
        console.log('Assessment saved successfully');
        e.target.reset();
        toggleModal('assessmentModal');
    }).catch((error) => {
        console.error('Error saving assessment:', error);
        alert('Error adding assessment. Please try again.');
    });
}

// Populate Class Dropdowns
function populateClassDropdowns() {
    const assignmentClassSelect = document.getElementById('assignmentClass');
    const assessmentClassSelect = document.getElementById('assessmentClass');
    
    if (assignmentClassSelect) {
        assignmentClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            assignmentClassSelect.appendChild(option);
        });
    }
    
    if (assessmentClassSelect) {
        assessmentClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            assessmentClassSelect.appendChild(option);
        });
    }
}

// Get Week Number
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
}

// Get Week Date Range
function getWeekDateRange(weekString) {
    const [year, week] = weekString.split('-W');
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    
    const weekEnd = new Date(ISOweekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    return `${ISOweekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}, ${year}`;
}

// Render Assignments
function renderAssignments() {
    const container = document.getElementById('assignmentsContainer');
    if (!container) return;
    
    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div class="empty-state-text">No assignments yet. Add your first assignment to get started!</div>
            </div>
        `;
        return;
    }
    
    // Group assignments by week
    const assignmentsByWeek = {};
    assignments.forEach(assignment => {
        const week = getWeekNumber(assignment.dueDate);
        if (!assignmentsByWeek[week]) {
            assignmentsByWeek[week] = [];
        }
        assignmentsByWeek[week].push(assignment);
    });
    
    // Sort weeks and assignments
    const sortedWeeks = Object.keys(assignmentsByWeek).sort();
    container.innerHTML = '';
    
    sortedWeeks.forEach(week => {
        const weekAssignments = assignmentsByWeek[week].sort((a, b) => 
            new Date(a.dueDate) - new Date(b.dueDate)
        );
        
        const weekSection = document.createElement('div');
        weekSection.className = 'week-section';
        
        weekSection.innerHTML = `
            <div class="week-header">Week: ${getWeekDateRange(week)}</div>
            <div class="week-content">
                ${weekAssignments.map(assignment => createAssignmentCard(assignment)).join('')}
            </div>
        `;
        
        container.appendChild(weekSection);
    });
}

// Create Assignment Card
function createAssignmentCard(assignment) {
    const cls = classes.find(c => c.id == assignment.classId);
    const className = cls ? cls.name : 'Unknown Class';
    
    const dueDate = new Date(assignment.dueDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="card ${assignment.status}">
            <div class="card-header">
                <div class="card-title">${assignment.name}</div>
                <div class="card-actions">
                    <button class="btn btn-delete" onclick="deleteAssignment(${assignment.id})">Delete</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <div class="info-label">Class</div>
                    <div class="info-value">${className}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Type</div>
                    <div class="info-value">${assignment.type}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Due Date</div>
                    <div class="info-value">${dueDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${formatStatus(assignment.status)}</div>
                </div>
            </div>
        </div>
    `;
}

// Render Assessments
function renderAssessments() {
    const container = document.getElementById('assessmentsContainer');
    if (!container) return;
    
    if (assessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No assessments yet. Add your first assessment to get started!</div>
            </div>
        `;
        return;
    }
    
    // Group assessments by week
    const assessmentsByWeek = {};
    assessments.forEach(assessment => {
        const week = getWeekNumber(assessment.date);
        if (!assessmentsByWeek[week]) {
            assessmentsByWeek[week] = [];
        }
        assessmentsByWeek[week].push(assessment);
    });
    
    // Sort weeks and assessments
    const sortedWeeks = Object.keys(assessmentsByWeek).sort();
    container.innerHTML = '';
    
    sortedWeeks.forEach(week => {
        const weekAssessments = assessmentsByWeek[week].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        const weekSection = document.createElement('div');
        weekSection.className = 'week-section';
        
        weekSection.innerHTML = `
            <div class="week-header">Week: ${getWeekDateRange(week)}</div>
            <div class="week-content">
                ${weekAssessments.map(assessment => createAssessmentCard(assessment)).join('')}
            </div>
        `;
        
        container.appendChild(weekSection);
    });
}

// Create Assessment Card
function createAssessmentCard(assessment) {
    const cls = classes.find(c => c.id == assessment.classId);
    const className = cls ? cls.name : 'Unknown Class';
    
    const assessmentDate = new Date(assessment.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="card ${assessment.status}">
            <div class="card-header">
                <div class="card-title">${assessment.name}</div>
                <div class="card-actions">
                    <button class="btn btn-delete" onclick="deleteAssessment(${assessment.id})">Delete</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <div class="info-label">Class</div>
                    <div class="info-value">${className}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date</div>
                    <div class="info-value">${assessmentDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${formatStatus(assessment.status)}</div>
                </div>
            </div>
            <div class="topics">
                <div class="topics-label">Topics Covered:</div>
                <div class="topics-content">${assessment.topics}</div>
            </div>
        </div>
    `;
}

// Delete Functions
function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        deleteAssignmentFromDB(id).then(() => {
            console.log('Assignment deleted successfully');
        }).catch((error) => {
            console.error('Error deleting assignment:', error);
            alert('Error deleting assignment. Please try again.');
        });
    }
}

function deleteAssessment(id) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        deleteAssessmentFromDB(id).then(() => {
            console.log('Assessment deleted successfully');
        }).catch((error) => {
            console.error('Error deleting assessment:', error);
            alert('Error deleting assessment. Please try again.');
        });
    }
}

// Format Status
function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}
