import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { LoanOfficer } from '../../models/loan-officer';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-officer-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './officer-manager-component.html',
  styleUrls: ['./officer-manager-component.css']
})
export class OfficerManagerComponent implements OnInit {
  officers: LoanOfficer[] = [];
  officerForm!: FormGroup;
  isEditing = false;
  selectedOfficerId: number | null = null;

  private fb = inject(FormBuilder);
  private officerService = inject(OfficerService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.loadOfficers();
  }

  initForm(): void {
    this.officerForm = this.fb.group({
      city: ['', Validators.required],
      designation: ['', Validators.required],
      specialization: ['', Validators.required],
      maxLoansAssigned: [10, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  loadOfficers(): void {
    this.officerService.getAllOfficers().subscribe({
      next: (res) => this.officers = res,
      error: () => this.toast.error('Failed to load officers')
    });
  }

  submitOfficer(): void {
    if (this.officerForm.invalid) return;

    const payload = this.officerForm.value;

    if (this.isEditing && this.selectedOfficerId) {
      this.officerService.updateOfficer(this.selectedOfficerId, payload).subscribe({
        next: () => {
          this.toast.success('Officer updated');
          this.resetForm();
          this.loadOfficers();
        },
        error: () => this.toast.error('Update failed')
      });
    } else {
      this.officerService.createOfficer(payload).subscribe({
        next: () => {
          this.toast.success('Officer added');
          this.resetForm();
          this.loadOfficers();
        },
        error: () => this.toast.error('Creation failed')
      });
    }
  }

  editOfficer(officer: LoanOfficer): void {
    this.isEditing = true;
    this.selectedOfficerId = officer.officerId;
    this.officerForm.patchValue(officer);
  }

  toggleOfficerStatus(officer: LoanOfficer): void {
    const updated = { ...officer, isActive: !officer.isActive };
    this.officerService.updateOfficer(officer.officerId, updated).subscribe({
      next: () => {
        this.toast.success(`Officer ${updated.isActive ? 'activated' : 'deactivated'}`);
        this.loadOfficers();
      },
      error: () => this.toast.error('Status update failed')
    });
  }

  resetForm(): void {
    this.officerForm.reset({ isActive: true });
    this.isEditing = false;
    this.selectedOfficerId = null;
  }
}