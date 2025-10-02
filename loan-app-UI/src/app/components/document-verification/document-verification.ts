
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document-service';
import { LoanDocument } from '../../models/loan-document';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-verification.html',
  styleUrl: './document-verification.css'
})
export class DocumentVerification implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  documents: LoanDocument[] = [];
  filteredDocuments: LoanDocument[] = [];
  
  searchTerm = '';
  documentTypeFilter = '';
  sortBy = 'date-desc';

  showVerifyModal = false;
  showRejectModal = false;
  selectedDocument: LoanDocument | null = null;
  verifyRemarks = '';
  rejectReason = '';
  rejectRemarks = '';
  isProcessing = false;
  processingDocId: number | null = null;
  processingAction: 'verify' | 'reject' | null = null;

  private destroy$ = new Subject<void>();

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.documentService.getPendingDocuments()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data: LoanDocument[]) => {
          this.documents = data;
          this.filterDocuments();
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.errorMessage = 'Unable to load documents. Please try again.';
        }
      });
  }

  filterDocuments(): void {
    let filtered = [...this.documents];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.documentType?.toLowerCase().includes(search) ||
        doc.loanApplication?.customer?.firstName?.toLowerCase().includes(search) ||
        doc.loanApplication?.customer?.lastName?.toLowerCase().includes(search)
      );
    }

    // Document type filter
    if (this.documentTypeFilter) {
      filtered = filtered.filter(doc => 
        doc.documentType?.includes(this.documentTypeFilter)
      );
    }

    this.filteredDocuments = filtered;
    this.sortDocuments();
  }

  sortDocuments(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredDocuments.sort((a, b) => 
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        break;
      case 'date-asc':
        this.filteredDocuments.sort((a, b) => 
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        );
        break;
      case 'customer':
        this.filteredDocuments.sort((a, b) => 
          (a.loanApplication?.customer?.firstName || '').localeCompare(
            b.loanApplication?.customer?.firstName || ''
          )
        );
        break;
      case 'type':
        this.filteredDocuments.sort((a, b) => 
          (a.documentType || '').localeCompare(b.documentType || '')
        );
        break;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.documentTypeFilter = '';
    this.sortBy = 'date-desc';
    this.filterDocuments();
  }

  getUniqueCustomersCount(): number {
    const customerIds = new Set(
      this.documents.map(doc => doc.loanApplication?.customer?.customerId)
    );
    return customerIds.size;
  }

  getTodayDocumentsCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.documents.filter(doc => 
      new Date(doc.uploadedAt) >= today
    ).length;
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  }

  getWaitingTime(uploadedAt: string): string {
    const uploaded = new Date(uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - uploaded.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'Just now';
  }

  isUrgent(uploadedAt: string): boolean {
    const uploaded = new Date(uploadedAt);
    const now = new Date();
    const diffHours = (now.getTime() - uploaded.getTime()) / (1000 * 60 * 60);
    return diffHours > 24; // More than 24 hours
  }

  viewDocument(doc: LoanDocument): void {
    if (doc.filePath) {
      window.open(doc.filePath, '_blank');
    }
  }

  openVerifyModal(doc: LoanDocument): void {
    this.selectedDocument = doc;
    this.verifyRemarks = '';
    this.showVerifyModal = true;
  }

  openRejectModal(doc: LoanDocument): void {
    this.selectedDocument = doc;
    this.rejectReason = '';
    this.rejectRemarks = '';
    this.showRejectModal = true;
  }

  closeModals(): void {
    this.showVerifyModal = false;
    this.showRejectModal = false;
    this.selectedDocument = null;
    this.verifyRemarks = '';
    this.rejectReason = '';
    this.rejectRemarks = '';
  }

  confirmVerify(): void {
    if (!this.selectedDocument) return;

    this.isProcessing = true;
    this.processingDocId = this.selectedDocument.documentId;
    this.processingAction = 'verify';
    
    const status = 'Verified';
    const remarks = this.verifyRemarks || 'Document verified by officer';

    this.documentService.verifyDocument(
      this.selectedDocument.documentId, 
      status, 
      remarks
    )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isProcessing = false;
          this.processingDocId = null;
          this.processingAction = null;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = `Document #${this.selectedDocument!.documentId} verified successfully!`;
          this.documents = this.documents.filter(
            doc => doc.documentId !== this.selectedDocument!.documentId
          );
          this.filterDocuments();
          this.closeModals();
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (error) => {
          console.error('Verification error:', error);
          this.errorMessage = `Failed to verify document #${this.selectedDocument!.documentId}. Please try again.`;
          this.closeModals();
        }
      });
  }

  confirmReject(): void {
    if (!this.selectedDocument || !this.rejectReason) return;

    this.isProcessing = true;
    this.processingDocId = this.selectedDocument.documentId;
    this.processingAction = 'reject';

    const remarks = this.rejectReason === 'Other' 
      ? this.rejectRemarks 
      : `${this.rejectReason}${this.rejectRemarks ? ': ' + this.rejectRemarks : ''}`;

    this.documentService.rejectDocument(
      this.selectedDocument.documentId,
      remarks
    )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isProcessing = false;
          this.processingDocId = null;
          this.processingAction = null;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = `Document #${this.selectedDocument!.documentId} rejected successfully.`;
          this.documents = this.documents.filter(
            doc => doc.documentId !== this.selectedDocument!.documentId
          );
          this.filterDocuments();
          this.closeModals();
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (error) => {
          console.error('Rejection error:', error);
          this.errorMessage = `Failed to reject document #${this.selectedDocument!.documentId}. Please try again.`;
          this.closeModals();
        }
      });
  }
}