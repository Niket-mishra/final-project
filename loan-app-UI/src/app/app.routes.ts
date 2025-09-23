import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { Role } from './models/user';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
   {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
 


  //Customer Routes
  {
    path: 'customer/dashboard',
    loadComponent: () => import('./components/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
   {
    path: 'customer/apply',
    loadComponent: () => import('./components/loan-application-form-component/loan-application-form-component').then(m => m.LoanApplicationFormComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/upload',
    loadComponent: () => import('./components/multi-document-upload-component/multi-document-upload-component').then(m => m.MultiDocumentUploadComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.Customer] }
  },

  

  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings').then(m => m.Settings),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'officer/dashboard',
    loadComponent: () => import('./components/officer-dashboard/officer-dashboard').then(m => m.OfficerDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  
  {
    path: 'loans',
    loadComponent: () => import('./components/loans/loans').then(m => m.Loans),
    canActivate: [authGuard]
  },
  {
    path: 'loan/:id',
    loadComponent: () => import('./components/loan-details/loan-details').then(m => m.LoanDetails),
    canActivate: [authGuard]
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
    path: 'officer/performance',
    loadComponent: () => import('./components/officer-performance/officer-performance').then(m => m.OfficerPerformance),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers').then(m => m.Customers),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin, Role.LoanOfficer] }
  },
  {
    path: 'loan-applications',
    loadComponent: () => import('./components/loan-application/loan-application').then(m => m.LoanApplications),
    canActivate: [authGuard]
  },
  {
    path: 'application/:id',
    loadComponent: () => import('./components/application-details/application-details').then(m => m.ApplicationDetails),
    canActivate: [authGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./components/documents/documents').then(m => m.Documents),
    canActivate: [authGuard]
  },
  {
    path: 'document/:id',
    loadComponent: () => import('./components/document-details/document-details').then(m => m.DocumentDetails),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/notifications/notifications').then(m => m.Notifications),
    canActivate: [authGuard]
  },
  {
    path: 'queries',
    loadComponent: () => import('./components/customer-queries/customer-queries').then(m => m.CustomerQueries),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'npa-monitoring',
    loadComponent: () => import('./components/npa-monitoring/npa-monitoring').then(m => m.NpaMonitoring),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports').then(m => m.Reports),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'repayments',
    loadComponent: () => import('./components/repayments/repayments').then(m => m.Repayments),
    canActivate: [authGuard]
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

  { path: '**', redirectTo: '/login' }
];