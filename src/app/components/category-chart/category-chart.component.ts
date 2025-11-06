// src/app/components/category-chart/category-chart.component.ts
import { Component, inject, effect, viewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

/**
 * Componente para visualizar gastos por categoría
 * Demuestra integración con Chart.js y uso de effects
 * Compatible con SSR
 */
@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-chart.component.html',
  styleUrls: ['./category-chart.component.css'],
})
export class CategoryChartComponent {
  private transactionService = inject(TransactionService);
  private platformId = inject(PLATFORM_ID);
  private chart: any | null = null;

  // ViewChild para obtener referencia al canvas
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  // Exponer transactionService para el template
  get transactionServicePublic() {
    return this.transactionService;
  }

  // Colores para las categorías
  private readonly colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
  ];

  constructor() {
    // Effect: Se ejecuta cuando cambian las transacciones
    // Solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        // Acceder a transactions() para crear dependencia reactiva
        const transactions = this.transactionService.transactions();

        // Esperar a que el canvas esté disponible
        if (this.canvasRef()) {
          this.updateChart();
        }
      });
    }
  }

  // Método para actualizar el gráfico
  private async updateChart(): Promise<void> {
    // Solo ejecutar en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef();
    if (!canvas) return;

    // Importar Chart.js dinámicamente
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Obtener datos agrupados por categoría
    const categoryData = this.getCategoryData();

    // Si no hay datos, no crear gráfico
    if (categoryData.labels.length === 0) {
      return;
    }

    // Configuración del gráfico
    const config: any = {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.amounts,
            backgroundColor: this.colors.slice(0, categoryData.labels.length),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 20,
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: any) => a + (typeof b === 'number' ? b : 0),
                  0
                ) as number;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${value.toFixed(0)} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    // Crear el gráfico
    this.chart = new Chart(canvas.nativeElement, config);
  }

  // Método para obtener datos agrupados por categoría
  private getCategoryData(): { labels: string[]; amounts: number[] } {
    const transactions = this.transactionService.transactions();

    // Filtrar solo gastos
    const expenses = transactions.filter((t) => t.type === 'expense');

    // Agrupar por categoría
    const categoryMap = new Map<string, number>();

    expenses.forEach((transaction) => {
      const amount = Math.abs(transaction.amount); // Convertir a positivo para mostrar
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + amount);
    });

    // Convertir a arrays para Chart.js
    const labels = Array.from(categoryMap.keys());
    const amounts = Array.from(categoryMap.values());

    return { labels, amounts };
  }

  // Método para obtener el total de gastos
  getTotalExpenses(): number {
    return Math.abs(this.transactionService.totalExpenses());
  }

  // Método para verificar si hay datos
  hasExpenseData(): boolean {
    const expenses = this.transactionService.transactions().filter((t) => t.type === 'expense');
    return expenses.length > 0;
  }

  // Método para verificar si hay datos
  hasData(): boolean {
    return this.hasExpenseData();
  }

  // Método para obtener estadísticas de categorías con colores
  getCategoryStats(): Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }> {
    const summary = this.getCategorySummary();
    return summary.map((item, index) => ({
      ...item,
      color: this.colors[index % this.colors.length],
    }));
  }

  // Método para obtener resumen de categorías
  getCategorySummary(): Array<{ category: string; amount: number; percentage: number }> {
    const categoryData = this.getCategoryData();
    const total = categoryData.amounts.reduce((sum, amount) => sum + amount, 0);

    return categoryData.labels.map((label, index) => {
      const amount = categoryData.amounts[index];
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        category: label,
        amount,
        percentage,
      };
    });
  }
}
