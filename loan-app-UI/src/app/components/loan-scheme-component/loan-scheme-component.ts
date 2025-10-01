import { CommonModule, Location } from "@angular/common";
import { Component, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { LoanScheme } from "../../models/loan-scheme";
import { LoanSchemeService } from "../../services/loan-scheme";
import { ToastService } from "../../services/toast-service";

declare var bootstrap: any;

@Component({
  selector: 'app-loan-scheme-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './loan-scheme-component.html',
  styleUrls: ['./loan-scheme-component.css']
})
export class LoanSchemeComponent implements OnInit {
  editingScheme: LoanScheme | null = null;
  form: any = {};

  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Fetch all schemes to find the one to edit
      this.schemeService.getLoanSchemes().subscribe({
        next: schemes => {
          const scheme = schemes.find(s => s.schemeId === +id);

          if (scheme) {
            this.startEdit(scheme);
          } else {
            this.toast.error('⚠️ Scheme not found');
            this.startAdd();
          }

          // Open modal after form is ready
          setTimeout(() => this.openModal(), 0);
        },
        error: () => {
          this.toast.error('❌ Failed to load schemes');
          this.startAdd();
          setTimeout(() => this.openModal(), 0);
        }
      });
    } else {
      this.startAdd();
      setTimeout(() => this.openModal(), 0);
    }
  }

  startAdd(): void {
    this.editingScheme = null;
    this.form = {};
    this.cd.detectChanges();
  }

  startEdit(scheme: LoanScheme): void {
    if (!scheme || !scheme.schemeId) {
      this.toast.error('⚠️ Invalid scheme data');
      this.startAdd();
      return;
    }

    this.editingScheme = scheme;
    this.form = { ...scheme };

    // Force Angular to detect changes so ngModel binds properly
    this.cd.detectChanges();
  }

  openModal(): void {
    const modalElement = document.getElementById('schemeModal');
    if (modalElement) {
      new bootstrap.Modal(modalElement).show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('schemeModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();

    // Navigate back to /admin/loan-schemes
    this.location.back();
  }

  saveScheme(): void {
    const modalElement = document.getElementById('schemeModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);

    const onSuccess = (message: string) => {
      this.toast.success(message);
      if (modalInstance) modalInstance.hide();
      this.location.back();
    };

    const onError = (message: string) => this.toast.error(message);

    if (this.editingScheme) {
      this.schemeService.updateLoanScheme(this.form).subscribe({
        next: () => onSuccess('✅ Scheme updated'),
        error: () => onError('❌ Failed to update')
      });
    } else {
      this.schemeService.createLoanScheme(this.form).subscribe({
        next: () => onSuccess('✅ Scheme added'),
        error: () => onError('❌ Failed to add')
      });
    }
  }
}
