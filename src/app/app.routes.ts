import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./components/transaction-list/transaction-list.component').then(
        (m) => m.TransactionListComponent
      ),
  },
  {
    path: 'add-transaction',
    loadComponent: () =>
      import('./components/transaction-form/transaction-form.component').then(
        (m) => m.TransactionFormComponent
      ),
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./components/budget-manager/budget-manager.component').then(
        (m) => m.BudgetManagerComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/category-manager/category-manager.component').then(
        (m) => m.CategoryManagerComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
