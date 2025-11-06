import { TestBed } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { LocalStorageService } from './local-storage.service';
import { Transaction } from '../models/transaction.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', [
      'getItem',
      'setItem',
      'removeItem',
      'clear',
      'hasKey',
    ]);

    TestBed.configureTestingModule({
      providers: [TransactionService, { provide: LocalStorageService, useValue: localStorageSpy }],
    });

    service = TestBed.inject(TransactionService);
    localStorageService = TestBed.inject(
      LocalStorageService
    ) as jasmine.SpyObj<LocalStorageService>;

    // Mock para que retorne array vacío por defecto
    localStorageService.getItem.and.returnValue([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add transaction and save to localStorage', () => {
    const newTransaction = {
      description: 'Test transaction',
      amount: 100,
      category: 'Test',
      date: '2024-11-01',
      type: 'income' as const,
    };

    service.addTransaction(newTransaction);

    expect(localStorageService.setItem).toHaveBeenCalled();
    expect(service.transactions().length).toBe(1);
  });

  it('should delete transaction and update localStorage', () => {
    // Primero agregar una transacción
    const newTransaction = {
      description: 'Test transaction',
      amount: 100,
      category: 'Test',
      date: '2024-11-01',
      type: 'income' as const,
    };

    service.addTransaction(newTransaction);
    const transactionId = service.transactions()[0].id;

    // Luego eliminarla
    service.deleteTransaction(transactionId);

    expect(service.transactions().length).toBe(0);
    expect(localStorageService.setItem).toHaveBeenCalled();
  });

  it('should calculate total income correctly', () => {
    const incomeTransaction = {
      description: 'Income test',
      amount: 1000,
      category: 'Salary',
      date: '2024-11-01',
      type: 'income' as const,
    };

    service.addTransaction(incomeTransaction);

    expect(service.totalIncome()).toBe(1000);
  });

  it('should calculate total expenses correctly', () => {
    const expenseTransaction = {
      description: 'Expense test',
      amount: -500,
      category: 'Food',
      date: '2024-11-01',
      type: 'expense' as const,
    };

    service.addTransaction(expenseTransaction);

    expect(service.totalExpenses()).toBe(-500);
  });

  it('should calculate balance correctly', () => {
    const incomeTransaction = {
      description: 'Income test',
      amount: 1000,
      category: 'Salary',
      date: '2024-11-01',
      type: 'income' as const,
    };

    const expenseTransaction = {
      description: 'Expense test',
      amount: -300,
      category: 'Food',
      date: '2024-11-01',
      type: 'expense' as const,
    };

    service.addTransaction(incomeTransaction);
    service.addTransaction(expenseTransaction);

    expect(service.balance()).toBe(700); // 1000 - 300
  });
});
