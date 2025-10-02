import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { LoanOfficer } from '../../models/loan-officer';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-officer-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './officer-manager-component.html',
  styleUrls: ['./officer-manager-component.css']
})
export class OfficerManagerComponent implements OnInit {
  officerForm!: FormGroup;
  editingOfficer: LoanOfficer | null = null;
  isEditing = false;
  private modalInstance: any;

  private fb = inject(FormBuilder);
  private officerService = inject(OfficerService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.officerService.getAllOfficers().subscribe({
        next: officers => {
          const officer = officers.find(o => o.officerId === +id);
          if (officer) {
            this.startEdit(officer);
          } else {
            this.toast.error('⚠️ Officer not found');
            this.startAdd();
          }
          setTimeout(() => this.openModal(), 0);
        },
        error: () => {
          this.toast.error('❌ Failed to load officers');
          this.startAdd();
          setTimeout(() => this.openModal(), 0);
        }
      });
    } else {
      this.startAdd();
      setTimeout(() => this.openModal(), 0);
    }
  }

  initForm(): void {
    this.officerForm = this.fb.group({
      city: ['', Validators.required],
      designation: ['', Validators.required],
      specialization: ['', Validators.required],
      currentWorkload: [0, Validators.required],
      maxLoansAssigned: [0, [Validators.required, Validators.min(1)]],
      isActive: [true],

      user: this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [''],
        passwordHash: ['', Validators.required],
        role: ['LoanOfficer', Validators.required]
      })
    });
  }

  startAdd(): void {
    this.editingOfficer = null;
    this.isEditing = false;
    this.officerForm.reset({
      city: '',
      designation: '',
      specialization: '',
      currentWorkload:0,
      maxLoansAssigned: 10,
      isActive: true,
      user: {
        username: '',
        email: '',
        phoneNumber: '',
        passwordHash: '',
        role: 'LoanOfficer'
      }
    });
    this.cd.detectChanges();
  }

  startEdit(officer: LoanOfficer): void {
    this.editingOfficer = officer;
    this.isEditing = true;

    this.officerForm.patchValue({
      city: officer.city,
      designation: officer.designation,
      specialization: officer.specialization,
      currentWorkload: officer.currentWorkload,
      maxLoansAssigned: officer.maxLoansAssigned,
      isActive: officer.isActive,
      user: officer.user ? {
        username: officer.user.username,
        email: officer.user.email,
        phoneNumber: officer.user.phoneNumber,
        passwordHash: '', // do not prefill
        role: officer.user.role
      } : {}
    });

    this.cd.detectChanges();
  }

  openModal(): void {
    const modalElement = document.getElementById('officerModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) this.modalInstance.hide();
    this.location.back();
  }

  saveOfficer(): void {
    const onSuccess = (msg: string) => {
      this.toast.success(msg);
      if (this.modalInstance) this.modalInstance.hide();
      this.location.back();
    };

    const onError = (msg: string) => this.toast.error(msg);

    if (this.isEditing && this.editingOfficer) {
      const payload = { ...this.officerForm.value, officerId: this.editingOfficer.officerId };
      this.officerService.updateOfficer(this.editingOfficer.officerId, payload).subscribe({
        next: () => onSuccess('✅ Officer updated'),
        error: () => onError('❌ Failed to update')
      });
    } else {
      this.officerService.createOfficer(this.officerForm.value).subscribe({
        next: () => onSuccess('✅ Officer added'),
        error: () => onError('❌ Failed to add')
      });
    }
  }
}
