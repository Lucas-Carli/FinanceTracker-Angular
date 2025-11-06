import { Component, signal, computed } from '@angular/core';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-manager.component.html',
  styleUrl: './category-manager.component.scss',
})
export class CategoryManagerComponent {
  categories;
  filterTab = signal<'all' | 'income' | 'expense'>('all');
  searchTerm = signal('');
  filteredCategories = computed(() => {
    let cats = this.categoryService.categories();
    const term = this.searchTerm().toLowerCase();
    if (this.filterTab() !== 'all') {
      cats = cats.filter((c) => c.type === this.filterTab());
    }
    if (term) {
      cats = cats.filter((c) => c.name.toLowerCase().includes(term));
    }
    return cats;
  });

  // Form state
  editingCategory: Category | null = null;
  showForm = signal(false);
  formType: 'add' | 'edit' = 'add';
  formData = signal<Partial<Category>>({ type: 'expense' });
  formError = signal<string | null>(null);

  constructor(private categoryService: CategoryService) {
    this.categories = this.categoryService.categories;
  }
  setTab(tab: 'all' | 'income' | 'expense') {
    this.filterTab.set(tab);
  }

  setSearch(term: string) {
    this.searchTerm.set(term);
  }

  updateFormField(field: keyof Category, value: any) {
    this.formData.set({ ...this.formData(), [field]: value });
  }

  openAddForm(type: 'income' | 'expense') {
    this.formType = 'add';
    this.formData.set({ type });
    this.editingCategory = null;
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEditForm(category: Category) {
    this.formType = 'edit';
    this.formData.set({ ...category });
    this.editingCategory = category;
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.formData.set({ type: 'expense' });
    this.editingCategory = null;
    this.formError.set(null);
  }

  saveCategory() {
    const data = this.formData();
    if (!data.name || !data.type) {
      this.formError.set('El nombre y el tipo son obligatorios.');
      return;
    }
    if (this.formType === 'add') {
      this.categoryService.createCategory({
        name: data.name,
        type: data.type,
        description: data.description || '',
        color: data.color || '',
        icon: data.icon || '',
      });
    } else if (this.formType === 'edit' && this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, {
        name: data.name,
        type: data.type,
        description: data.description || '',
        color: data.color || '',
        icon: data.icon || '',
      });
    }
    this.closeForm();
  }

  deleteCategory(category: Category) {
    if (category.isDefault) return;
    if (confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id);
    }
  }

  resetDefaults() {
    if (confirm('¿Seguro que deseas restaurar las categorías por defecto?')) {
      this.categoryService.resetToDefault();
    }
  }
}
