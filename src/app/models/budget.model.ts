// src/app/models/budget.model.ts

/**
 * Tipos de transacciones soportadas en el presupuesto
 */
export type BudgetTransactionType = 'income' | 'expense';

/**
 * Estados del presupuesto según el uso
 */
export type BudgetStatus = 'healthy' | 'warning' | 'exceeded' | 'undefined';

/**
 * Categoría dentro de un presupuesto
 * Incluye tanto la planificación como el seguimiento en tiempo real
 */
export interface BudgetCategory {
  id: string;
  name: string;
  type: BudgetTransactionType;
  budgetedAmount: number;
  spentAmount: number; // Calculado en tiempo real desde transacciones
  remaining: number; // Calculado: budgetedAmount - spentAmount
  percentage: number; // Calculado: (spentAmount / budgetedAmount) * 100
  status: BudgetStatus; // Calculado según thresholds
  color: string; // Para visualizaciones
  icon?: string; // Emoji o icono representativo
  description?: string; // Descripción opcional
}

/**
 * Presupuesto completo para un mes específico
 */
export interface Budget {
  id: string;
  name: string; // ej: "Presupuesto Noviembre 2025"
  month: number; // 1-12
  year: number;
  dateCreated: string; // ISO string
  dateModified: string; // ISO string
  isActive: boolean; // Solo un presupuesto activo por mes

  // Categorías del presupuesto
  categories: BudgetCategory[];

  // Totales calculados automáticamente
  totals: {
    budgetedIncome: number;
    budgetedExpenses: number;
    actualIncome: number;
    actualExpenses: number;
    projectedBalance: number; // budgetedIncome - budgetedExpenses
    actualBalance: number; // actualIncome - actualExpenses
    variance: number; // actualBalance - projectedBalance
  };

  // Configuraciones
  settings: {
    warningThreshold: number; // % para mostrar warning (ej: 80)
    alertThreshold: number; // % para mostrar alert (ej: 100)
    rolloverUnused: boolean; // Transferir dinero no usado al siguiente mes
    autoCreateNext: boolean; // Crear automáticamente el presupuesto del siguiente mes
  };
}

/**
 * Template para crear presupuestos futuros
 * Sirve como base reutilizable
 */
export interface BudgetTemplate {
  id: string;
  name: string; // ej: "Template Personal Mensual"
  description?: string;
  isDefault: boolean; // Template por defecto
  dateCreated: string;
  dateModified: string;

  // Categorías template (sin importes reales, solo presupuestados)
  categories: {
    id: string;
    name: string;
    type: BudgetTransactionType;
    defaultAmount: number; // Importe sugerido por defecto
    color: string;
    icon?: string;
    description?: string;
  }[];

  // Configuraciones por defecto
  defaultSettings: {
    warningThreshold: number;
    alertThreshold: number;
    rolloverUnused: boolean;
    autoCreateNext: boolean;
  };
}

/**
 * Resumen de rendimiento del presupuesto
 * Para análisis y comparaciones
 */
export interface BudgetPerformance {
  budgetId: string;
  month: number;
  year: number;

  performance: {
    overallScore: number; // 0-100, qué tan bien se siguió el presupuesto
    categoriesOnTrack: number; // Cantidad de categorías dentro del presupuesto
    categoriesOverBudget: number;
    totalVariance: number; // Diferencia total vs presupuestado
    savingsRate: number; // % de ingresos ahorrados
  };

  insights: {
    bestCategory: string; // Categoría mejor gestionada
    worstCategory: string; // Categoría que más se excedió
    recommendations: string[]; // Sugerencias automáticas
  };
}

/**
 * Configuración global del sistema de presupuestos
 */
export interface BudgetSystemSettings {
  defaultCurrency: string;
  defaultWarningThreshold: number;
  defaultAlertThreshold: number;
  autoCreateMonthlyBudgets: boolean;
  defaultTemplateId?: string;
  notificationsEnabled: boolean;
  emailAlerts: boolean;
}

/**
 * Datos para crear un nuevo presupuesto
 */
export interface CreateBudgetDto {
  name?: string;
  month: number;
  year: number;
  templateId?: string; // Si se basa en un template
  copyFromBudgetId?: string; // Si se copia de otro presupuesto
  categories: {
    name: string;
    type: BudgetTransactionType;
    budgetedAmount: number;
    color?: string;
    icon?: string;
  }[];
  settings?: Partial<Budget['settings']>;
}

/**
 * Alertas del presupuesto
 */
export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId: string;
  type: 'warning' | 'exceeded' | 'depleted';
  message: string;
  severity: 'low' | 'medium' | 'high';
  dateCreated: string;
  isRead: boolean;
  isActive: boolean;
}
