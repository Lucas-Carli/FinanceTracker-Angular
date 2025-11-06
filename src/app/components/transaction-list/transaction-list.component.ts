// src/app/components/transaction-list/transaction-list.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

/**
 * Componente para listar y filtrar transacciones
 * Demuestra el uso de signals locales y filtrado reactivo
 */
@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule para ngModel
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css'],
})
export class TransactionListComponent {
  transactionService = inject(TransactionService);

  // Signals locales para filtros (estado del componente)
  filterType = signal<'all' | 'income' | 'expense'>('all');
  filterCategory = signal<string>('all');
  searchTerm = signal<string>('');

  // Computed: Lista de categorías únicas
  categories = computed(() => {
    const allCategories = this.transactionService.transactions().map((t) => t.category);
    return ['all', ...new Set(allCategories)];
  });

  // Computed: Transacciones filtradas (se recalcula automáticamente)
  filteredTransactions = computed(() => {
    let transactions = this.transactionService.transactions();

    // Filtrar por tipo
    if (this.filterType() !== 'all') {
      transactions = transactions.filter((t) => t.type === this.filterType());
    }

    // Filtrar por categoría
    if (this.filterCategory() !== 'all') {
      transactions = transactions.filter((t) => t.category === this.filterCategory());
    }

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search)
      );
    }

    // Ordenar por fecha (más reciente primero)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Método para cambiar filtro de tipo
  setFilterType(type: 'all' | 'income' | 'expense'): void {
    this.filterType.set(type);
  }

  // Método para cambiar filtro de categoría
  setFilterCategory(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterCategory.set(target.value);
  }

  // Método para actualizar búsqueda
  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  // Método para eliminar transacción
  deleteTransaction(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta transacción?')) {
      this.transactionService.deleteTransaction(Number(id));
    }
  }

  // Helper para obtener el emoji según el tipo
  getTypeEmoji(type: 'income' | 'expense'): string {
    return type === 'income' ? '💰' : '💸';
  }

  // Helper para obtener clase CSS según el tipo
  getTypeClass(type: 'income' | 'expense'): string {
    return type === 'income' ? 'income' : 'expense';
  }
}
