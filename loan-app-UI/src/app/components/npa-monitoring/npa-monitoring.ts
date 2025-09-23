import { Component, inject } from '@angular/core';
import { NPA } from '../../models/npa';
import { NpaService } from '../../services/npa-service';
import { ToastService } from '../../services/toast-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-npa-monitoring',
  imports: [DatePipe],
  templateUrl: './npa-monitoring.html',
  styleUrl: './npa-monitoring.css'
})
export class NpaMonitoring {
 npas: NPA[] = [];
  isLoading = true;

  private npaService = inject(NpaService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadNPAs();
  }

  loadNPAs(): void {
    this.npaService.getAllNPAs().subscribe({
      next: (res) => {
        this.npas = res;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load NPA data');
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Standard': return 'success';
      case 'Substandard': return 'warning';
      case 'Doubtful': return 'danger';
      case 'Loss': return 'dark';
      default: return 'secondary';
    }
  }

}
