// Script para limpiar localStorage de finance-tracker
// Ejecuta este script en la consola del navegador para limpiar todos los datos

console.log('🧹 Limpiando localStorage de Finance Tracker...');

// Claves de la aplicación
const keys = [
  'finance-tracker-transactions',
  'finance-tracker-preferences',
  'finance-tracker-version',
];

// Limpiar cada clave
keys.forEach((key) => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  } else {
    console.log(`ℹ️  No encontrado: ${key}`);
  }
});

console.log('✨ ¡localStorage limpiado! Recarga la página para empezar desde cero.');

// Recargar la página automáticamente
setTimeout(() => {
  window.location.reload();
}, 1000);
