// Objeto global Meditrack
const Meditrack = {
    // Inicialización
    init: function() {
        console.log('Meditrack inicializado');
        // Inicializar almacenamiento local si no existe
        if (!localStorage.getItem('meditrack_users')) {
            localStorage.setItem('meditrack_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('meditrack_current_user')) {
            localStorage.setItem('meditrack_current_user', null);
        }
        if (!localStorage.getItem('meditrack_medications')) {
            localStorage.setItem('meditrack_medications', JSON.stringify([]));
        }
        if (!localStorage.getItem('meditrack_appointments')) {
            localStorage.setItem('meditrack_appointments', JSON.stringify([]));
        }
        if (!localStorage.getItem('meditrack_symptoms')) {
            localStorage.setItem('meditrack_symptoms', JSON.stringify([]));
        }
    },
    
    // Gestión de usuarios
    users: {
        add: function(user) {
            if (!user.id) user.id = 'user_' + Date.now();
            const users = JSON.parse(localStorage.getItem('meditrack_users')) || [];
            const existingUser = users.find(u => u.email === user.email);
            
            if (existingUser) {
                console.error('Usuario ya existe con ese email');
                return false;
            }
            
            users.push(user);
            localStorage.setItem('meditrack_users', JSON.stringify(users));
            return true;
        },
        
        get: function(userId) {
            const users = JSON.parse(localStorage.getItem('meditrack_users')) || [];
            return users.find(user => user.id === userId);
        },
        
        getByEmail: function(email) {
            const users = JSON.parse(localStorage.getItem('meditrack_users')) || [];
            return users.find(user => user.email === email);
        }
    },
    
    // Autenticación
    login: function(email, password) {
        const users = JSON.parse(localStorage.getItem('meditrack_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('meditrack_current_user', JSON.stringify(user));
            return true;
        }
        
        return false;
        },
        
        logout: function() {
        localStorage.setItem('meditrack_current_user', null);
        window.location.href = '../auth/login.html';
    },
    
    getCurrentUser: function() {
        const userData = localStorage.getItem('meditrack_current_user');
        if (userData && userData !== 'null') {
            return JSON.parse(userData);
        }
        return null;
    },
    
    // Gestión de medicamentos
    medications: {
        add: function(medication) {
            if (!medication.id) medication.id = 'med_' + Date.now();
            const medications = JSON.parse(localStorage.getItem('meditrack_medications')) || [];
            medications.push(medication);
            localStorage.setItem('meditrack_medications', JSON.stringify(medications));
            return medication;
        },
        
        getAll: function() {
            const currentUser = Meditrack.getCurrentUser();
            if (!currentUser) return [];
            
            const medications = JSON.parse(localStorage.getItem('meditrack_medications')) || [];
            return medications.filter(med => med.userId === currentUser.id);
        },
        
        getById: function(medicationId) {
            const medications = JSON.parse(localStorage.getItem('meditrack_medications')) || [];
            return medications.find(med => med.id === medicationId);
        },
        
        update: function(medication) {
            const medications = JSON.parse(localStorage.getItem('meditrack_medications')) || [];
            const index = medications.findIndex(med => med.id === medication.id);
            
            if (index !== -1) {
                medications[index] = medication;
                localStorage.setItem('meditrack_medications', JSON.stringify(medications));
                return true;
            }
            
            return false;
        },
        
        delete: function(medicationId) {
            const medications = JSON.parse(localStorage.getItem('meditrack_medications')) || [];
            const newMedications = medications.filter(med => med.id !== medicationId);
            
            localStorage.setItem('meditrack_medications', JSON.stringify(newMedications));
            return medications.length !== newMedications.length;
        }
    },
    
    // Gestión de citas
    appointments: {
        add: function(appointment) {
            if (!appointment.id) appointment.id = 'apt_' + Date.now();
            if (!appointment.userId) {
                const currentUser = Meditrack.getCurrentUser();
                if (currentUser) {
                    appointment.userId = currentUser.id;
                }
            }
            
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            appointments.push(appointment);
            localStorage.setItem('meditrack_appointments', JSON.stringify(appointments));
            console.log("Cita añadida:", appointment);
            return appointment;
        },
        
        getAll: function() {
            const currentUser = Meditrack.getCurrentUser();
            if (!currentUser) return [];
            
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            return appointments.filter(apt => apt.userId === currentUser.id);
        },
        
        getUpcoming: function() {
            const currentUser = Meditrack.getCurrentUser();
            if (!currentUser) return [];
            
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return appointments.filter(apt => {
                if (apt.userId !== currentUser.id) return false;
                
                const aptDate = new Date(apt.date + 'T' + (apt.time || '00:00:00'));
                return aptDate >= today;
            }).sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00:00'));
                return dateA - dateB;
            });
        },
        
        getPast: function() {
            const currentUser = Meditrack.getCurrentUser();
            if (!currentUser) return [];
            
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return appointments.filter(apt => {
                if (apt.userId !== currentUser.id) return false;
                
                const aptDate = new Date(apt.date + 'T' + (apt.time || '00:00:00'));
                return aptDate < today;
            }).sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00:00'));
                return dateB - dateA; // Orden descendente
            });
        },
        
        getById: function(appointmentId) {
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            return appointments.find(apt => apt.id === appointmentId);
        },
        
        update: function(appointment) {
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            const index = appointments.findIndex(apt => apt.id === appointment.id);
            
            if (index !== -1) {
                appointments[index] = appointment;
                localStorage.setItem('meditrack_appointments', JSON.stringify(appointments));
                return true;
            }
            
            return false;
        },
        
        delete: function(appointmentId) {
            const appointments = JSON.parse(localStorage.getItem('meditrack_appointments')) || [];
            const newAppointments = appointments.filter(apt => apt.id !== appointmentId);
            
            localStorage.setItem('meditrack_appointments', JSON.stringify(newAppointments));
            return appointments.length !== newAppointments.length;
        }
    },
    
    // Gestión de síntomas
    symptoms: {
        add: function(symptom) {
            if (!symptom.id) symptom.id = 'symptom_' + Date.now();
            if (!symptom.userId) {
                const currentUser = Meditrack.getCurrentUser();
                if (currentUser) {
                    symptom.userId = currentUser.id;
                }
            }
            
            const symptoms = JSON.parse(localStorage.getItem('meditrack_symptoms')) || [];
            symptoms.push(symptom);
            localStorage.setItem('meditrack_symptoms', JSON.stringify(symptoms));
            console.log("Síntoma añadido:", symptom);
            return symptom;
        },
        
        getAll: function() {
            const currentUser = Meditrack.getCurrentUser();
            if (!currentUser) return [];
            
            const symptoms = JSON.parse(localStorage.getItem('meditrack_symptoms')) || [];
            return symptoms.filter(symptom => symptom.userId === currentUser.id);
        },
        
        getById: function(symptomId) {
            const symptoms = JSON.parse(localStorage.getItem('meditrack_symptoms')) || [];
            return symptoms.find(symptom => symptom.id === symptomId);
        },
        
        update: function(symptom) {
            const symptoms = JSON.parse(localStorage.getItem('meditrack_symptoms')) || [];
            const index = symptoms.findIndex(s => s.id === symptom.id);
            
            if (index !== -1) {
                symptoms[index] = symptom;
                localStorage.setItem('meditrack_symptoms', JSON.stringify(symptoms));
                return true;
            }
            
            return false;
        },
        
        delete: function(symptomId) {
            const symptoms = JSON.parse(localStorage.getItem('meditrack_symptoms')) || [];
            const newSymptoms = symptoms.filter(symptom => symptom.id !== symptomId);
            
            localStorage.setItem('meditrack_symptoms', JSON.stringify(newSymptoms));
            return symptoms.length !== newSymptoms.length;
        }
    },
    
    // Utilidades
    utils: {
        formatDate: function(dateString) {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', options);
        },
        
        dateToString: function(date) {
            return date.toISOString().split('T')[0];
        }
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    Meditrack.init();
    
    // Solo para depuración y desarrollo - crear un usuario de ejemplo si no existe ninguno
    const users = JSON.parse(localStorage.getItem('meditrack_users')) || [];
    if (users.length === 0) {
        const testUser = {
            id: 'user_1',
            name: 'Usuario de Prueba',
            email: 'test@example.com',
            password: '123456',
            role: 'patient'
        };
        
        Meditrack.users.add(testUser);
        console.log('Usuario de prueba creado');
        
        // Iniciar sesión automáticamente con el usuario de prueba
        Meditrack.login(testUser.email, testUser.password);
        console.log('Sesión iniciada automáticamente con usuario de prueba');
    }
});
