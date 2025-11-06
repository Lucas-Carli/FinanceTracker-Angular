// src/app/components/settings/settings.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { TransactionService } from '../../services/transaction.service';
import { LocalStorageService } from '../../services/local-storage.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let transactionServiceSpy: jasmine.SpyObj<TransactionService>;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

  beforeEach(async () => {
    const transactionSpy = jasmine.createSpyObj('TransactionService', [
      'exportTransactions',
      'importTransactions',
      'restoreMockData',
      'clearAllTransactions',
    ]);
    transactionSpy.transactions = jasmine.createSpy().and.returnValue([]);

    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', [
      'getItem',
      'setItem',
      'removeItem',
      'clear',
      'hasKey',
    ]);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: TransactionService, useValue: transactionSpy },
        { provide: LocalStorageService, useValue: localStorageSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    transactionServiceSpy = TestBed.inject(
      TransactionService
    ) as jasmine.SpyObj<TransactionService>;
    localStorageServiceSpy = TestBed.inject(
      LocalStorageService
    ) as jasmine.SpyObj<LocalStorageService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //   it('should call restoreMockData when confirmed', () => {
  //     spyOn(window, 'confirm').and.returnValue(true);

  //     component.restoreMockData();

  //     expect(transactionServiceSpy.restoreMockData).toHaveBeenCalled();
  //   });

  //   it('should not call restoreMockData when not confirmed', () => {
  //     spyOn(window, 'confirm').and.returnValue(false);

  //     component.restoreMockData();

  //     expect(transactionServiceSpy.restoreMockData).not.toHaveBeenCalled();
  //   });

  it('should call clearAllTransactions when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.clearAllData();

    expect(transactionServiceSpy.clearAllTransactions).toHaveBeenCalled();
  });

  it('should return storage size', () => {
    transactionServiceSpy.exportTransactions.and.returnValue('{"test": "data"}');

    const size = component.getStorageSize();

    expect(size).toBeDefined();
    expect(typeof size).toBe('string');
  });
});
