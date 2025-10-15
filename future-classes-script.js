// Future classes page script
let futureClasses = [];
let userDataRef = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            userDataRef = database.ref('users/' + user.uid);
            loadFutureClasses();
        }
    });
    
    setupFormHandlers();
});

// Load future classes from Firebase
function loadFutureClasses() {
    if (!userDataRef) return;
    
    userDataRef.child('futureClasses').on('value', (snapshot) => {
        futureClasses = [];
        snapshot.forEach((childSnapshot) => {
            futureClasses.push(childSnapshot.val());
        });
        renderFutureClasses();
    });
}

// Save future class to Firebase
function saveFutureClass(classData) {
    if (!userDataRef) return;
    return userDataRef.child('futureClasses').child(classData.id.toString()).set(classData);
}

// Delete future class from Firebase
function deleteFutureClass(classId) {
    if (!userDataRef) return;
    return userDataRef.child('futureClasses').child(classId.toString()).remove();
}

// Setup form handlers
function setupFormHandlers() {
    const futureClassForm = document.getElementById('futureClassForm');
    if (futureClassForm) {
        futureClassForm.addEventListener('submit', handleFutureClassSubmit);
    }
}

// Handle future class form submission
function handleFutureClassSubmit(e) {
    e.preventDefault();
    
    const className = document.getElementById('futureClassName').value.trim();
    
    // Check for duplicates
    const duplicateClass = futureClasses.find(cls => 
        cls.name.toLowerCase() === className.toLowerCase()
    );
    
    if (duplicateClass) {
        alert(`A future class named "${className}" already exists! Please use a different name.`);
        return;
    }
    
    const newClass = {
        id: Date.now(),
        name: className,
        code: document.getElementById('futureClassCode').value.trim(),
        startDate: document.getElementById('futureStartDate').value,
        endDate: document.getElementById('futureEndDate').value,
        semester: document.getElementById('futureSemester').value.trim(),
        notes: document.getElementById('futureNotes').value.trim()
    };
    
    saveFutureClass(newClass).then(() => {
        console.log('Future class saved successfully');
        e.target.reset();
        toggleModal('futureClassModal');
        alert('Future class added successfully!');
    }).catch((error) => {
        console.error('Error saving future class:', error);
        alert('Error adding future class. Please try again.');
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

// Render future classes
function renderFutureClasses() {
    const container = document.getElementById('futureClassesContainer');
    if (!container) return;
    
    if (futureClasses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-text">No future classes planned yet. Start planning your upcoming semesters!</div>
            </div>
        `;
        return;
    }
    
    // Group by semester
    const bySemester = {};
    futureClasses.forEach(cls => {
        const semester = cls.semester || 'Unspecified';
        if (!bySemester[semester]) {
            bySemester[semester] = [];
        }
        bySemester[semester].push(cls);
    });
    
    // Render by semester
    container.innerHTML = '';
    Object.keys(bySemester).sort().forEach(semester => {
        const semesterSection = document.createElement('div');
        semesterSection.style.marginBottom = '2rem';
        
        semesterSection.innerHTML = `
            <h3 style="color: #2c3e50; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3498db;">
                ${semester}
            </h3>
            <div class="classes-grid">
                ${bySemester[semester].map(cls => createFutureClassCard(cls)).join('')}
            </div>
        `;
        
        container.appendChild(semesterSection);
    });
}

// Create future class card HTML
function createFutureClassCard(cls) {
    const startDate = cls.startDate ? new Date(cls.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '';
    
    const endDate = cls.endDate ? new Date(cls.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '';
    
    return `
        <div class="class-card" style="border-left-color: #9b59b6">
            <div class="class-card-header">
                <div>
                    <div class="class-card-title">${cls.name}</div>
                    ${cls.code ? `<div class="class-card-code">${cls.code}</div>` : ''}
                </div>
                <button class="btn btn-delete" onclick="handleDeleteFutureClass(${cls.id})">Delete</button>
            </div>
            <div class="class-card-info">
                ${cls.semester ? `
                    <div class="class-card-info-item">
                        📅 ${cls.semester}
                    </div>
                ` : ''}
                ${startDate && endDate ? `
                    <div class="class-card-info-item">
                        📆 ${startDate} - ${endDate}
                    </div>
                ` : ''}
                ${cls.notes ? `
                    <div class="class-card-info-item" style="margin-top: 0.5rem; font-style: italic; color: #7f8c8d;">
                        ${cls.notes}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Handle delete future class
function handleDeleteFutureClass(classId) {
    if (confirm('Are you sure you want to delete this future class?')) {
        deleteFutureClass(classId).then(() => {
            console.log('Future class deleted successfully');
        }).catch((error) => {
            console.error('Error deleting future class:', error);
            alert('Error deleting future class. Please try again.');
        });
    }
}
