import { Injectable, computed, signal } from '@angular/core';
import {
  Category,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  CategoryStats,
  CategorySummary,
} from '../models/category.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly CATEGORIES_KEY = 'finance_tracker_categories';

  // Signals para estado reactivo
  private categoriesSignal = signal<Category[]>([]);

  // Computed signals para diferentes vistas de categorías
  public readonly categories = computed(() => this.categoriesSignal());
  public readonly incomeCategories = computed(() =>
    this.categoriesSignal().filter((cat) => cat.type === 'income')
  );
  public readonly expenseCategories = computed(() =>
    this.categoriesSignal().filter((cat) => cat.type === 'expense')
  );

  constructor(private localStorageService: LocalStorageService) {
    this.loadCategories();
  }

  // Cargar categorías desde localStorage
  private loadCategories(): void {
    const savedCategories = this.localStorageService.getItem<any[]>(this.CATEGORIES_KEY);

    if (savedCategories && savedCategories.length > 0) {
      // Convertir fechas de string a Date objects
      const categories = savedCategories.map((cat) => ({
        ...cat,
        createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
        updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      }));
      this.categoriesSignal.set(categories);
    } else {
      // Primera vez: crear categorías por defecto
      this.createDefaultCategories();
    }
  }

  // Crear categorías por defecto
  private createDefaultCategories(): void {
    const defaultCategories: Category[] = [];
    const now = new Date();

    // Crear categorías de ingresos por defecto
    DEFAULT_INCOME_CATEGORIES.forEach((cat, index) => {
      defaultCategories.push({
        id: `income-default-${index + 1}`,
        name: cat.name,
        type: 'income',
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Crear categorías de gastos por defecto
    DEFAULT_EXPENSE_CATEGORIES.forEach((cat, index) => {
      defaultCategories.push({
        id: `expense-default-${index + 1}`,
        name: cat.name,
        type: 'expense',
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    this.categoriesSignal.set(defaultCategories);
    this.saveCategories();
  }

  // Guardar categorías en localStorage
  private saveCategories(): void {
    // Serializar fechas como string antes de guardar
    const categoriesToSave = this.categoriesSignal().map((cat) => ({
      ...cat,
      createdAt: cat.createdAt instanceof Date ? cat.createdAt.toISOString() : cat.createdAt,
      updatedAt: cat.updatedAt instanceof Date ? cat.updatedAt.toISOString() : cat.updatedAt,
    }));
    this.localStorageService.setItem(this.CATEGORIES_KEY, categoriesToSave);
  }

  // Crear nueva categoría
  createCategory(
    categoryData: Omit<Category, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>
  ): Category {
    const now = new Date();
    const newCategory: Category = {
      ...categoryData,
      id: this.generateId(),
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    const currentCategories = this.categoriesSignal();
    this.categoriesSignal.set([...currentCategories, newCategory]);
    this.saveCategories();

    return newCategory;
  }

  // Actualizar categoría existente
  updateCategory(
    id: string,
    updates: Partial<Omit<Category, 'id' | 'isDefault' | 'createdAt'>>
  ): Category | null {
    const currentCategories = this.categoriesSignal();
    const categoryIndex = currentCategories.findIndex((cat) => cat.id === id);

    if (categoryIndex === -1) {
      return null;
    }

    const updatedCategory: Category = {
      ...currentCategories[categoryIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const newCategories = [...currentCategories];
    newCategories[categoryIndex] = updatedCategory;

    this.categoriesSignal.set(newCategories);
    this.saveCategories();

    return updatedCategory;
  }

  // Eliminar categoría (solo categorías no predefinidas)
  deleteCategory(id: string): boolean {
    const currentCategories = this.categoriesSignal();
    const category = currentCategories.find((cat) => cat.id === id);

    if (!category || category.isDefault) {
      return false; // No se pueden eliminar categorías por defecto
    }

    const filteredCategories = currentCategories.filter((cat) => cat.id !== id);
    this.categoriesSignal.set(filteredCategories);
    this.saveCategories();

    return true;
  }

  // Obtener categoría por ID
  getCategoryById(id: string): Category | undefined {
    return this.categoriesSignal().find((cat) => cat.id === id);
  }

  // Obtener categorías por tipo
  getCategoriesByType(type: 'income' | 'expense'): Category[] {
    return this.categoriesSignal().filter((cat) => cat.type === type);
  }

  // Verificar si una categoría está siendo utilizada
  isCategoryInUse(categoryId: string): boolean {
    // Esta función será implementada cuando integremos con TransactionService
    // Por ahora retorna false para permitir eliminación
    return false;
  }

  // Obtener estadísticas de categorías (para futuro uso con transacciones)
  getCategoryStats(transactions: any[] = []): CategoryStats {
    const incomeCategories: CategorySummary[] = [];
    const expenseCategories: CategorySummary[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    // Esta función será implementada completamente cuando integremos con transacciones
    return {
      incomeCategories,
      expenseCategories,
      totalIncome,
      totalExpenses,
    };
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Resetear categorías a valores por defecto
  resetToDefault(): void {
    this.localStorageService.removeItem(this.CATEGORIES_KEY);
    this.createDefaultCategories();
  }

  // Exportar categorías
  exportCategories(): Category[] {
    return this.categoriesSignal();
  }

  // Importar categorías
  importCategories(categories: Category[]): void {
    // Validar categorías antes de importar
    const validCategories = categories.filter(
      (cat) => cat.id && cat.name && cat.type && ['income', 'expense'].includes(cat.type)
    );

    this.categoriesSignal.set(validCategories);
    this.saveCategories();
  }
}
