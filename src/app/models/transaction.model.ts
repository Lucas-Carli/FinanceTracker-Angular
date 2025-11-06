// src/app/models/transaction.model.ts

/**
 * Interface para las transacciones
 * En Angular las interfaces definen la estructura de los datos
 * Similar a TypeScript en general, pero es la base del sistema de tipos
 */
export interface Transaction {
  id: number;
  description: string;
  amount: number; // Positivo para ingresos, negativo para gastos
  category: string;
  date: string; // Formato: 'YYYY-MM-DD'
  type: 'income' | 'expense'; // Union type - solo permite estos 2 valores
}

/**
 * Interface para las estadísticas del dashboard
 */
export interface Stats {
  income: number;
  expenses: number;
  balance: number;
}

/**
 * Interface para los datos del gráfico de categorías
 */
export interface CategoryData {
  name: string;
  value: number;
  color?: string; // Opcional, se asignará dinámicamente
}
