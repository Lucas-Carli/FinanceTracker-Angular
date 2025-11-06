// src/app/services/transaction.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_KEYS, CURRENT_APP_VERSION } from '../constants/storage-keys';

/**
 * Servicio para manejar transacciones
 * En Angular, los servicios son singleton y se comparten entre componentes
 * Similar a Context API + Custom Hooks en React
 * Ahora con persistencia en LocalStorage e integración con presupuestos
 */
@Injectable({
  providedIn: 'root', // Disponible en toda la app
})
export class TransactionService {
  private localStorageService = inject(LocalStorageService);

  // Signal: Estado reactivo (como useState en React)
  // La diferencia es que Angular trackea automáticamente los cambios
  private transactionsSignal = signal<Transaction[]>([]);

  // Exposición readonly del signal para componentes
  transactions = this.transactionsSignal.asReadonly();

  constructor() {
    this.initializeApp();
  }

  // Computed signals: Se recalculan automáticamente (como useMemo)
  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpenses = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpenses());

  /**
   * Inicializa la aplicación cargando datos existentes (sin datos mock)
   */
  private initializeApp(): void {
    // Cargar las transacciones existentes desde localStorage
    const loadedTransactions = this.loadTransactions();
    this.transactionsSignal.set(loadedTransactions);

    // Marcar la versión actual (sin inicializar datos mock)
    this.localStorageService.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_APP_VERSION);
  }

  /**
   * Carga transacciones desde LocalStorage
   */
  private loadTransactions(): Transaction[] {
    const savedTransactions = this.localStorageService.getItem<Transaction[]>(
      STORAGE_KEYS.TRANSACTIONS
    );
    return savedTransactions || [];
  }

  /**
   * Guarda transacciones en LocalStorage
   */
  private saveTransactions(transactions: Transaction[]): void {
    this.localStorageService.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // Método para agregar transacción
  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(), // ID simple para el MVP
    };

    // Actualizar signal (como setState en React)
    this.transactionsSignal.update((current) => {
      const updated = [...current, newTransaction];
      this.saveTransactions(updated); // Persistir en LocalStorage

      // Notificar al sistema de presupuestos
      this.notifyBudgetSystem(newTransaction, 'add');

      return updated;
    });
  }

  // Método para eliminar transacción
  deleteTransaction(id: number): void {
    this.transactionsSignal.update((current) => {
      const transactionToDelete = current.find((t) => t.id === id);
      const updated = current.filter((t) => t.id !== id);
      this.saveTransactions(updated); // Persistir en LocalStorage

      // Notificar al sistema de presupuestos
      if (transactionToDelete) {
        this.notifyBudgetSystem(transactionToDelete, 'delete');
      }

      return updated;
    });
  }

  /**
   * Método para editar una transacción existente
   */
  updateTransaction(id: number, updatedTransaction: Omit<Transaction, 'id'>): void {
    this.transactionsSignal.update((current) => {
      const oldTransaction = current.find((t) => t.id === id);
      const updated = current.map((transaction) =>
        transaction.id === id ? { ...updatedTransaction, id } : transaction
      );
      this.saveTransactions(updated); // Persistir en LocalStorage

      // Notificar al sistema de presupuestos
      const newTransaction = { ...updatedTransaction, id };
      if (oldTransaction) {
        this.notifyBudgetSystem(newTransaction, 'update', oldTransaction);
      }

      return updated;
    });
  }

  /**
   * Obtiene una transacción por ID
   */
  getTransactionById(id: number): Transaction | undefined {
    return this.transactions().find((transaction) => transaction.id === id);
  }

  /**
   * Limpia todas las transacciones (útil para testing o reset)
   */
  clearAllTransactions(): void {
    this.transactionsSignal.set([]);
    this.saveTransactions([]);
  }

  /**
   * Resetea completamente la aplicación (limpia todo el localStorage)
   */
  resetApplication(): void {
    this.localStorageService.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.localStorageService.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    this.localStorageService.removeItem(STORAGE_KEYS.APP_VERSION);
    this.transactionsSignal.set([]);
  }

  /**
   * Exporta todas las transacciones como JSON
   */
  exportTransactions(): string {
    return JSON.stringify(this.transactions(), null, 2);
  }

  /**
   * Importa transacciones desde JSON
   */
  importTransactions(jsonData: string): boolean {
    try {
      const transactions: Transaction[] = JSON.parse(jsonData);

      // Validar que el formato sea correcto
      if (Array.isArray(transactions) && this.validateTransactions(transactions)) {
        this.transactionsSignal.set(transactions);
        this.saveTransactions(transactions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing transactions:', error);
      return false;
    }
  }

  /**
   * Valida que las transacciones tengan el formato correcto
   */
  private validateTransactions(transactions: any[]): boolean {
    return transactions.every(
      (t) =>
        typeof t.id === 'number' &&
        typeof t.description === 'string' &&
        typeof t.amount === 'number' &&
        typeof t.category === 'string' &&
        typeof t.date === 'string' &&
        (t.type === 'income' || t.type === 'expense')
    );
  }

  /**
   * Notifica al sistema de presupuestos sobre cambios en transacciones
   */
  private notifyBudgetSystem(
    transaction: Transaction,
    action: 'add' | 'update' | 'delete',
    oldTransaction?: Transaction
  ): void {
    // Solo procesar gastos para el presupuesto
    if (transaction.type !== 'expense') return;

    // Aquí se implementará la integración con el BudgetService
    // Por ahora, solo marcamos que se debe actualizar el presupuesto
    console.log(`Budget system notified: ${action} transaction`, transaction);

    // TODO: Integrar con BudgetService cuando sea necesario
    // this.budgetService.updateCategorySpending(transaction.category, transaction.amount);
  }
}
