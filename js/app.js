/**
 * Meditrack - Aplicación de gestión de salud
 * Archivo JavaScript principal con funcionalidades comunes
 */

// Objeto global para la aplicación
const Meditrack = {
  // Inicialización de la aplicación
  init: function() {
    // Inicializar el menú móvil
    this.initMobileMenu();
    
    // Inicializar notificaciones
    this.initNotifications();
    
    // Comprobar autenticación simulada
    this.checkAuth();
  },
  
  // Inicializar menú móvil
  initMobileMenu: function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
      });
    }
  },
  
  // Inicializar notificaciones
  initNotifications: function() {
    // Comprobar si el navegador soporta notificaciones
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones.");
      return;
    }
    
    // Pedir permiso para mostrar notificaciones
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          console.log("Permiso para notificaciones concedido");
        }
      });
    }
  },
  
  // Mostrar una notificación
  showNotification: function(title, options = {}) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, options);
      return notification;
    }
  },
  
  // Comprobar si el usuario está "autenticado" (simulado)
  checkAuth: function() {
    const currentUser = this.getCurrentUser();
    const publicPages = ['index.html', 'login.html', 'register.html', 'faq.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Si no es una página pública y no hay usuario, redirigir al login
    if (!publicPages.includes(currentPage) && !currentUser) {
      window.location.href = 'login.html';
    }
  },
  
  // Obtener usuario actual (simulado)
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem('currentUser'));
  },
  
  // Establecer usuario actual (simulado)
  setCurrentUser: function(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  // Cerrar sesión (simulado)
  logout: function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  },
  
  // Funciones para gestión de medicamentos
  medications: {
    // Obtener todos los medicamentos
    getAll: function() {
      return JSON.parse(localStorage.getItem('medications')) || [];
    },
    
    // Añadir un medicamento
    add: function(medication) {
      const medications = this.getAll();
      medication.id = Date.now().toString(); // ID único basado en timestamp
      medications.push(medication);
      localStorage.setItem('medications', JSON.stringify(medications));
      return medication;
    },
    
    // Obtener un medicamento por su ID
    getById: function(id) {
      const medications = this.getAll();
      return medications.find(med => med.id === id);
    },
    
    // Actualizar un medicamento
    update: function(updatedMedication) {
      const medications = this.getAll();
      const index = medications.findIndex(med => med.id === updatedMedication.id);
      
      if (index !== -1) {
        medications[index] = updatedMedication;
        localStorage.setItem('medications', JSON.stringify(medications));
        return true;
      }
      return false;
    },
    
    // Eliminar un medicamento
    delete: function(id) {
      let medications = this.getAll();
      medications = medications.filter(med => med.id !== id);
      localStorage.setItem('medications', JSON.stringify(medications));
    },
    
    // Marcar una dosis como tomada
    takeDose: function(medicationId, timestamp = Date.now()) {
      const medication = this.getById(medicationId);
      
      if (medication) {
        if (!medication.doses) {
          medication.doses = [];
        }
        
        medication.doses.push({
          timestamp: timestamp,
          taken: true
        });
        
        // Actualizar puntos de gamificación
        const user = Meditrack.getCurrentUser();
        if (user) {
          if (!user.points) user.points = 0;
          user.points += 10; // 10 puntos por tomar medicación
          Meditrack.setCurrentUser(user);
        }
        
        return this.update(medication);
      }
      return false;
    },
    
    // Comprobar si una medicación tiene dosis pendientes
    hasPendingDoses: function(medication) {
      // Si no tiene horario definido o está inactivo, no hay dosis pendientes
      if (!medication.schedule || !medication.active) return false;
      
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Verificar si la medicación debe tomarse hoy
      if (medication.schedule.specificDays) {
        const dayOfWeek = now.getDay(); // 0-6 (Domingo-Sábado)
        if (!medication.schedule.specificDays.includes(dayOfWeek)) {
          return false;
        }
      }
      
      // Verificar si ya se ha tomado todas las dosis de hoy
      let dosesToday = 0;
      let dosesTaken = 0;
      
      if (medication.schedule.frequency === 'daily') {
        dosesToday = medication.schedule.timesPerDay || 1;
      } else if (medication.schedule.frequency === 'specific-times' && medication.schedule.times) {
        dosesToday = medication.schedule.times.length;
      }
      
      // Contar dosis tomadas hoy
      if (medication.doses) {
        dosesTaken = medication.doses.filter(dose => {
          const doseDate = new Date(dose.timestamp).toISOString().split('T')[0];
          return doseDate === today && dose.taken;
        }).length;
      }
      
      return dosesTaken < dosesToday;
    },
    
    // Obtener medicamentos con dosis pendientes para hoy
    getPendingMedications: function() {
      const medications = this.getAll();
      return medications.filter(med => this.hasPendingDoses(med));
    }
  },
  
  // Funciones para gestión de citas
  appointments: {
    // Obtener todas las citas
    getAll: function() {
      return JSON.parse(localStorage.getItem('appointments')) || [];
    },
    
    // Añadir una cita
    add: function(appointment) {
      const appointments = this.getAll();
      appointment.id = Date.now().toString(); // ID único basado en timestamp
      appointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(appointments));
      return appointment;
    },
    
    // Obtener una cita por su ID
    getById: function(id) {
      const appointments = this.getAll();
      return appointments.find(apt => apt.id === id);
    },
    
    // Actualizar una cita
    update: function(updatedAppointment) {
      const appointments = this.getAll();
      const index = appointments.findIndex(apt => apt.id === updatedAppointment.id);
      
      if (index !== -1) {
        appointments[index] = updatedAppointment;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        return true;
      }
      return false;
    },
    
    // Eliminar una cita
    delete: function(id) {
      let appointments = this.getAll();
      appointments = appointments.filter(apt => apt.id !== id);
      localStorage.setItem('appointments', JSON.stringify(appointments));
    },
    
    // Obtener citas futuras
    getUpcoming: function() {
      const appointments = this.getAll();
      const now = new Date();
      
      return appointments.filter(apt => {
        const appointmentDate = new Date(apt.date + 'T' + apt.time);
        return appointmentDate > now;
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      });
    },
    
    // Obtener citas pasadas
    getPast: function() {
      const appointments = this.getAll();
      const now = new Date();
      
      return appointments.filter(apt => {
        const appointmentDate = new Date(apt.date + 'T' + apt.time);
        return appointmentDate <= now;
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA; // Ordenar de más reciente a más antigua
      });
    }
  },
  
  // Funciones para gestión de síntomas
  symptoms: {
    // Obtener todos los registros de síntomas
    getAll: function() {
      return JSON.parse(localStorage.getItem('symptoms')) || [];
    },
    
    // Añadir un registro de síntoma
    add: function(symptom) {
      const symptoms = this.getAll();
      symptom.id = Date.now().toString(); // ID único basado en timestamp
      symptoms.push(symptom);
      localStorage.setItem('symptoms', JSON.stringify(symptoms));
      
      // Actualizar puntos de gamificación
      const user = Meditrack.getCurrentUser();
      if (user) {
        if (!user.points) user.points = 0;
        user.points += 5; // 5 puntos por registrar síntomas
        Meditrack.setCurrentUser(user);
      }
      
      return symptom;
    },
    
    // Obtener un registro de síntoma por su ID
    getById: function(id) {
      const symptoms = this.getAll();
      return symptoms.find(s => s.id === id);
    },
    
    // Actualizar un registro de síntoma
    update: function(updatedSymptom) {
      const symptoms = this.getAll();
      const index = symptoms.findIndex(s => s.id === updatedSymptom.id);
      
      if (index !== -1) {
        symptoms[index] = updatedSymptom;
        localStorage.setItem('symptoms', JSON.stringify(symptoms));
        return true;
      }
      return false;
    },
    
    // Eliminar un registro de síntoma
    delete: function(id) {
      let symptoms = this.getAll();
      symptoms = symptoms.filter(s => s.id !== id);
      localStorage.setItem('symptoms', JSON.stringify(symptoms));
    },
    
    // Obtener registros recientes
    getRecent: function(limit = 10) {
      const symptoms = this.getAll();
      return symptoms.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA; // Ordenar de más reciente a más antiguo
      }).slice(0, limit);
    }
  },
  
  // Funciones para gamificación
  gamification: {
    // Obtener nivel basado en puntos
    getLevel: function(points) {
      if (points >= 500) return {level: 5, name: "Maestro del Bienestar"};
      if (points >= 300) return {level: 4, name: "Experto en Salud"};
      if (points >= 200) return {level: 3, name: "Profesional de la Salud"};
      if (points >= 100) return {level: 2, name: "Entusiasta de la Salud"};
      return {level: 1, name: "Principiante en Salud"};
    },
    
    // Obtener insignias ganadas
    getBadges: function(user) {
      if (!user) return [];
      
      const points = user.points || 0;
      const badges = [];
      
      // Insignias basadas en puntos
      if (points >= 50) badges.push({id: 'health-starter', name: 'Iniciado en Salud', icon: '🌱'});
      if (points >= 100) badges.push({id: 'health-enthusiast', name: 'Entusiasta de la Salud', icon: '🌿'});
      if (points >= 200) badges.push({id: 'health-pro', name: 'Profesional de la Salud', icon: '🌳'});
      if (points >= 300) badges.push({id: 'health-expert', name: 'Experto en Salud', icon: '🌟'});
      if (points >= 500) badges.push({id: 'health-master', name: 'Maestro del Bienestar', icon: '🏆'});
      
      // Podríamos añadir más lógica aquí para insignias basadas en comportamientos específicos
      
      return badges;
    }
  },
  
  // Utilidades generales
  utils: {
    // Formatear fecha para mostrar
    formatDate: function(dateString) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', options);
    },
    
    // Formatear hora para mostrar
    formatTime: function(timeString) {
      return timeString;
    },
    
    // Calcular porcentaje de adherencia a medicación
    calculateAdherence: function(days = 7) {
      const medications = Meditrack.medications.getAll();
      const now = new Date();
      let totalDoses = 0;
      let dosesTaken = 0;
      
      // Calcular para los últimos 'days' días
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        medications.forEach(med => {
          // Verificar si la medicación estaba activa en esta fecha
          const startDate = new Date(med.startDate);
          const endDate = med.endDate ? new Date(med.endDate) : null;
          
          if (startDate <= date && (!endDate || endDate >= date)) {
            // Calcular dosis programadas para este día
            let dosesScheduled = 0;
            
            if (med.schedule) {
              if (med.schedule.frequency === 'daily') {
                dosesScheduled = med.schedule.timesPerDay || 1;
              } else if (med.schedule.frequency === 'specific-times' && med.schedule.times) {
                dosesScheduled = med.schedule.times.length;
              } else if (med.schedule.frequency === 'specific-days' && med.schedule.specificDays) {
                const dayOfWeek = date.getDay(); // 0-6 (Domingo-Sábado)
                if (med.schedule.specificDays.includes(dayOfWeek)) {
                  dosesScheduled = med.schedule.timesPerDay || 1;
                }
              }
            }
            
            totalDoses += dosesScheduled;
            
            // Contar dosis tomadas este día
            if (med.doses) {
              dosesTaken += med.doses.filter(dose => {
                const doseDate = new Date(dose.timestamp).toISOString().split('T')[0];
                return doseDate === dateString && dose.taken;
              }).length;
            }
          }
        });
      }
      
      return totalDoses > 0 ? Math.round((dosesTaken / totalDoses) * 100) : 100;
    }
  }
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  Meditrack.init();
}); 