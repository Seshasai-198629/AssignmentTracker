// Classes page script
let classes = [];
let grades = [];
let userDataRef = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            userDataRef = database.ref('users/' + user.uid);
            loadClasses();
            loadGrades();
            // Check for class migrations on page load
            checkAndMigrateClasses();
        }
    });
    
    setupFormHandlers();
});

// Load classes from Firebase
function loadClasses() {
    if (!userDataRef) return;
    
    userDataRef.child('classes').on('value', (snapshot) => {
        classes = [];
        snapshot.forEach((childSnapshot) => {
            const classData = childSnapshot.val();
            // Load current and past classes
            if (!classData.type || classData.type === 'current' || classData.type === 'past') {
                classes.push(classData);
            }
        });
        renderClasses();
    });
}

// Load grades from Firebase
function loadGrades() {
    if (!userDataRef) return;
    
    userDataRef.child('grades').on('value', (snapshot) => {
        grades = [];
        snapshot.forEach((childSnapshot) => {
            grades.push(childSnapshot.val());
        });
    });
}

// Check and migrate classes based on dates
function checkAndMigrateClasses() {
    if (!userDataRef) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check future classes that should become current
    userDataRef.child('futureClasses').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const futureClass = childSnapshot.val();
            if (futureClass.startDate) {
                const startDate = new Date(futureClass.startDate);
                startDate.setHours(0, 0, 0, 0);
                
                // If start date has arrived or passed, move to current classes
                if (today >= startDate) {
                    // Add to current classes
                    const currentClass = {
                        ...futureClass,
                        type: 'current'
                    };
                    userDataRef.child('classes').child(futureClass.id.toString()).set(currentClass);
                    
                    // Remove from future classes
                    userDataRef.child('futureClasses').child(futureClass.id.toString()).remove();
                    
                    console.log(`Migrated ${futureClass.name} from future to current`);
                }
            }
        });
    });
    
    // Check current classes that should become past
    userDataRef.child('classes').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const currentClass = childSnapshot.val();
            if (currentClass.type === 'current' && currentClass.endDate) {
                const endDate = new Date(currentClass.endDate);
                endDate.setHours(0, 0, 0, 0);
                
                // If end date has passed, mark as past
                if (today > endDate) {
                    const pastClass = {
                        ...currentClass,
                        type: 'past'
                    };
                    userDataRef.child('classes').child(currentClass.id.toString()).set(pastClass);
                    
                    console.log(`Migrated ${currentClass.name} from current to past`);
                }
            }
        });
    });
}

// Save class to Firebase
function saveClass(classData) {
    if (!userDataRef) return;
    return userDataRef.child('classes').child(classData.id.toString()).set(classData);
}

// Delete class from Firebase
function deleteClass(classId) {
    if (!userDataRef) return;
    return userDataRef.child('classes').child(classId.toString()).remove();
}

// Setup form handlers
function setupFormHandlers() {
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', handleClassSubmit);
    }
}

// Handle class form submission
function handleClassSubmit(e) {
    e.preventDefault();
    
    const className = document.getElementById('className').value.trim();
    
    // Check for duplicates
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
        code: document.getElementById('classCode').value.trim(),
        startDate: document.getElementById('classStart').value,
        endDate: document.getElementById('classEnd').value,
        instructor: document.getElementById('classInstructor').value.trim(),
        type: 'current' // Mark as current class
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

// Modal functions
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Render classes
function renderClasses() {
    const container = document.getElementById('classesContainer');
    if (!container) return;
    
    if (classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div class="empty-state-text">No current classes yet. Add your first class to get started!</div>
            </div>
        `;
        return;
    }
    
    // Separate into current and past classes
    const currentClasses = classes.filter(cls => !cls.type || cls.type === 'current');
    const pastClasses = classes.filter(cls => cls.type === 'past');
    
    // Sort by start date
    currentClasses.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    pastClasses.sort((a, b) => new Date(b.endDate) - new Date(a.endDate)); // Most recent first
    
    container.innerHTML = '';
    
    // Render current classes section
    if (currentClasses.length > 0) {
        const currentSection = document.createElement('div');
        currentSection.className = 'class-section';
        currentSection.innerHTML = `
            <h3 class="section-title active-section">📚 Active Classes</h3>
            <div class="classes-grid">
                ${currentClasses.map(cls => createClassCard(cls, false)).join('')}
            </div>
        `;
        container.appendChild(currentSection);
    }
    
    // Render past classes section
    if (pastClasses.length > 0) {
        const pastSection = document.createElement('div');
        pastSection.className = 'class-section past-section';
        pastSection.innerHTML = `
            <h3 class="section-title past-section-title">🎓 Past Classes</h3>
            <div class="classes-grid">
                ${pastClasses.map(cls => createClassCard(cls, true)).join('')}
            </div>
        `;
        container.appendChild(pastSection);
    }
}

// Create class card HTML
function createClassCard(cls, isPast = false) {
    const startDate = new Date(cls.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const endDate = new Date(cls.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Check if class is currently active (for current classes only)
    const today = new Date();
    const start = new Date(cls.startDate);
    const end = new Date(cls.endDate);
    const isActive = !isPast && (today >= start && today <= end);
    
    // Calculate final grade for past classes
    let finalGrade = null;
    if (isPast) {
        const classGrades = grades.filter(g => g.classId == cls.id);
        finalGrade = calculateFinalGrade(classGrades);
    }
    
    // Determine border color
    const borderColor = isPast ? '#e74c3c' : (isActive ? '#27ae60' : '#3498db');
    
    return `
        <div class="class-card ${isPast ? 'past-class-card' : ''}" style="border-left-color: ${borderColor}">
            <div class="class-card-header">
                <div>
                    <div class="class-card-title">${cls.name}</div>
                    ${cls.code ? `<div class="class-card-code">${cls.code}</div>` : ''}
                </div>
                <button class="btn btn-delete" onclick="handleDeleteClass(${cls.id})">Delete</button>
            </div>
            <div class="class-card-info">
                ${cls.instructor ? `
                    <div class="class-card-info-item">
                        👨‍🏫 ${cls.instructor}
                    </div>
                ` : ''}
                <div class="class-card-info-item">
                    📅 ${startDate} - ${endDate}
                </div>
                ${isActive && !isPast ? `
                    <div class="class-card-info-item" style="color: #27ae60; font-weight: bold;">
                        ✅ Currently Active
                    </div>
                ` : ''}
                ${isPast && finalGrade !== null ? `
                    <div class="class-card-info-item final-grade">
                        🎓 Final Grade: <span class="grade-value ${getGradeColor(finalGrade)}">${finalGrade.toFixed(2)}%</span>
                    </div>
                ` : ''}
                ${isPast && finalGrade === null ? `
                    <div class="class-card-info-item" style="color: #7f8c8d; font-style: italic;">
                        No grades recorded
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Calculate final grade from grades array
function calculateFinalGrade(classGrades) {
    if (classGrades.length === 0) return null;
    
    // Filter out grades that have 0 for both earned and total (not yet graded)
    const gradedTasks = classGrades.filter(g => g.pointsTotal > 0);
    
    if (gradedTasks.length === 0) return null;
    
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
        
        return totalWeight > 0 ? totalWeightedScore / totalWeight : null;
    } else {
        // Simple average
        const totalPercentage = gradedTasks.reduce((sum, grade) => {
            return sum + (grade.pointsEarned / grade.pointsTotal) * 100;
        }, 0);
        
        return totalPercentage / gradedTasks.length;
    }
}

// Get grade color class
function getGradeColor(grade) {
    if (grade >= 90) return 'grade-a';
    if (grade >= 80) return 'grade-b';
    if (grade >= 70) return 'grade-c';
    if (grade >= 60) return 'grade-d';
    return 'grade-f';
}

// Handle delete class
function handleDeleteClass(classId) {
    if (confirm('Are you sure you want to delete this class? This will NOT delete associated assignments or assessments.')) {
        deleteClass(classId).then(() => {
            console.log('Class deleted successfully');
        }).catch((error) => {
            console.error('Error deleting class:', error);
            alert('Error deleting class. Please try again.');
        });
    }
}
