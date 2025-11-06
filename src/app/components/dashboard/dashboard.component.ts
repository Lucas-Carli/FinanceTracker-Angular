// src/app/components/dashboard/dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryChartComponent } from '../category-chart/category-chart.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';

/**
 * Componente Dashboard
 * Muestra las estadísticas principales y un resumen de la aplicación
 */
@Component({
  selector: 'app-dashboard',
  standalone: true, // Componente standalone (Angular 14+)
  imports: [CommonModule, RouterLink, CategoryChartComponent, TransactionFormComponent], // Necesario para *ngIf, *ngFor, pipes, etc.
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Inject: Inyección de dependencias (como useContext en React)
  transactionService = inject(TransactionService);

  // Computed: Obtiene las últimas 5 transacciones
  recentTransactions = computed(() => {
    return this.transactionService
      .transactions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });

  /**
   * Obtiene el mes actual en formato legible
   */
  getCurrentMonth(): string {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  /**
   * Obtiene el estado del balance para aplicar estilos CSS
   */
  getBalanceStatus(): string {
    const balance = this.transactionService.balance();
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Obtiene el texto descriptivo del balance
   */
  getBalanceText(): string {
    const balance = this.transactionService.balance();
    if (balance > 0) return 'Positivo';
    if (balance < 0) return 'Negativo';
    return 'Equilibrado';
  }

  /**
   * Obtiene el icono según el estado del balance
   */
  getBalanceIcon(): string {
    const balance = this.transactionService.balance();
    if (balance > 0) return '📈';
    if (balance < 0) return '📉';
    return '➖';
  }
}
