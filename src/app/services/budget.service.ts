// src/app/services/budget.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Budget,
  BudgetCategory,
  BudgetTemplate,
  CreateBudgetDto,
  BudgetAlert,
  BudgetPerformance,
  BudgetSystemSettings,
  BudgetStatus,
} from '../models/budget.model';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

/**
 * Servicio para gestionar presupuestos
 * Incluye templates, seguimiento en tiempo real, y alertas
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private localStorageService = inject(LocalStorageService);

  // Signals para estado reactivo
  private budgetsSignal = signal<Budget[]>([]);
  private templatesSignal = signal<BudgetTemplate[]>([]);
  private alertsSignal = signal<BudgetAlert[]>([]);
  private settingsSignal = signal<BudgetSystemSettings>(this.getDefaultSettings());

  // Exposición readonly
  budgets = this.budgetsSignal.asReadonly();
  templates = this.templatesSignal.asReadonly();
  alerts = this.alertsSignal.asReadonly();
  settings = this.settingsSignal.asReadonly();

  // Computed signals
  activeBudget = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return this.budgets().find(
      (budget) => budget.month === currentMonth && budget.year === currentYear && budget.isActive
    );
  });

  defaultTemplate = computed(() => this.templates().find((template) => template.isDefault));

  unreadAlerts = computed(() => this.alerts().filter((alert) => !alert.isRead && alert.isActive));

  constructor() {
    this.loadData();
    this.initializeDefaultTemplate();
  }

  // ===== INICIALIZACIÓN =====

  private loadData(): void {
    const budgets = this.localStorageService.getItem<Budget[]>(STORAGE_KEYS.BUDGETS) || [];
    const templates =
      this.localStorageService.getItem<BudgetTemplate[]>(STORAGE_KEYS.BUDGET_TEMPLATES) || [];
    const alerts =
      this.localStorageService.getItem<BudgetAlert[]>(STORAGE_KEYS.BUDGET_ALERTS) || [];
    const settings =
      this.localStorageService.getItem<BudgetSystemSettings>(STORAGE_KEYS.BUDGET_SETTINGS) ||
      this.getDefaultSettings();

    this.budgetsSignal.set(budgets);
    this.templatesSignal.set(templates);
    this.alertsSignal.set(alerts);
    this.settingsSignal.set(settings);
  }

  private getDefaultSettings(): BudgetSystemSettings {
    return {
      defaultCurrency: 'USD',
      defaultWarningThreshold: 80,
      defaultAlertThreshold: 100,
      autoCreateMonthlyBudgets: true,
      notificationsEnabled: true,
      emailAlerts: false,
    };
  }

  private initializeDefaultTemplate(): void {
    if (this.templates().length === 0) {
      this.createDefaultTemplate();
    }
  }

  // ===== GESTIÓN DE PRESUPUESTOS =====

  /**
   * Crea un nuevo presupuesto
   */
  createBudget(dto: CreateBudgetDto): Budget {
    const budget: Budget = {
      id: this.generateId(),
      name: dto.name || `Presupuesto ${this.getMonthName(dto.month)} ${dto.year}`,
      month: dto.month,
      year: dto.year,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isActive: true,
      categories: dto.categories.map((cat) => this.createBudgetCategory(cat)),
      totals: this.calculateInitialTotals(dto.categories),
      settings: {
        warningThreshold: this.settings().defaultWarningThreshold,
        alertThreshold: this.settings().defaultAlertThreshold,
        rolloverUnused: false,
        autoCreateNext: true,
        ...dto.settings,
      },
    };

    // Desactivar otros presupuestos del mismo mes/año
    this.deactivateOtherBudgets(dto.month, dto.year);

    this.budgetsSignal.update((budgets) => [...budgets, budget]);
    this.saveBudgets();

    return budget;
  }

  /**
   * Crea un presupuesto desde un template
   */
  createBudgetFromTemplate(templateId: string, month: number, year: number): Budget {
    const template = this.templates().find((t) => t.id === templateId);
    if (!template) {
      throw new Error('Template no encontrado');
    }

    const dto: CreateBudgetDto = {
      name: `${template.name} - ${this.getMonthName(month)} ${year}`,
      month,
      year,
      templateId: template.id,
      categories: template.categories.map((cat) => ({
        name: cat.name,
        type: cat.type,
        budgetedAmount: cat.defaultAmount,
        color: cat.color,
        icon: cat.icon,
      })),
      settings: template.defaultSettings,
    };

    return this.createBudget(dto);
  }

  /**
   * Actualiza un presupuesto existente
   */
  updateBudget(budgetId: string, updates: Partial<Budget>): void {
    this.budgetsSignal.update((budgets) =>
      budgets.map((budget) =>
        budget.id === budgetId
          ? { ...budget, ...updates, dateModified: new Date().toISOString() }
          : budget
      )
    );
    this.saveBudgets();
  }

  /**
   * Elimina un presupuesto
   */
  deleteBudget(budgetId: string): void {
    this.budgetsSignal.update((budgets) => budgets.filter((b) => b.id !== budgetId));
    this.saveBudgets();

    // Eliminar alertas relacionadas
    this.alertsSignal.update((alerts) => alerts.filter((a) => a.budgetId !== budgetId));
    this.saveAlerts();
  }

  // ===== GESTIÓN DE CATEGORÍAS =====

  /**
   * Añade una categoría a un presupuesto
   */
  addCategoryToBudget(
    budgetId: string,
    category: Omit<BudgetCategory, 'id' | 'spentAmount' | 'remaining' | 'percentage' | 'status'>
  ): void {
    const newCategory = this.createBudgetCategory({
      name: category.name,
      type: category.type,
      budgetedAmount: category.budgetedAmount,
      color: category.color,
      icon: category.icon,
    });

    this.budgetsSignal.update((budgets) =>
      budgets.map((budget) =>
        budget.id === budgetId
          ? {
              ...budget,
              categories: [...budget.categories, newCategory],
              dateModified: new Date().toISOString(),
            }
          : budget
      )
    );

    this.recalculateBudgetTotals(budgetId);
    this.saveBudgets();
  }

  /**
   * Actualiza una categoría específica
   */
  updateBudgetCategory(
    budgetId: string,
    categoryId: string,
    updates: Partial<BudgetCategory>
  ): void {
    this.budgetsSignal.update((budgets) =>
      budgets.map((budget) =>
        budget.id === budgetId
          ? {
              ...budget,
              categories: budget.categories.map((cat) =>
                cat.id === categoryId ? { ...cat, ...updates } : cat
              ),
              dateModified: new Date().toISOString(),
            }
          : budget
      )
    );

    this.recalculateBudgetTotals(budgetId);
    this.saveBudgets();
  }

  /**
   * Elimina una categoría de un presupuesto
   */
  removeCategoryFromBudget(budgetId: string, categoryId: string): void {
    this.budgetsSignal.update((budgets) =>
      budgets.map((budget) =>
        budget.id === budgetId
          ? {
              ...budget,
              categories: budget.categories.filter((cat) => cat.id !== categoryId),
              dateModified: new Date().toISOString(),
            }
          : budget
      )
    );

    this.recalculateBudgetTotals(budgetId);
    this.saveBudgets();
  }

  // ===== ACTUALIZACIÓN CON TRANSACCIONES =====

  /**
   * Actualiza los gastos reales cuando se añade/modifica una transacción
   */
  updateCategorySpending(
    category: string,
    amount: number,
    type: 'income' | 'expense',
    month: number,
    year: number
  ): void {
    const budget = this.budgets().find((b) => b.month === month && b.year === year && b.isActive);
    if (!budget) return;

    const categoryIndex = budget.categories.findIndex(
      (cat) => cat.name === category && cat.type === type
    );

    if (categoryIndex === -1) {
      // Si la categoría no existe, crearla automáticamente
      this.addCategoryToBudget(budget.id, {
        name: category,
        type: type,
        budgetedAmount: 0, // Se puede ajustar manualmente después
        color: this.getRandomColor(),
        icon: this.getDefaultIcon(type),
      });
      return;
    }

    // Recalcular totales basados en transacciones reales
    this.recalculateBudgetFromTransactions(budget.id);
  }

  /**
   * Recalcula todos los importes basándose en las transacciones reales
   */
  recalculateBudgetFromTransactions(budgetId: string): void {
    // Esta función será llamada desde TransactionService
    // Por ahora dejamos la estructura preparada
    this.recalculateBudgetTotals(budgetId);
    this.checkBudgetAlerts(budgetId);
  }

  // ===== TEMPLATES =====

  /**
   * Crea un nuevo template
   */
  createTemplate(
    template: Omit<BudgetTemplate, 'id' | 'dateCreated' | 'dateModified'>
  ): BudgetTemplate {
    const newTemplate: BudgetTemplate = {
      ...template,
      id: this.generateId(),
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    // Si es el template por defecto, desactivar otros
    if (newTemplate.isDefault) {
      this.templatesSignal.update((templates) =>
        templates.map((t) => ({ ...t, isDefault: false }))
      );
    }

    this.templatesSignal.update((templates) => [...templates, newTemplate]);
    this.saveTemplates();

    return newTemplate;
  }

  /**
   * Elimina un template
   */
  deleteTemplate(templateId: string): void {
    this.templatesSignal.update((templates) =>
      templates.filter((template) => template.id !== templateId)
    );
    this.saveTemplates();
  }

  /**
   * Elimina una alerta
   */
  clearAlert(alertId: string): void {
    this.alertsSignal.update((alerts) => alerts.filter((alert) => alert.id !== alertId));
    this.saveAlerts();
  }

  /**
   * Crea el template por defecto inicial
   */
  private createDefaultTemplate(): void {
    const defaultTemplate: Omit<BudgetTemplate, 'id' | 'dateCreated' | 'dateModified'> = {
      name: 'Presupuesto Personal',
      description: 'Template básico para presupuesto personal mensual',
      isDefault: true,
      categories: [
        // Ingresos
        {
          id: this.generateId(),
          name: 'Salario',
          type: 'income',
          defaultAmount: 3000,
          color: '#10b981',
          icon: '💰',
        },
        {
          id: this.generateId(),
          name: 'Ingresos Extra',
          type: 'income',
          defaultAmount: 500,
          color: '#059669',
          icon: '💵',
        },

        // Gastos Fijos
        {
          id: this.generateId(),
          name: 'Vivienda',
          type: 'expense',
          defaultAmount: 1200,
          color: '#ef4444',
          icon: '🏠',
        },
        {
          id: this.generateId(),
          name: 'Servicios',
          type: 'expense',
          defaultAmount: 300,
          color: '#dc2626',
          icon: '💡',
        },
        {
          id: this.generateId(),
          name: 'Transporte',
          type: 'expense',
          defaultAmount: 200,
          color: '#b91c1c',
          icon: '🚗',
        },

        // Gastos Variables
        {
          id: this.generateId(),
          name: 'Alimentación',
          type: 'expense',
          defaultAmount: 400,
          color: '#f59e0b',
          icon: '🍽️',
        },
        {
          id: this.generateId(),
          name: 'Entretenimiento',
          type: 'expense',
          defaultAmount: 200,
          color: '#d97706',
          icon: '🎬',
        },
        {
          id: this.generateId(),
          name: 'Salud',
          type: 'expense',
          defaultAmount: 150,
          color: '#0ea5e9',
          icon: '⚕️',
        },
        {
          id: this.generateId(),
          name: 'Compras',
          type: 'expense',
          defaultAmount: 300,
          color: '#8b5cf6',
          icon: '🛍️',
        },
      ],
      defaultSettings: {
        warningThreshold: 80,
        alertThreshold: 100,
        rolloverUnused: false,
        autoCreateNext: true,
      },
    };

    this.createTemplate(defaultTemplate);
  }

  // ===== CÁLCULOS Y UTILIDADES =====

  private createBudgetCategory(cat: any): BudgetCategory {
    return {
      id: this.generateId(),
      name: cat.name,
      type: cat.type,
      budgetedAmount: cat.budgetedAmount,
      spentAmount: 0,
      remaining: cat.budgetedAmount,
      percentage: 0,
      status: 'healthy',
      color: cat.color || this.getRandomColor(),
      icon: cat.icon || this.getDefaultIcon(cat.type),
      description: cat.description,
    };
  }

  private calculateInitialTotals(categories: any[]): Budget['totals'] {
    const budgetedIncome = categories
      .filter((cat) => cat.type === 'income')
      .reduce((sum, cat) => sum + cat.budgetedAmount, 0);

    const budgetedExpenses = categories
      .filter((cat) => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.budgetedAmount, 0);

    return {
      budgetedIncome,
      budgetedExpenses,
      actualIncome: 0,
      actualExpenses: 0,
      projectedBalance: budgetedIncome - budgetedExpenses,
      actualBalance: 0,
      variance: 0,
    };
  }

  private recalculateBudgetTotals(budgetId: string): void {
    const budget = this.budgets().find((b) => b.id === budgetId);
    if (!budget) return;

    const budgetedIncome = budget.categories
      .filter((cat) => cat.type === 'income')
      .reduce((sum, cat) => sum + cat.budgetedAmount, 0);

    const budgetedExpenses = budget.categories
      .filter((cat) => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.budgetedAmount, 0);

    const actualIncome = budget.categories
      .filter((cat) => cat.type === 'income')
      .reduce((sum, cat) => sum + cat.spentAmount, 0);

    const actualExpenses = budget.categories
      .filter((cat) => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.spentAmount, 0);

    const updatedTotals: Budget['totals'] = {
      budgetedIncome,
      budgetedExpenses,
      actualIncome,
      actualExpenses,
      projectedBalance: budgetedIncome - budgetedExpenses,
      actualBalance: actualIncome - actualExpenses,
      variance: actualIncome - actualExpenses - (budgetedIncome - budgetedExpenses),
    };

    this.updateBudget(budgetId, { totals: updatedTotals });
  }

  private checkBudgetAlerts(budgetId: string): void {
    const budget = this.budgets().find((b) => b.id === budgetId);
    if (!budget) return;

    budget.categories.forEach((category) => {
      const percentage =
        category.budgetedAmount > 0 ? (category.spentAmount / category.budgetedAmount) * 100 : 0;

      // Crear alertas según los thresholds
      if (percentage >= budget.settings.alertThreshold) {
        this.createAlert(budget.id, category.id, 'exceeded', 'high');
      } else if (percentage >= budget.settings.warningThreshold) {
        this.createAlert(budget.id, category.id, 'warning', 'medium');
      }
    });
  }

  private createAlert(
    budgetId: string,
    categoryId: string,
    type: BudgetAlert['type'],
    severity: BudgetAlert['severity']
  ): void {
    // Evitar duplicar alertas
    const existingAlert = this.alerts().find(
      (alert) =>
        alert.budgetId === budgetId &&
        alert.categoryId === categoryId &&
        alert.type === type &&
        alert.isActive
    );

    if (existingAlert) return;

    const budget = this.budgets().find((b) => b.id === budgetId);
    const category = budget?.categories.find((c) => c.id === categoryId);

    if (!budget || !category) return;

    const alert: BudgetAlert = {
      id: this.generateId(),
      budgetId,
      categoryId,
      type,
      severity,
      message: this.generateAlertMessage(category, type),
      dateCreated: new Date().toISOString(),
      isRead: false,
      isActive: true,
    };

    this.alertsSignal.update((alerts) => [...alerts, alert]);
    this.saveAlerts();
  }

  private generateAlertMessage(category: BudgetCategory, type: BudgetAlert['type']): string {
    const percentage =
      category.budgetedAmount > 0 ? (category.spentAmount / category.budgetedAmount) * 100 : 0;

    switch (type) {
      case 'warning':
        return `Atención: Has gastado ${percentage.toFixed(1)}% del presupuesto en ${
          category.name
        }`;
      case 'exceeded':
        return `¡Presupuesto excedido! Has gastado ${percentage.toFixed(1)}% en ${category.name}`;
      case 'depleted':
        return `Presupuesto agotado en ${category.name}`;
      default:
        return `Alerta en categoría ${category.name}`;
    }
  }

  // ===== PERSISTENCIA =====

  private saveBudgets(): void {
    this.localStorageService.setItem(STORAGE_KEYS.BUDGETS, this.budgets());
  }

  private saveTemplates(): void {
    this.localStorageService.setItem(STORAGE_KEYS.BUDGET_TEMPLATES, this.templates());
  }

  private saveAlerts(): void {
    this.localStorageService.setItem(STORAGE_KEYS.BUDGET_ALERTS, this.alerts());
  }

  private saveSettings(): void {
    this.localStorageService.setItem(STORAGE_KEYS.BUDGET_SETTINGS, this.settings());
  }

  // ===== UTILIDADES =====

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month - 1];
  }

  private deactivateOtherBudgets(month: number, year: number): void {
    this.budgetsSignal.update((budgets) =>
      budgets.map((budget) =>
        budget.month === month && budget.year === year ? { ...budget, isActive: false } : budget
      )
    );
  }

  private getRandomColor(): string {
    const colors = [
      '#ef4444',
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#6366f1',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getDefaultIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? '💰' : '💸';
  }

  // ===== API PÚBLICA ADICIONAL =====

  /**
   * Obtiene el presupuesto de un mes específico
   */
  getBudgetForMonth(month: number, year: number): Budget | undefined {
    return this.budgets().find(
      (budget) => budget.month === month && budget.year === year && budget.isActive
    );
  }

  /**
   * Marca una alerta como leída
   */
  markAlertAsRead(alertId: string): void {
    this.alertsSignal.update((alerts) =>
      alerts.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert))
    );
    this.saveAlerts();
  }

  /**
   * Obtiene el rendimiento de un presupuesto
   */
  getBudgetPerformance(budgetId: string): BudgetPerformance | null {
    const budget = this.budgets().find((b) => b.id === budgetId);
    if (!budget) return null;

    const categoriesOnTrack = budget.categories.filter(
      (cat) => cat.percentage <= budget.settings.warningThreshold
    ).length;

    const categoriesOverBudget = budget.categories.filter(
      (cat) => cat.percentage > budget.settings.alertThreshold
    ).length;

    const overallScore = Math.max(0, 100 - (categoriesOverBudget / budget.categories.length) * 100);

    return {
      budgetId: budget.id,
      month: budget.month,
      year: budget.year,
      performance: {
        overallScore,
        categoriesOnTrack,
        categoriesOverBudget,
        totalVariance: budget.totals.variance,
        savingsRate:
          budget.totals.budgetedIncome > 0
            ? (budget.totals.actualBalance / budget.totals.budgetedIncome) * 100
            : 0,
      },
      insights: {
        bestCategory: this.getBestCategory(budget)?.name || 'N/A',
        worstCategory: this.getWorstCategory(budget)?.name || 'N/A',
        recommendations: this.generateRecommendations(budget),
      },
    };
  }

  private getBestCategory(budget: Budget): BudgetCategory | undefined {
    return budget.categories
      .filter((cat) => cat.type === 'expense')
      .sort((a, b) => a.percentage - b.percentage)[0];
  }

  private getWorstCategory(budget: Budget): BudgetCategory | undefined {
    return budget.categories
      .filter((cat) => cat.type === 'expense')
      .sort((a, b) => b.percentage - a.percentage)[0];
  }

  private generateRecommendations(budget: Budget): string[] {
    const recommendations: string[] = [];

    budget.categories.forEach((category) => {
      if (category.percentage > 100) {
        recommendations.push(`Considera reducir gastos en ${category.name}`);
      } else if (category.percentage < 50 && category.type === 'expense') {
        recommendations.push(`Buen control en ${category.name}, podrías destinar más a ahorros`);
      }
    });

    return recommendations;
  }
}
