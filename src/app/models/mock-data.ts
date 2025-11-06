// src/app/models/mock-data.ts
import { Transaction } from './transaction.model';
/**
 * Datos mock para desarrollo
 * Estos datos simularán lo que vendrá del backend
 *
 * NOTA: En React usarías const, en Angular también pero con export
 * para poder importarlo en otros componentes
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: 'Salario Noviembre',
    amount: 150000,
    category: 'Salario',
    date: '2024-11-01',
    type: 'income',
  },
  {
    id: 2,
    description: 'Freelance - Desarrollo Web',
    amount: 45000,
    category: 'Freelance',
    date: '2024-11-03',
    type: 'income',
  },
  {
    id: 3,
    description: 'Supermercado Carrefour',
    amount: -12500,
    category: 'Alimentación',
    date: '2024-11-02',
    type: 'expense',
  },
  {
    id: 4,
    description: 'Netflix Premium',
    amount: -3500,
    category: 'Entretenimiento',
    date: '2024-11-05',
    type: 'expense',
  },
  {
    id: 5,
    description: 'Edenor - Luz',
    amount: -8000,
    category: 'Servicios',
    date: '2024-11-07',
    type: 'expense',
  },
  {
    id: 6,
    description: 'Fibertel Internet',
    amount: -6500,
    category: 'Servicios',
    date: '2024-11-08',
    type: 'expense',
  },
  {
    id: 7,
    description: 'Cena con amigos',
    amount: -15000,
    category: 'Alimentación',
    date: '2024-11-10',
    type: 'expense',
  },
  {
    id: 8,
    description: 'Uber al trabajo',
    amount: -2500,
    category: 'Transporte',
    date: '2024-11-12',
    type: 'expense',
  },
  {
    id: 9,
    description: 'Gimnasio Megatlon',
    amount: -12000,
    category: 'Salud',
    date: '2024-11-15',
    type: 'expense',
  },
  {
    id: 10,
    description: 'Mercado Libre - Auriculares',
    amount: -8500,
    category: 'Compras',
    date: '2024-11-18',
    type: 'expense',
  },
  {
    id: 11,
    description: 'Bonus por proyecto',
    amount: 25000,
    category: 'Freelance',
    date: '2024-11-20',
    type: 'income',
  },
  {
    id: 12,
    description: 'Farmacity - Medicamentos',
    amount: -4200,
    category: 'Salud',
    date: '2024-11-22',
    type: 'expense',
  },
];

/**
 * Categorías disponibles
 * Útil para los selectores en formularios
 */
export const CATEGORIES: string[] = [
  'Salario',
  'Freelance',
  'Alimentación',
  'Entretenimiento',
  'Servicios',
  'Transporte',
  'Salud',
  'Compras',
  'Educación',
  'Otros',
];

/**
 * Colores para el gráfico de categorías
 * Cada categoría tendrá un color asignado
 */
export const CHART_COLORS: string[] = [
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#ef4444', // Rojo
  '#f59e0b', // Naranja
  '#8b5cf6', // Púrpura
  '#ec4899', // Rosa
  '#14b8a6', // Teal
  '#f97316', // Naranja oscuro
  '#6366f1', // Índigo
  '#64748b', // Gris
];
