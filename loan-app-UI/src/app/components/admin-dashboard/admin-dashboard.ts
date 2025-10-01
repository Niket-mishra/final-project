// ============================================
// ENHANCED ADMIN DASHBOARD COMPONENT
// ============================================

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanSchemeService } from '../../services/loan-scheme';
import { ToastService } from '../../services/toast-service';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';

interface AdminStats {
  applications: {
    total: number;
    byStatus: { pending: number; approved: number; rejected: number; disbursed: number; underReview: number; };
    unassigned: number;
    trends: { weeklyGrowth: number; monthlyGrowth: number; };
  };
  financial: {
    totalDisbursed: number;
    pendingAmount: number;
    averageLoanAmount: number;
  };
  schemes: { total: number; active: number; mostPopular: string; };
  officers: { total: number; activeToday: number; };
  performance: { avgProcessingTime: number; approvalRate: number; };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  actor: { name: string; role: string; };
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface Alert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  actionLink?: string;
  isRead: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header with Alerts -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">🛠️ Admin Dashboard</h2>
          <p class="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" (click)="refreshDashboard()">
            🔄 Refresh
          </button>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown">
              📊 Export
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" (click)="exportData('PDF')">PDF Report</a></li>
              <li><a class="dropdown-item" (click)="exportData('EXCEL')">Excel</a></li>
            </ul>
          </div>
        </div>
      </div>

      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      } @else {
        
        <!-- Critical Alerts Banner -->
        @if (alerts.length > 0) {
          <div class="alert-banner mb-4">
            @for (alert of alerts.slice(0, 2); track alert.id) {
              <div class="alert alert-{{ alert.type === 'ERROR' ? 'danger' : alert.type === 'WARNING' ? 'warning' : 'info' }} 
                          alert-dismissible fade show">
                <strong>{{ alert.title }}</strong> {{ alert.message }}
                @if (alert.actionLink) {
                  <a [routerLink]="alert.actionLink" class="alert-link ms-2">Take Action →</a>
                }
                <button type="button" class="btn-close" (click)="dismissAlert(alert.id)"></button>
              </div>
            }
          </div>
        }

        <!-- Key Metrics Grid -->
        <div class="row g-3 mb-4">
          <!-- Total Applications -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Total Applications</p>
                    <h3 class="fw-bold mb-0">{{ stats.applications.total | number }}</h3>
                    <span class="badge bg-success-subtle text-success mt-2">
                      <i class="bi bi-arrow-up"></i> {{ stats.applications.trends.weeklyGrowth }}%
                    </span>
                  </div>
                  <div class="metric-icon bg-primary-subtle">
                    <span class="fs-3">📄</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Review -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Pending Review</p>
                    <h3 class="fw-bold mb-0 text-warning">{{ stats.applications.byStatus.pending | number }}</h3>
                    <a [routerLink]="['/applications/list']" 
                       [queryParams]="{status: 'pending'}"
                       class="small text-decoration-none mt-2 d-inline-block">
                      Review Now →
                    </a>
                  </div>
                  <div class="metric-icon bg-warning-subtle">
                    <span class="fs-3">⏳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Disbursed -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Total Disbursed</p>
                    <h3 class="fw-bold mb-0 text-success">₹{{ stats.financial.totalDisbursed | number:'1.0-0' }}</h3>
                    <p class="small text-muted mb-0 mt-1">
                      Avg: ₹{{ stats.financial.averageLoanAmount | number:'1.0-0' }}
                    </p>
                  </div>
                  <div class="metric-icon bg-success-subtle">
                    <span class="fs-3">💸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approval Rate -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Approval Rate</p>
                    <h3 class="fw-bold mb-0">{{ stats.performance.approvalRate }}%</h3>
                    <div class="progress mt-2" style="height: 6px;">
                      <div class="progress-bar bg-success" 
                           [style.width.%]="stats.performance.approvalRate"></div>
                    </div>
                  </div>
                  <div class="metric-icon bg-info-subtle">
                    <span class="fs-3">📊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-warning mb-2">⏳</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.byStatus.pending }}</h5>
                <small class="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-info mb-2">🔍</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.byStatus.underReview }}</h5>
                <small class="text-muted">Under Review</small>
              </div>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-success mb-2">✅</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.byStatus.approved }}</h5>
                <small class="text-muted">Approved</small>
              </div>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-danger mb-2">❌</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.byStatus.rejected }}</h5>
                <small class="text-muted">Rejected</small>
              </div>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-primary mb-2">💰</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.byStatus.disbursed }}</h5>
                <small class="text-muted">Disbursed</small>
              </div>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-dark mb-2">🎯</div>
                <h5 class="fw-bold mb-0">{{ stats.applications.unassigned }}</h5>
                <small class="text-muted">Unassigned</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row g-4 mb-4">
          <!-- Application Trends -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">📈 Application Trends</h5>
              </div>
              <div class="card-body">
                <p-chart type="line" [data]="lineChartData" [options]="lineChartOptions"></p-chart>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">🥧 Status Distribution</h5>
              </div>
              <div class="card-body">
                <p-chart type="doughnut" [data]="pieChartData" [options]="pieChartOptions"></p-chart>
              </div>
            </div>
          </div>
        </div>

        <!-- Scheme Performance -->
        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">🏆 Top Performing Schemes</h5>
              </div>
              <div class="card-body">
                <p-chart type="bar" [data]="barChartData" [options]="barChartOptions"></p-chart>
              </div>
            </div>
          </div>

          <!-- Officer Performance -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">👥 Officer Performance</h5>
                <span class="badge bg-primary">{{ stats.officers.activeToday }} Active Today</span>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <p class="mb-1 text-muted small">Total Officers</p>
                    <h4 class="fw-bold mb-0">{{ stats.officers.total }}</h4>
                  </div>
                  <div>
                    <p class="mb-1 text-muted small">Avg Processing Time</p>
                    <h4 class="fw-bold mb-0">{{ stats.performance.avgProcessingTime }}d</h4>
                  </div>
                </div>
                <a [routerLink]="['/admin/officers']" class="btn btn-outline-primary btn-sm w-100">
                  View All Officers
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity & Quick Actions -->
        <div class="row g-4 mb-4">
          <!-- Recent Activity -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">🕵️ Recent Activity</h5>
                <a [routerLink]="['/admin/audit-log']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                <div class="activity-list">
                  @for (log of auditLogs; track log.id) {
                    <div class="activity-item d-flex align-items-start p-3 border-bottom">
                      <div class="activity-icon me-3 mt-1">
                        <span class="badge rounded-pill" 
                              [class]="log.severity === 'CRITICAL' ? 'bg-danger' : 
                                       log.severity === 'WARNING' ? 'bg-warning' : 'bg-info'">
                          {{ log.severity === 'CRITICAL' ? '🚨' : 
                             log.severity === 'WARNING' ? '⚠️' : 'ℹ️' }}
                        </span>
                      </div>
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                          <strong class="small">{{ log.action }}</strong>
                          <small class="text-muted">{{ log.timestamp | date:'short' }}</small>
                        </div>
                        <p class="small text-muted mb-1">by {{ log.actor.name }} ({{ log.actor.role }})</p>
                        <p class="small mb-0">{{ log.details }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">⚡ Quick Actions</h5>
              </div>
              <div class="card-body p-2">
                <div class="d-grid gap-2">
                  <a [routerLink]="['/admin/loan-schemes/create']" 
                     class="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>➕ Create New Scheme</span>
                  </a>
                  <a [routerLink]="['/applications/list']" 
                     [queryParams]="{filter: 'unassigned'}"
                     class="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>🎯 Assign Officers</span>
                    @if (stats.applications.unassigned > 0) {
                      <span class="badge bg-danger">{{ stats.applications.unassigned }}</span>
                    }
                  </a>
                  <a [routerLink]="['/admin/reports']" 
                     class="btn btn-outline-info btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>📊 Generate Reports</span>
                  </a>
                  <a [routerLink]="['/applications/list']" 
                     [queryParams]="{status: 'pending'}"
                     class="btn btn-outline-warning btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>✅ Bulk Approve</span>
                  </a>
                  <a [routerLink]="['/admin/settings']" 
                     class="btn btn-outline-secondary btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>⚙️ Settings</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- System Status -->
            <div class="card border-0 shadow-sm mt-3">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">💚 System Status</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">API Response Time</span>
                  <span class="badge bg-success">Fast</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Database</span>
                  <span class="badge bg-success">Healthy</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small">Last Backup</span>
                  <span class="small text-muted">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 1.5rem;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .metric-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-card {
      transition: transform 0.2s;
      cursor: pointer;
    }

    .status-card:hover {
      transform: translateY(-2px);
    }

    .status-icon {
      font-size: 1.5rem;
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item:last-child {
      border-bottom: none !important;
    }

    .activity-item:hover {
      background-color: #f8f9fa;
    }

    .alert-banner {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-header {
      font-weight: 500;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class AdminDashboard implements OnInit {
  isLoading = true;
  
  stats: AdminStats = {
    applications: {
      total: 0,
      byStatus: { pending: 0, approved: 0, rejected: 0, disbursed: 0, underReview: 0 },
      unassigned: 0,
      trends: { weeklyGrowth: 0, monthlyGrowth: 0 }
    },
    financial: { totalDisbursed: 0, pendingAmount: 0, averageLoanAmount: 0 },
    schemes: { total: 0, active: 0, mostPopular: '' },
    officers: { total: 0, activeToday: 0 },
    performance: { avgProcessingTime: 0, approvalRate: 0 }
  };

  auditLogs: AuditLog[] = [];
  alerts: Alert[] = [];
  
  pieChartData: any;
  lineChartData: any;
  barChartData: any;
  pieChartOptions: any;
  lineChartOptions: any;
  barChartOptions: any;

  private applicationService = inject(LoanApplicationService);
  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  

  ngOnInit(): void {
    this.initializeChartOptions();
    this.loadDashboardData();
    setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load application summary
    this.applicationService.getApplicationSummary(0).subscribe({
      next: (summary) => {
        this.stats.applications.total = summary.total;
        this.stats.applications.byStatus = {
          pending: summary.pending,
          approved: summary.approved,
          rejected: summary.rejected,
          disbursed: summary.disbursed,
          underReview: summary.underReview || 0
        };
        
        // Calculate trends (mock data - replace with real calculations)
        this.stats.applications.trends = {
          weeklyGrowth: 12.5,
          monthlyGrowth: 23.8
        };
        
        // Calculate performance metrics
        const total = summary.total || 1;
        this.stats.performance.approvalRate = 
          Math.round((summary.approved / total) * 100);
        
        this.prepareCharts();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load dashboard data');
        this.isLoading = false;
      }
    });

    // Load schemes
    this.schemeService.getLoanSchemes().subscribe({
      next: (schemes) => {
        this.stats.schemes.total = schemes.length;
        this.stats.schemes.active = schemes.filter((s: any) => s.isActive).length;
      },
      error: () => this.toast.error('Failed to load schemes')
    });

    // Load unassigned count
    this.applicationService.getUnassignedCount().subscribe({
      next: (count) => this.stats.applications.unassigned = count,
      error: () => {}
    });

    // Load audit logs
    this.applicationService.getAuditLog(0).subscribe({
      next: (logs) => this.auditLogs = logs.slice(0, 5),
      error: () => {}
    });

    // Mock financial data
    this.stats.financial = {
      totalDisbursed: 45000000,
      pendingAmount: 12000000,
      averageLoanAmount: 250000
    };

    // Mock officer data
    this.stats.officers = {
      total: 24,
      activeToday: 18
    };

    this.stats.performance.avgProcessingTime = 5;

    // Mock alerts
    this.alerts = [
      {
        id: '1',
        type: 'WARNING',
        title: 'Action Required:',
        message: '15 applications pending review for over 7 days',
        actionLink: '/applications/list',
        isRead: false
      }
    ];
  }

  prepareCharts(): void {
    const { pending, approved, rejected, disbursed, underReview } = this.stats.applications.byStatus;

    // Pie Chart
    this.pieChartData = {
      labels: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed'],
      datasets: [{
        data: [pending, underReview, approved, rejected, disbursed],
        backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545', '#007bff'],
        borderWidth: 0
      }]
    };

    // Line Chart - Trends
    this.lineChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Applications',
          data: [65, 78, 90, 105, 115, 128, 142],
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Approvals',
          data: [45, 55, 65, 75, 85, 95, 108],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Bar Chart - Scheme Performance
    this.barChartData = {
      labels: ['Education Loan', 'Business Loan', 'Agriculture Loan', 'Home Loan', 'Personal Loan'],
      datasets: [{
        label: 'Applications',
        data: [45, 38, 52, 28, 35],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6c757d']
      }]
    };
  }

  initializeChartOptions(): void {
    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }

  refreshDashboard(): void {
    this.toast.info('Refreshing dashboard...');
    this.loadDashboardData();
  }

  exportData(format: string): void {
    this.toast.success(`Exporting data as ${format}...`);
    // Implement export logic
  }

  dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
}