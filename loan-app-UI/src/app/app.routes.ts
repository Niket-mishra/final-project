import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { Role } from './models/user';

export const routes: Routes = [
  // 🔐 Auth
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },

  // 👤 User
  {
    path: 'user/profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: 'user/settings',
    loadComponent: () => import('./components/settings/settings').then(m => m.Settings),
    canActivate: [authGuard]
  },
  {
    path: 'user/notifications',
    loadComponent: () => import('./components/notifications/notifications').then(m => m.Notifications),
    canActivate: [authGuard]
  },

  // 💸 Repayments
  {
    path: 'repayments/history',
    loadComponent: () => import('./components/repayments/repayments').then(m => m.Repayments),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },

  // 📄 Loans & Applications
  {
    path: 'loans/list',
    loadComponent: () => import('./components/loans/loans').then(m => m.Loans),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'loans/details/:id',
    loadComponent: () => import('./components/loan-details/loan-details').then(m => m.LoanDetails),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'applications/list',
    loadComponent: () => import('./components/loan-application/loan-application').then(m => m.LoanApplications),
    canActivate: [authGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'applications/details/:id',
    loadComponent: () => import('./components/application-details/application-details').then(m => m.ApplicationDetails),
    canActivate: [authGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] }
  },

  // 📁 Documents
  {
    path: 'documents/list',
    loadComponent: () => import('./components/documents/documents').then(m => m.Documents),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'documents/details/:id',
    loadComponent: () => import('./components/document-details/document-details').then(m => m.DocumentDetails),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },

  // 🧍‍♂️ Customer
  {
    path: 'customer/dashboard',
    loadComponent: () => import('./components/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/apply-loan',
    loadComponent: () => import('./components/loan-application-form-component/loan-application-form-component').then(m => m.LoanApplicationFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/upload-documents',
    loadComponent: () => import('./components/multi-document-upload-component/multi-document-upload-component').then(m => m.MultiDocumentUploadComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },

  // 🧑‍💼 Officer
  {
    path: 'officer/dashboard',
    loadComponent: () => import('./components/officer-dashboard/officer-dashboard').then(m => m.OfficerDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/performance',
    loadComponent: () => import('./components/officer-performance/officer-performance').then(m => m.OfficerPerformance),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/queries',
    loadComponent: () => import('./components/customer-queries/customer-queries').then(m => m.CustomerQueries),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/customers',
    loadComponent: () => import('./components/customers/customers').then(m => m.Customers),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] }
  },

  // 🛡️ Admin
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/loan-schemes',
    loadComponent: () => import('./components/loan-schemes/loan-schemes').then(m => m.LoanSchemes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/loan-officers',
    loadComponent: () => import('./components/loan-officers/loan-officers').then(m => m.LoanOfficers),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/user-management/user-management').then(m => m.UserManagement),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/audit-logs',
    loadComponent: () => import('./components/audit-logs/audit-logs').then(m => m.AuditLogs),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./components/reports/reports').then(m => m.Reports),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/npa-monitoring',
    loadComponent: () => import('./components/npa-monitoring/npa-monitoring').then(m => m.NpaMonitoring),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },

  // 🚫 Fallback
  { path: '**', redirectTo: 'auth/login' }
];