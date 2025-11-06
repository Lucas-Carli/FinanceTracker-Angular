// src/app/components/transaction-form/transaction-form.component.ts
import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';

/**
 * Componente modal para agregar transacciones
 * Demuestra el uso de Reactive Forms en Angular
 * Ahora con inputs y outputs para mayor flexibilidad
 */
@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ReactiveFormsModule para formularios reactivos
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css'],
})
export class TransactionFormComponent {
  private fb = inject(FormBuilder);

  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  // Inputs para controlar el comportamiento desde el componente padre
  isVisible = input<boolean>(false);

  // Outputs para comunicar eventos al componente padre
  closeModal = output<void>();
  transactionAdded = output<void>();

  // Signal interno para controlar visibilidad (para compatibilidad)
  isModalOpen = signal(false);

  // Categorías dinámicas
  incomeCategories = this.categoryService.incomeCategories;
  expenseCategories = this.categoryService.expenseCategories;

  // FormGroup: Similar a useForm de react-hook-form
  transactionForm: FormGroup;

  constructor() {
    // Inicializar formulario con validaciones
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required], // Por defecto: gasto
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      date: [this.getTodayDate(), Validators.required],
    });

    // Watch para cambiar categorías cuando cambia el tipo
    this.transactionForm.get('type')?.valueChanges.subscribe((type) => {
      // Limpiar categoría cuando cambia el tipo
      this.transactionForm.patchValue({ category: '' });
    });

    // Effect para sincronizar la visibilidad externa con la interna
    effect(() => {
      this.isModalOpen.set(this.isVisible());
    });
  }

  // Getter para categorías dinámicas según el tipo
  get currentCategories() {
    const type = this.transactionForm.get('type')?.value;
    return type === 'income' ? this.incomeCategories() : this.expenseCategories();
  }

  // Helper para obtener fecha de hoy en formato YYYY-MM-DD
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Abrir modal
  openModal(): void {
    this.isModalOpen.set(true);
  }

  // Cerrar modal
  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.closeModal.emit();
    this.resetForm();
  }

  // Resetear formulario
  private resetForm(): void {
    this.transactionForm.reset({
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      date: this.getTodayDate(),
    });
  }

  // Submit del formulario
  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;

      // Agregar transacción
      this.transactionService.addTransaction({
        type: formValue.type,
        amount:
          formValue.type === 'expense'
            ? -Math.abs(Number(formValue.amount))
            : Number(formValue.amount),
        description: formValue.description,
        category: formValue.category,
        date: formValue.date,
      });

      // Emitir eventos
      this.transactionAdded.emit();
      this.onCloseModal();

      // Feedback visual (opcional)
      // Puedes reemplazar esto con un toast o notification service
      console.log('✅ Transacción agregada exitosamente');
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched();
    }
  }

  // Marcar todos los campos como touched
  private markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach((key) => {
      this.transactionForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para mostrar errores
  hasError(field: string, error: string): boolean {
    const control = this.transactionForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.transactionForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  // Getter para obtener el valor del tipo de transacción
  get transactionType(): string {
    return this.transactionForm.get('type')?.value || 'expense';
  }

  // Helper para obtener el emoji según el tipo
  getTypeEmoji(type: string): string {
    return type === 'income' ? '💰' : '💸';
  }
}
