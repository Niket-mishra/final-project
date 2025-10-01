import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { CustomerService } from '../../services/customer-service';
import { Customer, DocumentType, Gender, VerificationStatus } from '../../models/customer';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { Location } from '@angular/common';

type UiCustomer = Omit<Customer, 'gender' | 'verificationStatus' | 'dateOfBirth' | 'createdAt' | 'updatedAt' | 'verifiedAt' | 'documentType'> & {
	gender: Gender;
	verificationStatus: VerificationStatus;
	dateOfBirth: Date;
	createdAt: Date;
	updatedAt?: Date;
	verifiedAt?: Date;
	documentType: DocumentType;
	panMasked?: string;
	aadhaarMasked?: string;
	downloadUrl?: string;
};

@Component({
	selector: 'app-customer-profile',
	standalone: true,
	imports: [ NgClass, DatePipe, DecimalPipe ],
	templateUrl: './customer-profile-component.html',
	styleUrls: ['./customer-profile-component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerProfileComponent {
  @Input() selectedCustomer: Customer | null = null;  
  @Output() close = new EventEmitter<void>();
	private readonly customerService = inject(CustomerService);
	private readonly auth = inject(Auth);
	private readonly userService = inject(UserService);
	private readonly location = inject(Location);

	// UI state
	readonly loading = signal(true);
	readonly error = signal<string | null>(null);

	// Source stream: auth → roleEntity → customer
	private readonly customer$ = of(null).pipe(
		switchMap(() => {
			const userId = this.auth.getUserId();
			if (!userId) {
				return of({ kind: 'error', message: 'No userId found in Auth' } as const);
			}
			return this.userService.getRoleEntityId(userId).pipe(
				switchMap(({ roleEntityId }) => this.customerService.getCustomerById(roleEntityId)),
				map((raw) => ({ kind: 'ok', data: this.transformCustomer(raw) } as const)),
				// Optionally add a light retry for transient errors
				catchError(err => of({ kind: 'error', message: 'Could not load customer', err } as const))
			);
		})
	);

	// View model derived from stream with loading and error signals synced
	readonly vm = computed<{
		customer: UiCustomer | null;
	}>(() => ({ customer: null }));

	constructor() {
		// Bridge observable into signals for loading and error handling
		this.loading.set(true);
		this.customer$.subscribe(result => {
			if (result.kind === 'ok') {
				this.error.set(null);
				this._customer.set(result.data);
			} else {
				this.error.set(result.message);
				this._customer.set(null);
			}
			this.loading.set(false);
		});
	}

	private readonly _customer = signal<UiCustomer | null>(null);
	readonly customer = computed(() => this._customer());

	closeProfile(): void {
		this.location.back();
	}

	getStatusColor(status: VerificationStatus): string {
		switch (status) {
			case VerificationStatus.Verified: return 'success';
			case VerificationStatus.Rejected: return 'danger';
			case VerificationStatus.Pending: return 'warning';
			default: return 'secondary';
		}
	}

	private transformCustomer(data: any): UiCustomer {
		const c: UiCustomer = {
			...data,
			gender: this.mapGender(data.gender),
			verificationStatus: this.mapVerificationStatus(data.verificationStatus),
			dateOfBirth: new Date(data.dateOfBirth),
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
			verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
			documentType: this.mapDocumentType(data.documentType),
			panMasked: this.maskPan(data.panNumber),
			aadhaarMasked: this.maskAadhaar(data.aadhaarNumber),
			downloadUrl: this.buildDownloadUrl(data.customerId)
		};
		return c;
	}

	private mapDocumentType(value: number): DocumentType {
		return [DocumentType.Pan, DocumentType.Aadhaar, DocumentType.Passport, DocumentType.DrivingLicense][value] ?? DocumentType.Pan;
	}
	private mapGender(value: number): Gender {
		return [Gender.Male, Gender.Female, Gender.Other][value] ?? Gender.Other;
	}
	private mapVerificationStatus(value: number): VerificationStatus {
		return [VerificationStatus.Pending, VerificationStatus.Verified, VerificationStatus.Rejected][value] ?? VerificationStatus.Pending;
	}

	private maskPan(pan?: string): string | undefined {
		if (!pan) return undefined;
		// Keep first 3 and last 1, mask the rest
		return pan.replace(/^(.{3})(.*)(.)$/, (_, a, mid, z) => `${a}${'*'.repeat(mid.length)}${z}`);
	}

	private maskAadhaar(aadhaar?: string): string | undefined {
		if (!aadhaar) return undefined;
		const digits = aadhaar.replace(/\D/g, '');
		// Show last 4 only
		return `•••• •••• •••• ${digits.slice(-4)}`;
	}

	private buildDownloadUrl(customerId?: number): string | undefined {
		if (!customerId) return undefined;
		// Prefer an API that streams with auth, else fallback
		return `/api/customers/${encodeURIComponent(String(customerId))}/document`;
	}
}