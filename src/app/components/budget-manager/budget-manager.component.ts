import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import {
  Budget,
  BudgetCategory,
  BudgetTemplate,
  BudgetTransactionType,
} from '../../models/budget.model';

@Component({
  selector: 'app-budget-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './budget-manager.component.html',
  styleUrls: ['./budget-manager.component.scss'],
})
export class BudgetManagerComponent {
  private budgetService = inject(BudgetService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  // Signals
  budgets = this.budgetService.budgets;
  templates = this.budgetService.templates;
  alerts = this.budgetService.alerts;
  expenseCategories = this.categoryService.expenseCategories;
  incomeCategories = this.categoryService.incomeCategories;

  selectedTab = signal<'budgets' | 'templates' | 'reports'>('budgets');
  selectedBudget = signal<Budget | null>(null);
  isCreating = signal(false);
  isEditingTemplate = signal(false);

  // Forms
  budgetForm: FormGroup;
  templateForm: FormGroup;

  // Computed properties
  currentMonthBudget = computed(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    return (
      this.budgets().find(
        (budget) => budget.month === currentMonth && budget.year === currentYear
      ) || null
    );
  });

  // All available expense categories (dynamic, from CategoryService)
  availableExpenseCategories = computed(() => this.expenseCategories());
  availableIncomeCategories = computed(() => this.incomeCategories());

  budgetPerformance = computed(() => {
    const budget = this.currentMonthBudget();
    if (!budget) return null;

    return this.budgetService.getBudgetPerformance(budget.id);
  });

  constructor() {
    this.budgetForm = this.fb.group({
      name: ['', Validators.required],
      month: ['', Validators.required],
      categories: this.fb.array([]),
    });

    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categories: this.fb.array([]),
    });

    this.initializeCurrentMonthForm();
  }

  // Getters para FormArray
  get budgetCategories(): FormArray {
    return this.budgetForm.get('categories') as FormArray;
  }

  get templateCategories(): FormArray {
    return this.templateForm.get('categories') as FormArray;
  }

  // Inicializar formulario con el mes actual
  private initializeCurrentMonthForm(): void {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}`;
    this.budgetForm.patchValue({ month: currentMonth });
  }

  // Gestión de tabs
  selectTab(tab: 'budgets' | 'templates' | 'reports'): void {
    this.selectedTab.set(tab);
  }

  // Gestión de presupuestos
  startCreatingBudget(): void {
    this.isCreating.set(true);
    this.selectedBudget.set(null);
    this.resetBudgetForm();
    this.addBudgetCategory();
  }

  cancelBudgetCreation(): void {
    this.isCreating.set(false);
    this.resetBudgetForm();
  }

  selectBudget(budget: Budget): void {
    this.selectedBudget.set(budget);
    this.isCreating.set(false);
  }

  deleteBudget(budgetId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      this.budgetService.deleteBudget(budgetId);
      if (this.selectedBudget()?.id === budgetId) {
        this.selectedBudget.set(null);
      }
    }
  }

  // Gestión de categorías del presupuesto
  addBudgetCategory(): void {
    const categoryForm = this.fb.group({
      name: ['', Validators.required],
      budgetAmount: [0, [Validators.required, Validators.min(0)]],
      alertThreshold: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.budgetCategories.push(categoryForm);
  }

  removeBudgetCategory(index: number): void {
    this.budgetCategories.removeAt(index);
  }

  // Guardar presupuesto
  saveBudget(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const [year, month] = formValue.month.split('-');

      const categories: BudgetCategory[] = formValue.categories.map((cat: any) => ({
        name: cat.name,
        budgetAmount: cat.budgetAmount,
        spentAmount: 0,
        alertThreshold: cat.alertThreshold,
        lastUpdated: new Date().toISOString(),
      }));

      this.budgetService.createBudget({
        name: formValue.name,
        month: parseInt(month),
        year: parseInt(year),
        categories,
      });

      this.isCreating.set(false);
      this.resetBudgetForm();
    }
  }

  // Crear desde plantilla
  createFromTemplate(template: BudgetTemplate): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    this.budgetService.createBudgetFromTemplate(template.id, currentMonth, currentYear);
    this.selectTab('budgets');
  }

  // Gestión de plantillas
  startCreatingTemplate(): void {
    this.isEditingTemplate.set(true);
    this.resetTemplateForm();
    this.addTemplateCategory();
  }

  cancelTemplateCreation(): void {
    this.isEditingTemplate.set(false);
    this.resetTemplateForm();
  }

  deleteTemplate(templateId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      this.budgetService.deleteTemplate(templateId);
    }
  }

  // Gestión de categorías de plantilla
  addTemplateCategory(): void {
    const categoryForm = this.fb.group({
      name: ['', Validators.required],
      budgetAmount: [0, [Validators.required, Validators.min(0)]],
      alertThreshold: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.templateCategories.push(categoryForm);
  }

  removeTemplateCategory(index: number): void {
    this.templateCategories.removeAt(index);
  }

  // Guardar plantilla
  saveTemplate(): void {
    if (this.templateForm.valid) {
      const formValue = this.templateForm.value;

      this.budgetService.createTemplate({
        name: formValue.name,
        description: formValue.description,
        isDefault: false,
        categories: formValue.categories.map((cat: any) => ({
          id: crypto.randomUUID(),
          name: cat.name,
          type: 'expense' as BudgetTransactionType,
          defaultAmount: cat.budgetAmount,
          color: this.getRandomColor(),
          description: `Categoría: ${cat.name}`,
        })),
        defaultSettings: {
          warningThreshold: 80,
          alertThreshold: 100,
          rolloverUnused: false,
          autoCreateNext: false,
        },
      });

      this.isEditingTemplate.set(false);
      this.resetTemplateForm();
    }
  }

  // Helpers
  private resetBudgetForm(): void {
    this.budgetForm.reset();
    this.initializeCurrentMonthForm();

    // Clear categories array
    while (this.budgetCategories.length !== 0) {
      this.budgetCategories.removeAt(0);
    }
  }

  private resetTemplateForm(): void {
    this.templateForm.reset();

    // Clear categories array
    while (this.templateCategories.length !== 0) {
      this.templateCategories.removeAt(0);
    }
  }

  // Utilidades
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getProgressPercentage(spent: number, budget: number): number {
    return budget > 0 ? (spent / budget) * 100 : 0;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 90) return '#ef4444'; // red-500
    if (percentage >= 75) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  }

  formatMonth(month: number, year: number): string {
    const date = new Date(year, month - 1); // month - 1 porque Date usa 0-11
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
  }

  clearAlert(alertId: string): void {
    this.budgetService.clearAlert(alertId);
  }

  private getRandomColor(): string {
    const colors = [
      '#ef4444', // red-500
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
      '#84cc16', // lime-500
      '#f97316', // orange-500
      '#6366f1', // indigo-500
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
