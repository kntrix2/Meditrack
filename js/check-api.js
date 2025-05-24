/**
 * Script para verificar que la API de Meditrack esté correctamente cargada
 * Si no está disponible, redirige a la página de login
 */
(function() {
    // Función para verificar API y usuario
    function checkMeditrackApi() {
        console.log('Verificando API Meditrack...');
        
        // Verificar si la API está disponible
        if (typeof Meditrack === 'undefined') {
            console.error('ERROR: API Meditrack no está disponible');
            // Determinar la ruta de redirección según la ubicación actual
            let loginPath = '';
            
            if (window.location.pathname.includes('/pages/patient/')) {
                loginPath = '../auth/login.html';
            } else if (window.location.pathname.includes('/pages/')) {
                loginPath = 'auth/login.html';
            } else {
                loginPath = 'pages/auth/login.html';
            }
            
            console.log('Redirigiendo a:', loginPath);
            setTimeout(function() {
                window.location.href = loginPath;
            }, 1000);
            return false;
        }
        
        // Verificar si hay un usuario autenticado
        const currentUser = Meditrack.getCurrentUser();
        if (!currentUser) {
            console.error('ERROR: No hay usuario autenticado');
            // Determinar la ruta de redirección según la ubicación actual
            let loginPath = '';
            
            if (window.location.pathname.includes('/pages/patient/')) {
                loginPath = '../auth/login.html';
            } else if (window.location.pathname.includes('/pages/')) {
                loginPath = 'auth/login.html';
            } else {
                loginPath = 'pages/auth/login.html';
            }
            
            console.log('Redirigiendo a:', loginPath);
            setTimeout(function() {
                window.location.href = loginPath;
            }, 1000);
            return false;
        }
        
        console.log('API Meditrack disponible y usuario autenticado');
        return true;
    }
    
    // Ejecutar verificación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', checkMeditrackApi);
})(); 