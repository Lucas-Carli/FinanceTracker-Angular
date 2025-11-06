export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorySummary {
  category: Category;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface CategoryStats {
  incomeCategories: CategorySummary[];
  expenseCategories: CategorySummary[];
  totalIncome: number;
  totalExpenses: number;
}

// Categorías por defecto que se crearán automáticamente
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', description: 'Ingresos por trabajo', icon: '💼', color: '#10b981' },
  { name: 'Freelance', description: 'Trabajos independientes', icon: '💻', color: '#059669' },
  { name: 'Inversiones', description: 'Rendimientos de inversiones', icon: '📈', color: '#047857' },
  { name: 'Renta', description: 'Ingresos por alquiler', icon: '🏠', color: '#065f46' },
  { name: 'Otros Ingresos', description: 'Otros tipos de ingresos', icon: '💰', color: '#064e3b' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación', description: 'Comida y restaurantes', icon: '🍽️', color: '#ef4444' },
  {
    name: 'Transporte',
    description: 'Combustible, transporte público',
    icon: '🚗',
    color: '#dc2626',
  },
  { name: 'Vivienda', description: 'Alquiler, hipoteca, servicios', icon: '🏡', color: '#b91c1c' },
  { name: 'Salud', description: 'Médicos, medicamentos', icon: '⚕️', color: '#991b1b' },
  { name: 'Entretenimiento', description: 'Ocio, deportes, hobbies', icon: '🎭', color: '#7f1d1d' },
  { name: 'Compras', description: 'Ropa, tecnología, otros', icon: '🛍️', color: '#fbbf24' },
  { name: 'Educación', description: 'Cursos, libros, materiales', icon: '📚', color: '#f59e0b' },
  {
    name: 'Servicios',
    description: 'Internet, teléfono, suscripciones',
    icon: '📱',
    color: '#d97706',
  },
  { name: 'Otros Gastos', description: 'Gastos varios', icon: '💸', color: '#92400e' },
];
