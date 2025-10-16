// Data storage with Firebase
let classes = [];
let assignments = [];
let assessments = [];
let grades = [];
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
            const classData = childSnapshot.val();
            // Load only current classes for assignments/assessments
            if (!classData.type || classData.type === 'current') {
                classes.push(classData);
            }
        });
        populateClassDropdowns();
        
        // Determine which page and render
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'assessments.html') {
            renderAssessments();
        } else if (currentPage === 'assignments.html' || currentPage === '') {
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
        if (currentPage === 'assignments.html' || currentPage === '') {
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
    
    // Load grades
    userDataRef.child('grades').on('value', (snapshot) => {
        grades = [];
        snapshot.forEach((childSnapshot) => {
            grades.push(childSnapshot.val());
        });
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

function saveGrade(gradeData) {
    if (!userDataRef) return;
    return userDataRef.child('grades').child(gradeData.id.toString()).set(gradeData);
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

function deleteGradeFromDB(gradeId) {
    if (!userDataRef) return;
    return userDataRef.child('grades').child(gradeId.toString()).remove();
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
    
    const className = document.getElementById('className').value.trim();
    
    // Check if class with same name already exists (case-insensitive)
    const duplicateClass = classes.find(cls => 
        cls.name.toLowerCase() === className.toLowerCase()
    );
    
    if (duplicateClass) {
        alert(`A class named "${className}" already exists! Please use a different name.`);
        return;
    }
    
    const newClass = {
        id: Date.now(),
        name: className,
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
    
    const form = e.target;
    const editId = form.dataset.editId;
    
    if (editId) {
        // Update existing assignment
        const assignment = assignments.find(a => a.id == editId);
        assignment.classId = document.getElementById('assignmentClass').value;
        assignment.name = document.getElementById('assignmentName').value;
        assignment.type = document.getElementById('assignmentType').value;
        assignment.dueDate = document.getElementById('assignmentDue').value;
        assignment.status = document.getElementById('assignmentStatus').value;
        
        saveAssignment(assignment).then(() => {
            console.log('Assignment updated successfully');
            
            // Update the linked grade entry
            const linkedGrade = grades.find(g => g.linkedAssignmentId == editId);
            if (linkedGrade) {
                linkedGrade.classId = assignment.classId;
                linkedGrade.taskName = assignment.name;
                linkedGrade.taskType = assignment.type;
                linkedGrade.date = assignment.dueDate;
                saveGrade(linkedGrade);
            }
            
            form.reset();
            delete form.dataset.editId;
            document.querySelector('#assignmentModal h3').textContent = 'Add New Assignment';
            toggleModal('assignmentModal');
        }).catch((error) => {
            console.error('Error updating assignment:', error);
            alert('Error updating assignment. Please try again.');
        });
    } else {
        // Create new assignment
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
            
            // Automatically create a grade entry for this assignment
            const newGrade = {
                id: Date.now() + 1, // Slightly different ID
                classId: newAssignment.classId,
                taskName: newAssignment.name,
                taskType: newAssignment.type,
                pointsEarned: 0,
                pointsTotal: 0,
                weight: null,
                date: newAssignment.dueDate,
                linkedAssignmentId: newAssignment.id
            };
            
            saveGrade(newGrade).then(() => {
                console.log('Grade entry created automatically');
            }).catch((error) => {
                console.error('Error creating grade entry:', error);
            });
            
            e.target.reset();
            toggleModal('assignmentModal');
        }).catch((error) => {
            console.error('Error saving assignment. Please try again.');
            alert('Error adding assignment. Please try again.');
        });
    }
}

// Handle Assessment Form Submission
function handleAssessmentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.dataset.editId;
    
    if (editId) {
        // Update existing assessment
        const assessment = assessments.find(a => a.id == editId);
        assessment.classId = document.getElementById('assessmentClass').value;
        assessment.name = document.getElementById('assessmentName').value;
        assessment.date = document.getElementById('assessmentDate').value;
        assessment.topics = document.getElementById('assessmentTopics').value;
        assessment.status = document.getElementById('assessmentStatus').value;
        
        saveAssessment(assessment).then(() => {
            console.log('Assessment updated successfully');
            
            // Update the linked grade entry
            const linkedGrade = grades.find(g => g.linkedAssessmentId == editId);
            if (linkedGrade) {
                linkedGrade.classId = assessment.classId;
                linkedGrade.taskName = assessment.name;
                linkedGrade.date = assessment.date;
                saveGrade(linkedGrade);
            }
            
            form.reset();
            delete form.dataset.editId;
            document.querySelector('#assessmentModal h3').textContent = 'Add New Assessment';
            toggleModal('assessmentModal');
        }).catch((error) => {
            console.error('Error updating assessment:', error);
            alert('Error updating assessment. Please try again.');
        });
    } else {
        // Create new assessment
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
            
            // Automatically create a grade entry for this assessment
            const newGrade = {
                id: Date.now() + 1, // Slightly different ID
                classId: newAssessment.classId,
                taskName: newAssessment.name,
                taskType: 'Exam', // Assessments are typically exams
                pointsEarned: 0,
                pointsTotal: 0,
                weight: null,
                date: newAssessment.date,
                linkedAssessmentId: newAssessment.id
            };
            
            saveGrade(newGrade).then(() => {
                console.log('Grade entry created automatically');
            }).catch((error) => {
                console.error('Error creating grade entry:', error);
            });
            
            e.target.reset();
            toggleModal('assessmentModal');
        }).catch((error) => {
            console.error('Error saving assessment:', error);
            alert('Error adding assessment. Please try again.');
        });
    }
}

// Populate Class Dropdowns
function populateClassDropdowns() {
    const assignmentClassSelect = document.getElementById('assignmentClass');
    const assessmentClassSelect = document.getElementById('assessmentClass');
    const assignmentFilter = document.getElementById('classFilter');
    
    // Populate assignment class select
    if (assignmentClassSelect) {
        assignmentClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            assignmentClassSelect.appendChild(option);
        });
    }
    
    // Populate assessment class select
    if (assessmentClassSelect) {
        assessmentClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            assessmentClassSelect.appendChild(option);
        });
    }
    
    // Populate filter dropdown
    if (assignmentFilter) {
        const currentValue = assignmentFilter.value;
        assignmentFilter.innerHTML = '<option value="">All Classes</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            assignmentFilter.appendChild(option);
        });
        assignmentFilter.value = currentValue;
    }
}

// Filter assignments by class
function filterAssignments() {
    renderAssignments();
}

// Filter assessments by class
function filterAssessments() {
    renderAssessments();
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
    
    // Get filter value
    const filterSelect = document.getElementById('classFilter');
    const filterClassId = filterSelect ? filterSelect.value : '';
    
    // Filter assignments
    let filteredAssignments = assignments;
    if (filterClassId) {
        filteredAssignments = assignments.filter(a => a.classId == filterClassId);
    }
    
    if (filteredAssignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div class="empty-state-text">${filterClassId ? 'No assignments for this class.' : 'No assignments yet. Add your first assignment to get started!'}</div>
            </div>
        `;
        return;
    }
    
    // Group assignments by week
    const assignmentsByWeek = {};
    filteredAssignments.forEach(assignment => {
        const week = getWeekNumber(assignment.dueDate);
        if (!assignmentsByWeek[week]) {
            assignmentsByWeek[week] = [];
        }
        assignmentsByWeek[week].push(assignment);
    });
    
    // Separate completed weeks from incomplete weeks
    const incompleteWeeks = [];
    const completedWeeks = [];
    
    Object.keys(assignmentsByWeek).forEach(week => {
        const weekAssignments = assignmentsByWeek[week];
        const allCompleted = weekAssignments.every(assignment => assignment.status === 'completed');
        
        if (allCompleted) {
            completedWeeks.push(week);
        } else {
            incompleteWeeks.push(week);
        }
    });
    
    // Sort incomplete weeks chronologically (earliest first - current work on top)
    incompleteWeeks.sort();
    
    // Sort completed weeks chronologically (oldest first - will be at bottom)
    completedWeeks.sort();
    
    // Combine: incomplete weeks first, then completed weeks
    const sortedWeeks = [...incompleteWeeks, ...completedWeeks];
    
    container.innerHTML = '';
    
    sortedWeeks.forEach(week => {
        const weekAssignments = assignmentsByWeek[week].sort((a, b) => 
            new Date(a.dueDate) - new Date(b.dueDate)
        );
        
        const allCompleted = weekAssignments.every(assignment => assignment.status === 'completed');
        
        const weekSection = document.createElement('div');
        weekSection.className = allCompleted ? 'week-section week-completed' : 'week-section';
        
        const weekId = `week-${week.replace(/\W/g, '-')}`;
        
        weekSection.innerHTML = `
            <div class="week-header" onclick="toggleWeekSection('${weekId}')">
                <span class="collapse-icon" id="${weekId}-icon">▼</span>
                ${allCompleted ? '✓ ' : ''}Week: ${getWeekDateRange(week)}
                ${allCompleted ? '<span class="completed-badge">All Done!</span>' : ''}
            </div>
            <div class="week-content" id="${weekId}">
                ${weekAssignments.map(assignment => createAssignmentCard(assignment)).join('')}
            </div>
        `;
        
        container.appendChild(weekSection);
    });
}

// Toggle week section visibility
function toggleWeekSection(weekId) {
    const content = document.getElementById(weekId);
    const icon = document.getElementById(`${weekId}-icon`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
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
                    <button class="btn btn-edit" onclick="editAssignment(${assignment.id})">Edit</button>
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
    
    // Get filter value
    const filterSelect = document.getElementById('classFilter');
    const filterClassId = filterSelect ? filterSelect.value : '';
    
    // Filter assessments
    let filteredAssessments = assessments;
    if (filterClassId) {
        filteredAssessments = assessments.filter(a => a.classId == filterClassId);
    }
    
    if (filteredAssessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">${filterClassId ? 'No assessments for this class.' : 'No assessments yet. Add your first assessment to get started!'}</div>
            </div>
        `;
        return;
    }
    
    // Group assessments by week
    const assessmentsByWeek = {};
    filteredAssessments.forEach(assessment => {
        const week = getWeekNumber(assessment.date);
        if (!assessmentsByWeek[week]) {
            assessmentsByWeek[week] = [];
        }
        assessmentsByWeek[week].push(assessment);
    });
    
    // Separate completed weeks from incomplete weeks
    const incompleteWeeks = [];
    const completedWeeks = [];
    
    Object.keys(assessmentsByWeek).forEach(week => {
        const weekAssessments = assessmentsByWeek[week];
        const allCompleted = weekAssessments.every(assessment => assessment.status === 'completed');
        
        if (allCompleted) {
            completedWeeks.push(week);
        } else {
            incompleteWeeks.push(week);
        }
    });
    
    // Sort incomplete weeks chronologically (earliest first - current work on top)
    incompleteWeeks.sort();
    
    // Sort completed weeks chronologically (oldest first - will be at bottom)
    completedWeeks.sort();
    
    // Combine: incomplete weeks first, then completed weeks
    const sortedWeeks = [...incompleteWeeks, ...completedWeeks];
    
    container.innerHTML = '';
    
    sortedWeeks.forEach(week => {
        const weekAssessments = assessmentsByWeek[week].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        const allCompleted = weekAssessments.every(assessment => assessment.status === 'completed');
        
        const weekSection = document.createElement('div');
        weekSection.className = allCompleted ? 'week-section week-completed' : 'week-section';
        
        const weekId = `week-assess-${week.replace(/\W/g, '-')}`;
        
        weekSection.innerHTML = `
            <div class="week-header" onclick="toggleWeekSection('${weekId}')">
                <span class="collapse-icon" id="${weekId}-icon">▼</span>
                ${allCompleted ? '✓ ' : ''}Week: ${getWeekDateRange(week)}
                ${allCompleted ? '<span class="completed-badge">All Done!</span>' : ''}
            </div>
            <div class="week-content" id="${weekId}">
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
                    <button class="btn btn-edit" onclick="editAssessment(${assessment.id})">Edit</button>
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
// Edit Assignment
function editAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    
    // Pre-fill the form
    document.getElementById('assignmentName').value = assignment.name;
    document.getElementById('assignmentClass').value = assignment.classId;
    document.getElementById('assignmentType').value = assignment.type;
    document.getElementById('assignmentDueDate').value = assignment.dueDate;
    document.getElementById('assignmentStatus').value = assignment.status;
    
    // Change form submit behavior to update instead of create
    const form = document.getElementById('assignmentForm');
    form.dataset.editId = id;
    
    // Change modal title
    const modal = document.getElementById('assignmentModal');
    const title = modal.querySelector('h3');
    title.textContent = 'Edit Assignment';
    
    // Show modal
    toggleModal('assignmentModal');
}

// Edit Assessment
function editAssessment(id) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return;
    
    // Pre-fill the form
    document.getElementById('assessmentName').value = assessment.name;
    document.getElementById('assessmentClass').value = assessment.classId;
    document.getElementById('assessmentDate').value = assessment.date;
    document.getElementById('assessmentTopics').value = assessment.topics;
    document.getElementById('assessmentStatus').value = assessment.status;
    
    // Change form submit behavior to update instead of create
    const form = document.getElementById('assessmentForm');
    form.dataset.editId = id;
    
    // Change modal title
    const modal = document.getElementById('assessmentModal');
    const title = modal.querySelector('h3');
    title.textContent = 'Edit Assessment';
    
    // Show modal
    toggleModal('assessmentModal');
}

// Delete Functions
function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        // Also delete the linked grade entry
        const linkedGrade = grades.find(g => g.linkedAssignmentId === id);
        if (linkedGrade) {
            deleteGradeFromDB(linkedGrade.id).then(() => {
                console.log('Linked grade deleted');
            });
        }
        
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
        // Also delete the linked grade entry
        const linkedGrade = grades.find(g => g.linkedAssessmentId === id);
        if (linkedGrade) {
            deleteGradeFromDB(linkedGrade.id).then(() => {
                console.log('Linked grade deleted');
            });
        }
        
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
