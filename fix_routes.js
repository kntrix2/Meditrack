// Script para corregir rutas en archivos HTML
const fs = require('fs');
const path = require('path');

const patientPagesDir = path.join(__dirname, 'pages', 'patient');
const files = fs.readdirSync(patientPagesDir).filter(file => file.endsWith('.html'));

console.log('Corrigiendo rutas en archivos HTML...');

files.forEach(file => {
    const filePath = path.join(patientPagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corregir rutas CSS
    content = content.replace(
        /<link rel="stylesheet" href="css\/styles\.css">/g, 
        '<link rel="stylesheet" href="../../css/styles.css">'
    );
    
    // Corregir rutas de imágenes 
    content = content.replace(
        /<link rel="icon" href="images\/app-icon\.png"/g, 
        '<link rel="icon" href="../../images/app-icon.png"'
    );
    
    // Corregir rutas JavaScript
    content = content.replace(
        /<script src="js\/app\.js"><\/script>/g, 
        '<script src="../../js/app.js"></script>'
    );
    
    // Corregir imágenes en la barra lateral
    content = content.replace(
        /<img src="images\/app-icon\.png"/g, 
        '<img src="../../images/app-icon.png"'
    );
    
    // Corregir ruta de redirección a login
    content = content.replace(
        /window\.location\.href = ['"]login\.html['"]/g,
        'window.location.href = \'../auth/login.html\''
    );
    
    // Guardar cambios
    fs.writeFileSync(filePath, content);
    console.log(`Rutas corregidas en ${file}`);
});

console.log('Todas las rutas han sido corregidas correctamente.'); 