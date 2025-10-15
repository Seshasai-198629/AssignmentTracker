// Grades page script
let classes = [];
let grades = [];
let userDataRef = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            userDataRef = database.ref('users/' + user.uid);
            loadData();
        }
    });
    
    setupFormHandlers();
});

// Load data from Firebase
function loadData() {
    if (!userDataRef) return;
    
    // Load classes (current only)
    userDataRef.child('classes').on('value', (snapshot) => {
        classes = [];
        snapshot.forEach((childSnapshot) => {
            const classData = childSnapshot.val();
            if (!classData.type || classData.type === 'current') {
                classes.push(classData);
            }
        });
        populateClassDropdown();
        renderGrades();
    });
    
    // Load grades
    userDataRef.child('grades').on('value', (snapshot) => {
        grades = [];
        snapshot.forEach((childSnapshot) => {
            grades.push(childSnapshot.val());
        });
        renderGrades();
    });
}

// Save grade to Firebase
function saveGrade(gradeData) {
    if (!userDataRef) return;
    return userDataRef.child('grades').child(gradeData.id.toString()).set(gradeData);
}

// Delete grade from Firebase
function deleteGrade(gradeId) {
    if (!userDataRef) return;
    return userDataRef.child('grades').child(gradeId.toString()).remove();
}

// Setup form handlers
function setupFormHandlers() {
    const gradeForm = document.getElementById('gradeForm');
    if (gradeForm) {
        gradeForm.addEventListener('submit', handleGradeSubmit);
    }
}

// Populate class dropdown
function populateClassDropdown() {
    const gradeClassSelect = document.getElementById('gradeClass');
    if (gradeClassSelect) {
        gradeClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            gradeClassSelect.appendChild(option);
        });
    }
}

// Handle grade form submission
function handleGradeSubmit(e) {
    e.preventDefault();
    
    const earned = parseFloat(document.getElementById('gradeEarned').value);
    const total = parseFloat(document.getElementById('gradeTotal').value);
    
    if (earned > total) {
        alert('Points earned cannot be greater than points possible!');
        return;
    }
    
    const newGrade = {
        id: Date.now(),
        classId: document.getElementById('gradeClass').value,
        taskName: document.getElementById('gradeTaskName').value.trim(),
        taskType: document.getElementById('gradeTaskType').value,
        pointsEarned: earned,
        pointsTotal: total,
        weight: document.getElementById('gradeWeight').value ? parseFloat(document.getElementById('gradeWeight').value) : null,
        date: document.getElementById('gradeDate').value
    };
    
    saveGrade(newGrade).then(() => {
        console.log('Grade saved successfully');
        e.target.reset();
        toggleModal('gradeModal');
    }).catch((error) => {
        console.error('Error saving grade:', error);
        alert('Error adding grade. Please try again.');
    });
}

// Modal functions
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        if (modalId === 'gradeModal') {
            populateClassDropdown();
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Render grades
function renderGrades() {
    const container = document.getElementById('gradesContainer');
    if (!container) return;
    
    if (grades.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">No grades yet. Add your first grade to start tracking your performance!</div>
            </div>
        `;
        return;
    }
    
    // Group grades by class
    const gradesByClass = {};
    grades.forEach(grade => {
        if (!gradesByClass[grade.classId]) {
            gradesByClass[grade.classId] = [];
        }
        gradesByClass[grade.classId].push(grade);
    });
    
    container.innerHTML = '';
    
    // Render each class section
    Object.keys(gradesByClass).forEach(classId => {
        const cls = classes.find(c => c.id == classId);
        const className = cls ? cls.name : 'Unknown Class';
        const classGrades = gradesByClass[classId];
        
        // Calculate average
        const average = calculateClassAverage(classGrades);
        const ungradedCount = classGrades.filter(g => g.pointsTotal === 0).length;
        
        const classSection = document.createElement('div');
        classSection.className = 'grade-class-section';
        
        classSection.innerHTML = `
            <div class="grade-class-header">
                <div>
                    <div class="grade-class-title">${className}</div>
                    ${ungradedCount > 0 ? `
                        <div style="font-size: 0.9rem; color: #f39c12; margin-top: 0.25rem;">
                            ⚠️ ${ungradedCount} task${ungradedCount > 1 ? 's' : ''} not graded yet
                        </div>
                    ` : ''}
                </div>
                <div class="grade-class-average" style="color: ${getGradeColor(average)}">
                    ${average.toFixed(1)}%
                </div>
            </div>
            <div class="grade-items">
                ${classGrades.sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(grade => createGradeItem(grade)).join('')}
            </div>
        `;
        
        container.appendChild(classSection);
    });
}

// Calculate class average
function calculateClassAverage(classGrades) {
    if (classGrades.length === 0) return 0;
    
    // Filter out grades that have 0 for both earned and total (not yet graded)
    const gradedTasks = classGrades.filter(g => g.pointsTotal > 0);
    
    if (gradedTasks.length === 0) return 0;
    
    // Check if any grades have weights
    const hasWeights = gradedTasks.some(g => g.weight !== null && g.weight !== undefined && g.weight > 0);
    
    if (hasWeights) {
        // Weighted average
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        gradedTasks.forEach(grade => {
            const percentage = (grade.pointsEarned / grade.pointsTotal) * 100;
            const weight = grade.weight || 0;
            totalWeightedScore += percentage * weight;
            totalWeight += weight;
        });
        
        return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    } else {
        // Simple average
        const totalPercentage = gradedTasks.reduce((sum, grade) => {
            return sum + (grade.pointsEarned / grade.pointsTotal) * 100;
        }, 0);
        
        return totalPercentage / gradedTasks.length;
    }
}

// Create grade item HTML
function createGradeItem(grade) {
    const percentage = grade.pointsTotal > 0 ? (grade.pointsEarned / grade.pointsTotal) * 100 : 0;
    const gradeColor = getGradeColor(percentage);
    
    const date = new Date(grade.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const isUngraded = grade.pointsTotal === 0;
    
    return `
        <div class="grade-item ${isUngraded ? 'grade-item-ungraded' : ''}">
            <div>
                <div class="grade-item-name">${grade.taskName}</div>
                <div class="grade-item-type">${grade.taskType} • ${date}</div>
            </div>
            <div class="grade-item-score-edit">
                <input type="number" 
                       class="grade-input" 
                       step="0.01" 
                       min="0"
                       value="${grade.pointsEarned}" 
                       onchange="updateGradePoints(${grade.id}, 'earned', this.value)"
                       placeholder="Earned"
                       ${isUngraded ? 'style="border-color: #f39c12;"' : ''}>
                <span style="margin: 0 0.5rem;">/</span>
                <input type="number" 
                       class="grade-input" 
                       step="0.01" 
                       min="0"
                       value="${grade.pointsTotal}" 
                       onchange="updateGradePoints(${grade.id}, 'total', this.value)"
                       placeholder="Total"
                       ${isUngraded ? 'style="border-color: #f39c12;"' : ''}>
            </div>
            <div class="grade-item-percentage" style="color: ${isUngraded ? '#7f8c8d' : gradeColor}">
                ${isUngraded ? 'Not Graded' : percentage.toFixed(1) + '%'}
            </div>
            <div class="grade-item-weight-edit">
                <input type="number" 
                       class="grade-input-small" 
                       step="0.01" 
                       min="0"
                       max="100"
                       value="${grade.weight || ''}" 
                       onchange="updateGradePoints(${grade.id}, 'weight', this.value)"
                       placeholder="Weight %">
            </div>
            <button class="btn btn-delete" onclick="handleDeleteGrade(${grade.id})">Delete</button>
        </div>
    `;
}

// Update grade points (earned, total, or weight)
function updateGradePoints(gradeId, field, value) {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;
    
    const numValue = value === '' ? null : parseFloat(value);
    
    if (field === 'earned') {
        grade.pointsEarned = numValue || 0;
    } else if (field === 'total') {
        grade.pointsTotal = numValue || 0;
    } else if (field === 'weight') {
        grade.weight = numValue;
    }
    
    // Validate earned <= total
    if (field === 'earned' && grade.pointsTotal > 0 && grade.pointsEarned > grade.pointsTotal) {
        alert('Points earned cannot exceed points total!');
        grade.pointsEarned = grade.pointsTotal;
    }
    
    // Save to Firebase
    saveGrade(grade).then(() => {
        console.log('Grade updated successfully');
        // Grades will automatically re-render due to Firebase listener
    }).catch((error) => {
        console.error('Error updating grade:', error);
        alert('Error updating grade. Please try again.');
    });
}

// Get color based on percentage
function getGradeColor(percentage) {
    if (percentage >= 90) return '#27ae60';
    if (percentage >= 80) return '#2ecc71';
    if (percentage >= 70) return '#f39c12';
    if (percentage >= 60) return '#e67e22';
    return '#e74c3c';
}

// Handle delete grade
function handleDeleteGrade(gradeId) {
    if (confirm('Are you sure you want to delete this grade entry?')) {
        deleteGrade(gradeId).then(() => {
            console.log('Grade deleted successfully');
        }).catch((error) => {
            console.error('Error deleting grade:', error);
            alert('Error deleting grade. Please try again.');
        });
    }
}
