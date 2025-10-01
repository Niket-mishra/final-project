import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { Role } from './models/user';

export const routes: Routes = [
  // 🔐 Auth Routes (No Layout)
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forget-password/forget-password').then(m => m.ForgotPassword)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password').then(m => m.ResetPassword)
  },

  // 🛡️ ADMIN ROUTES (With Admin Layout)
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-navbar/admin-navbar').then(m => m.AdminLayout),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'loan-schemes',
        loadComponent: () => import('./components/loan-schemes/loan-schemes').then(m => m.LoanSchemes)
      },
      { 
        path: 'loan-schemes/create',
        loadComponent: () => import('./components/loan-scheme-component/loan-scheme-component').then(m => m.LoanSchemeComponent)
      },
      { path: 'loan-schemes/:id/edit',
        loadComponent: () => import('./components/loan-scheme-component/loan-scheme-component').then(m => m.LoanSchemeComponent)
      },
      {
        path: 'loan-officers',
        loadComponent: () => import('./components/loan-officers/loan-officers').then(m => m.LoanOfficers)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/user-management/user-management').then(m => m.UserManagement)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./components/audit-logs/audit-logs').then(m => m.AuditLogs)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports').then(m => m.Reports)
      },
      {
        path: 'npa-monitoring',
        loadComponent: () => import('./components/npa-monitoring/npa-monitoring').then(m => m.NpaMonitoring)
      },
      {
        path: 'assign-officer/:applicationId',
        loadComponent: () => import('./components/assign-officer/assign-officer').then(m => m.AssignOfficerComponent)
      },
      {
        path: 'officer-manager',
        loadComponent: () => import('./components/officer-manager-component/officer-manager-component').then(m => m.OfficerManagerComponent)
      },
      {
        path: 'workload-meter',
        loadComponent: () => import('./components/workload-meter-component/workload-meter-component').then(m => m.WorkloadMeterComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/admin-settings/admin-settings').then(m => m.AdminSettings)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/admin-notifications/admin-notifications').then(m => m.AdminNotifications)
      },
      {
        path: 'feedback-history',
        loadComponent: () => import('./components/admin-feedback-history/admin-feedback-history').then(m => m.AdminFeedbackHistory)
      }
    ]
  },

  // 🧑‍💼 LOAN OFFICER ROUTES (With Officer Layout)
  {
    path: 'officer',
    loadComponent: () => import('./components/officer-navbar/officer-navbar').then(m => m.OfficerLayout),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/officer-dashboard/officer-dashboard').then(m => m.OfficerDashboard)
      },
      {
        path: 'performance',
        loadComponent: () => import('./components/officer-performance/officer-performance').then(m => m.OfficerPerformance)
      },
      {
        path: 'queries',
        loadComponent: () => import('./components/customer-queries/customer-queries').then(m => m.CustomerQueries)
      },
      {
        path: 'customers',
        loadComponent: () => import('./components/customers/customers').then(m => m.Customers)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./components/customer-details/customer-details').then(m => m.CustomerDetails)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/officer-profile-component/officer-profile-component').then(m => m.OfficerProfileComponent)
      },
      {
        path: 'assigned-applications',
        loadComponent: () => import('./components/assigned-applications/assigned-applications').then(m => m.AssignedApplications)
      },
      {
        path: 'repayments',
        loadComponent: () => import('./components/officer-repayments/officer-repayments').then(m => m.OfficerRepayments)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/officer-documents/officer-documents').then(m => m.OfficerDocuments)
      },
      {
        path: 'loan-schemes',
        loadComponent: () => import('./components/loan-schemes-officer/loan-schemes-officer').then(m => m.LoanSchemesOfficer)
      },
      {
        path: 'assignments',
        loadComponent: () => import('./components/officer-assignments/officer-assignments').then(m => m.OfficerAssignments)
      },
      {
        path: 'summary',
        loadComponent: () => import('./components/officer-summary/officer-summary').then(m => m.OfficerSummary)
      },
      {
        path: 'workload',
        loadComponent: () => import('./components/workload-meter-officer/workload-meter-officer').then(m => m.WorkloadMeterOfficer)
      },
      {
        path: 'repayment-schedule',
        loadComponent: () => import('./components/repayment-schedule/repayment-schedule').then(m => m.RepaymentSchedule)
      },
      {
        path: 'loan-approvals',
        loadComponent: () => import('./components/loan-approvals/loan-approvals').then(m => m.LoanApprovals)
      },
      {
        path: 'document-verification',
        loadComponent: () => import('./components/document-verification/document-verification').then(m => m.DocumentVerification)
      },
      {
        path: 'generate-report',
        loadComponent: () => import('./components/report-generation/report-generation').then(m => m.ReportGeneration)
      },
      {
        path: 'scheme-details/:id',
        loadComponent: () => import('./components/loan-scheme-details/loan-scheme-details').then(m => m.LoanSchemeDetails)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/officer-settings/officer-settings').then(m => m.OfficerSettings)
      }
    ]
  },

  // 🧍‍♂️ CUSTOMER ROUTES (With Customer Layout)
  {
    path: 'customer',
    loadComponent: () => import('./components/customer-navbar/customer-navbar').then(m => m.CustomerLayout),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard)
      },
      {
        path: 'apply-loan',
        loadComponent: () => import('./components/loan-application-form-component/loan-application-form-component').then(m => m.LoanApplicationFormComponent)
      },
      {
        path: 'upload-documents',
        loadComponent: () => import('./components/multi-document-upload-component/multi-document-upload-component').then(m => m.MultiDocumentUploadComponent)
      },
      {
        path: 'my-loans',
        loadComponent: () => import('./components/customer-loans/customer-loans').then(m => m.CustomerLoans)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/customer-applications/customer-applications').then(m => m.CustomerApplications)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/customer-documents/customer-documents').then(m => m.CustomerDocuments)
      },
      {
        path: 'queries',
        loadComponent: () => import('./components/customer-query-form/customer-query-form').then(m => m.CustomerQueryForm)
      },
      {
        path: 'queries/list',
        loadComponent: () => import('./components/customer-queries-list/customer-queries-list').then(m => m.CustomerQueriesList)
      },
      {
        path: 'repayments',
        loadComponent: () => import('./components/customer-repayments/customer-repayments').then(m => m.CustomerRepayments)
      },
      {
        path: 'repayment-schedule',
        loadComponent: () => import('./components/repayment-schedule/repayment-schedule').then(m => m.RepaymentSchedule)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/customer-profile-component/customer-profile-component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'summary',
        loadComponent: () => import('./components/customer-summary/customer-summary').then(m => m.CustomerSummary)
      },
      {
        path: 'loan-schemes',
        loadComponent: () => import('./components/loan-schemes-customer/loan-schemes-customer').then(m => m.LoanSchemesCustomer)
      },
      {
        path: 'scheme-details/:id',
        loadComponent: () => import('./components/loan-scheme-details/loan-scheme-details').then(m => m.LoanSchemeDetails)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/customer-notifications/customer-notifications').then(m => m.CustomerNotifications)
      },
      {
        path: 'feedback-history',
        loadComponent: () => import('./components/customer-feedback-history/customer-feedback-history').then(m => m.CustomerFeedbackHistory)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/customer-settings/customer-settings').then(m => m.CustomerSettings)
      },
      {
        path: 'make-payment',
        loadComponent: () => import('./components/make-payment/make-payment').then(m => m.MakePayment)
      },
      {
        path: 'emi-calculator',
        loadComponent: () => import('./components/emi-calculator/emi-calculator').then(m => m.EmiCalculator)
      }
    ]
  },

  // 👤 SHARED USER ROUTES (Accessible to all authenticated users)
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile').then(m => m.Profile)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings').then(m => m.Settings)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications').then(m => m.Notifications)
      }
    ]
  },

  // 📄 SHARED ROUTES (Accessible to multiple roles)
  {
    path: 'loans',
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] },
    children: [
      {
        path: 'list',
        loadComponent: () => import('./components/loans/loans').then(m => m.Loans)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./components/loan-details/loan-details').then(m => m.LoanDetails)
      }
    ]
  },

  {
    path: 'applications',
    canActivate: [authGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] },
    children: [
      {
        path: 'list',
        loadComponent: () => import('./components/loan-application/loan-application').then(m => m.LoanApplications)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./components/application-details/application-details').then(m => m.ApplicationDetails)
      }
    ]
  },

  {
    path: 'documents',
    canActivate: [authGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] },
    children: [
      {
        path: 'list',
        loadComponent: () => import('./components/documents/documents').then(m => m.Documents)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./components/document-details/document-details').then(m => m.DocumentDetails)
      }
    ]
  },

  {
    path: 'repayments',
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] },
    children: [
      {
        path: 'history',
        loadComponent: () => import('./components/repayments/repayments').then(m => m.Repayments)
      }
    ]
  },

  // 🚫 ERROR ROUTES
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/not-found-component/not-found-component').then(m => m.NotFoundComponent),
    canActivate: [authGuard],
    data: { roles: [Role.Customer, Role.LoanOfficer, Role.Admin] }
  },

  // 🚫 FALLBACK
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' }
];

/* ============================================
   IMPLEMENTATION NOTES:
   ============================================

   1. CREATE THREE LAYOUT COMPONENTS:
      - admin-layout/admin-layout.component.ts (Use the AdminLayout from artifact)
      - officer-layout/officer-layout.component.ts (Copy AdminLayout and customize for Officer)
      - customer-layout/customer-layout.component.ts (Copy AdminLayout and customize for Customer)

   2. Each layout component should:
      - Have its own navigation structure
      - Use <router-outlet> for child routes
      - Have proper navbar and sidebar

   3. REMOVE OLD NAVBAR COMPONENTS from individual pages:
      - Remove <app-admin-navbar> from admin-dashboard
      - Remove officer navbar from officer-dashboard
      - Remove customer navbar from customer-dashboard

   4. BENEFITS:
      - Clean separation by role
      - Each role has its own navigation
      - No layout duplication
      - Easier maintenance
      - Proper route organization

   5. URL STRUCTURE:
      - Admin: /admin/dashboard, /admin/users, etc.
      - Officer: /officer/dashboard, /officer/customers, etc.
      - Customer: /customer/dashboard, /customer/loans, etc.

   ============================================
*/