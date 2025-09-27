import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanDocument, DocumentStatus } from '../../models/loan-document';
import { DocumentService } from '../../services/document-service';
import { ToastService } from '../../services/toast-service';
import { CloudinaryService } from '../../services/cloudinary-service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class Documents implements OnInit {
  documents: LoanDocument[] = [];
  isLoading = true;
  previewUrl: string | null = null;
  previewVisible = false;

  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private cloudinary = inject(CloudinaryService);
  private datePipe = inject(DatePipe);

  ngOnInit(): void {
    this.loadAllDocuments();
  }

  loadAllDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load documents');
        this.isLoading = false;
      }
    });
  }

  getCloudinaryUrl(doc: LoanDocument): string {
    return typeof doc.filePath === 'string' ? doc.filePath : '';
  }

  getFormattedDate(date: Date): string {
    return this.datePipe.transform(date, 'MMM d, y, h:mm a') || '';
  }

  getStatusBadge(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.Pending:
        return 'badge-pending';
      case DocumentStatus.Approved:
        return 'badge-approved';
      case DocumentStatus.Rejected:
        return 'badge-rejected';
      default:
        return 'badge-unknown';
    }
  }

  openPreview(doc: LoanDocument): void {
    this.previewUrl = this.getCloudinaryUrl(doc);
    this.previewVisible = true;
  }

  closePreview(): void {
    this.previewUrl = null;
    this.previewVisible = false;
  }

  downloadDocument(doc: LoanDocument): void {
    const url = this.getCloudinaryUrl(doc);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    link.target = '_blank';
    link.click();
  }

  trackById(index: number, doc: LoanDocument): string {
    return doc.documentType + doc.fileName;
  }
}