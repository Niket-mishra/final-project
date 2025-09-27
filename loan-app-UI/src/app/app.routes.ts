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
    data: { roles: [ Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'documents/details/:id',
    loadComponent: () => import('./components/document-details/document-details').then(m => m.DocumentDetails),
    canActivate: [authGuard],
    data: { roles: [ Role.LoanOfficer, Role.Admin] }
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
  {
    path: 'customer/loans',
    loadComponent: () => import('./components/customer-loans/customer-loans').then(m => m.CustomerLoans),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/applications',
    loadComponent: () => import('./components/customer-applications/customer-applications').then(m => m.CustomerApplications),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/documents',
    loadComponent: () => import('./components/customer-documents/customer-documents').then(m => m.CustomerDocuments),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/queries',
    loadComponent: () => import('./components/customer-query-form/customer-query-form').then(m => m.CustomerQueryForm),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/repayments',
    loadComponent: () => import('./components/customer-repayments/customer-repayments').then(m => m.CustomerRepayments),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/profile',
    loadComponent: () => import('./components/customer-profile-component/customer-profile-component').then(m => m.CustomerProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/summary',
    loadComponent: () => import('./components/customer-summary/customer-summary').then(m => m.CustomerSummary),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/feedback',
    loadComponent: () => import('./components/feedback-form/feedback-form').then(m => m.FeedbackForm),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/loan-schemes',
    loadComponent: () => import('./components/loan-schemes-customer/loan-schemes-customer').then(m => m.LoanSchemesCustomer),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/notifications',
    loadComponent: () => import('./components/customer-notifications/customer-notifications').then(m => m.CustomerNotifications),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/queries/list',
    loadComponent: () => import('./components/customer-queries-list/customer-queries-list').then(m => m.CustomerQueriesList),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/repayment-schedule',
    loadComponent: () => import('./components/repayment-schedule/repayment-schedule').then(m => m.RepaymentSchedule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/feedback-history',
    loadComponent: () => import('./components/customer-feedback-history/customer-feedback-history').then(m => m.CustomerFeedbackHistory),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/settings',
    loadComponent: () => import('./components/customer-settings/customer-settings').then(m => m.CustomerSettings),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/scheme-details/:id',
    loadComponent: () => import('./components/loan-scheme-details/loan-scheme-details').then(m => m.LoanSchemeDetails),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/make-payment',
    loadComponent: () => import('./components/make-payment/make-payment').then(m => m.MakePayment),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] }
  },
  {
    path: 'customer/emi-calculator',
    loadComponent: () => import('./components/emi-calculator/emi-calculator').then(m => m.EmiCalculator),
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
  {
    path: 'officer/profile',
    loadComponent: () => import('./components/officer-profile-component/officer-profile-component').then(m => m.OfficerProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/assigned-applications',
    loadComponent: () => import('./components/assigned-applications/assigned-applications').then(m => m.AssignedApplications),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/repayments',
    loadComponent: () => import('./components/officer-repayments/officer-repayments').then(m => m.OfficerRepayments),
    canActivate: [authGuard, roleGuard],
  data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/documents',
    loadComponent: () => import('./components/officer-documents/officer-documents').then(m => m.OfficerDocuments),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/loan-schemes',
    loadComponent: () => import('./components/loan-schemes-officer/loan-schemes-officer').then(m => m.LoanSchemesOfficer),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/feedback',
    loadComponent: () => import('./components/officer-feedback/officer-feedback').then(m => m.OfficerFeedback),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/customers/:id',
    loadComponent: () => import('./components/customer-details/customer-details').then(m => m.CustomerDetails),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer, Role.Admin] }
  },
  {
    path: 'officer/assignments',
    loadComponent: () => import('./components/officer-assignments/officer-assignments').then(m => m.OfficerAssignments),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/summary',
    loadComponent: () => import('./components/officer-summary/officer-summary').then(m => m.OfficerSummary),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/workload',
    loadComponent: () => import('./components/workload-meter-officer/workload-meter-officer').then(m => m.WorkloadMeterOfficer),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/repayment-schedule',
    loadComponent: () => import('./components/repayment-schedule/repayment-schedule').then(m => m.RepaymentSchedule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/loan-approvals',
    loadComponent: () => import('./components/loan-approvals/loan-approvals').then(m => m.LoanApprovals),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/document-verification',
    loadComponent: () => import('./components/document-verification/document-verification').then(m => m.DocumentVerification),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/generate-report',
    loadComponent: () => import('./components/report-generation/report-generation').then(m => m.ReportGeneration),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/notifications',
    loadComponent: () => import('./components/officer-notifications/officer-notifications').then(m => m.OfficerNotifications),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/scheme-details/:id',
    loadComponent: () => import('./components/loan-scheme-details/loan-scheme-details').then(m => m.LoanSchemeDetails),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/feedback-history',
    loadComponent: () => import('./components/officer-feedback-history/officer-feedback-history').then(m => m.OfficerFeedbackHistory),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
  },
  {
    path: 'officer/settings',
    loadComponent: () => import('./components/officer-settings/officer-settings').then(m => m.OfficerSettings),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LoanOfficer] }
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
  {
  path: 'admin/assign-officer/:applicationId',
  loadComponent: () => import('./components/assign-officer/assign-officer').then(m => m.AssignOfficerComponent),
  canActivate: [authGuard, roleGuard],
  data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/officer-manager',
    loadComponent: () => import('./components/officer-manager-component/officer-manager-component').then(m => m.OfficerManagerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/scheme-manager/:id',
    loadComponent: () => import('./components/loan-scheme-component/loan-scheme-component').then(m => m.LoanSchemeComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/workload-meter',
    loadComponent: () => import('./components/workload-meter-component/workload-meter-component').then(m => m.WorkloadMeterComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./components/admin-settings/admin-settings').then(m => m.AdminSettings),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/notifications',
    loadComponent: () => import('./components/admin-notifications/admin-notifications').then(m => m.AdminNotifications),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'admin/feedback-history',
    loadComponent: () => import('./components/admin-feedback-history/admin-feedback-history').then(m => m.AdminFeedbackHistory),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] }
  },
 

  // 🚫 Fallback
   {
  path: 'unauthorized',
  loadComponent: () => import('./components/unauthorized/unauthorized').then(m => m.Unauthorized)
},
  { path: '**', redirectTo: 'auth/login', pathMatch: 'full' }
];