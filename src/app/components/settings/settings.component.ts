// src/app/components/settings/settings.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h2>Configuración y Datos</h2>

      <div class="settings-section">
        <h3>Gestión de Datos</h3>

        <div class="action-buttons">
          <button
            class="btn btn-primary"
            (click)="exportData()"
            title="Exportar todas las transacciones como JSON"
          >
            📥 Exportar Datos
          </button>

          <label class="btn btn-secondary">
            📤 Importar Datos
            <input
              type="file"
              accept=".json"
              (change)="onFileSelected($event)"
              style="display: none;"
            />
          </label>

          <button
            class="btn btn-warning"
            (click)="resetApplication()"
            title="Resetear aplicación completamente"
          >
            🔄 Resetear Aplicación
          </button>

          <button
            class="btn btn-danger"
            (click)="clearAllData()"
            title="Eliminar todas las transacciones"
          >
            🗑️ Limpiar Todos los Datos
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>Información de Almacenamiento</h3>
        <div class="storage-info">
          <p>
            <strong>Total de transacciones:</strong> {{ transactionService.transactions().length }}
          </p>
          <p><strong>Último respaldo:</strong> {{ getLastBackupDate() }}</p>
          <p><strong>Espacio usado (aprox.):</strong> {{ getStorageSize() }} KB</p>
        </div>
      </div>

      @if (message) {
      <div class="message" [class]="messageType">
        {{ message }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      .settings-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .settings-section h3 {
        margin-top: 0;
        color: #2c3e50;
      }

      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        text-decoration: none;
        display: inline-block;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
      }

      .btn-warning {
        background-color: #ffc107;
        color: #212529;
      }

      .btn-warning:hover {
        background-color: #e0a800;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
      }

      .storage-info {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #007bff;
      }

      .storage-info p {
        margin: 8px 0;
      }

      .message {
        padding: 12px;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: 500;
      }

      .message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .message.warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }

      @media (max-width: 768px) {
        .action-buttons {
          flex-direction: column;
        }

        .btn {
          width: 100%;
          text-align: center;
        }
      }
    `,
  ],
})
export class SettingsComponent {
  restoreMockData() {
    throw new Error('Method not implemented.');
  }
  transactionService = inject(TransactionService);
  private localStorageService = inject(LocalStorageService);

  message = '';
  messageType: 'success' | 'error' | 'warning' = 'success';

  /**
   * Exporta todos los datos como archivo JSON
   */
  exportData(): void {
    try {
      const data = this.transactionService.exportTransactions();
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      window.URL.revokeObjectURL(url);

      this.showMessage('Datos exportados correctamente', 'success');
    } catch (error) {
      this.showMessage('Error al exportar los datos', 'error');
      console.error('Error exporting data:', error);
    }
  }

  /**
   * Maneja la selección de archivo para importar
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = this.transactionService.importTransactions(content);

        if (success) {
          this.showMessage('Datos importados correctamente', 'success');
        } else {
          this.showMessage('Error: Formato de archivo inválido', 'error');
        }
      } catch (error) {
        this.showMessage('Error al leer el archivo', 'error');
        console.error('Error reading file:', error);
      }
    };

    reader.readAsText(file);

    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    input.value = '';
  }

  /**
   * Resetea la aplicación completamente
   */
  resetApplication(): void {
    if (
      confirm(
        '¿Estás seguro de que quieres resetear completamente la aplicación? Esto eliminará todas las transacciones y configuraciones.'
      )
    ) {
      this.transactionService.resetApplication();
      this.showMessage('Aplicación reseteada completamente', 'warning');
    }
  }

  /**
   * Limpia todos los datos
   */
  clearAllData(): void {
    if (
      confirm(
        '¿Estás seguro de que quieres eliminar TODAS las transacciones? Esta acción no se puede deshacer.'
      )
    ) {
      this.transactionService.clearAllTransactions();
      this.showMessage('Todos los datos han sido eliminados', 'warning');
    }
  }

  /**
   * Obtiene la fecha del último respaldo (simulada)
   */
  getLastBackupDate(): string {
    // En una implementación real, podrías guardar esta fecha en localStorage
    return new Date().toLocaleDateString('es-ES');
  }

  /**
   * Calcula el tamaño aproximado de los datos en localStorage
   */
  getStorageSize(): string {
    try {
      const data = this.transactionService.exportTransactions();
      const sizeInBytes = new Blob([data]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      return sizeInKB;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Muestra un mensaje temporal
   */
  private showMessage(text: string, type: 'success' | 'error' | 'warning'): void {
    this.message = text;
    this.messageType = type;

    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
