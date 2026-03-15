const fs = require('fs');
const path = require('path');

// Archivo principal de JS
const mainJsPath = path.join(__dirname, 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Leer la variable de entorno de Vercel (si no existe, dejar undefined)
const apiUrl = process.env.API_BASE;

if (apiUrl) {
  // Reemplazar de forma segura la asignación de API_BASE usando regex
  mainJs = mainJs.replace(
    /const API_BASE\s*=\s*(['"]).*?\1\s*;/g, 
    `const API_BASE = '${apiUrl}';`
  );
  
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log(`[Build] Vercel injection success: API_BASE replaced with ${apiUrl}`);
} else {
  console.log('[Build] API_BASE env variable not found. Using default local URLs.');
}
