// src/app/services/local-storage.service.ts
import { Injectable } from '@angular/core';

/**
 * Servicio para manejar LocalStorage de forma segura
 * Encapsula todas las operaciones con LocalStorage y maneja errores
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /**
   * Verifica si localStorage está disponible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Obtiene un valor del LocalStorage
   * @param key Clave para buscar
   * @returns El valor parseado o null si no existe
   */
  getItem<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage with key: ${key}`, error);
      return null;
    }
  }

  /**
   * Guarda un valor en LocalStorage
   * @param key Clave para guardar
   * @param value Valor a guardar (será serializado a JSON)
   */
  setItem<T>(key: string, value: T): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage with key: ${key}`, error);
    }
  }

  /**
   * Elimina un item del LocalStorage
   * @param key Clave del item a eliminar
   */
  removeItem(key: string): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage with key: ${key}`, error);
    }
  }

  /**
   * Limpia todo el LocalStorage
   */
  clear(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Verifica si una clave existe en LocalStorage
   * @param key Clave a verificar
   * @returns true si existe, false en caso contrario
   */
  hasKey(key: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking if key exists in localStorage: ${key}`, error);
      return false;
    }
  }
}
