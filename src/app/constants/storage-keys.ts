// src/app/constants/storage-keys.ts

/**
 * Constantes para las claves de LocalStorage
 * Centralizamos las claves para evitar errores de tipeo y facilitar el mantenimiento
 */
export const STORAGE_KEYS = {
  // Transacciones
  TRANSACTIONS: 'finance-tracker-transactions',

  // Presupuestos
  BUDGETS: 'finance-tracker-budgets',
  BUDGET_TEMPLATES: 'finance-tracker-budget-templates',
  BUDGET_ALERTS: 'finance-tracker-budget-alerts',
  BUDGET_SETTINGS: 'finance-tracker-budget-settings',

  // Configuraciones generales
  USER_PREFERENCES: 'finance-tracker-preferences',
  APP_VERSION: 'finance-tracker-version',
} as const;

/**
 * Versión actual de la aplicación para manejo de migraciones
 */
export const CURRENT_APP_VERSION = '1.0.0';
