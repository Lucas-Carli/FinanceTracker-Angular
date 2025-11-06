// src/app/services/local-storage.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);

    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    // Limpiar localStorage después de cada test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get item from localStorage', () => {
    const testData = { name: 'test', value: 123 };
    const key = 'test-key';

    service.setItem(key, testData);
    const result = service.getItem(key);

    expect(result).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const result = service.getItem('non-existent-key');
    expect(result).toBeNull();
  });

  it('should remove item from localStorage', () => {
    const key = 'test-key';
    service.setItem(key, 'test-value');

    expect(service.hasKey(key)).toBeTruthy();

    service.removeItem(key);

    expect(service.hasKey(key)).toBeFalsy();
  });

  it('should check if key exists', () => {
    const key = 'test-key';

    expect(service.hasKey(key)).toBeFalsy();

    service.setItem(key, 'test-value');

    expect(service.hasKey(key)).toBeTruthy();
  });

  it('should clear all localStorage', () => {
    service.setItem('key1', 'value1');
    service.setItem('key2', 'value2');

    service.clear();

    expect(service.hasKey('key1')).toBeFalsy();
    expect(service.hasKey('key2')).toBeFalsy();
  });
});
