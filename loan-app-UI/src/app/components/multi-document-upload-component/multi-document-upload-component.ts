import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DocumentService } from '../../services/document-service';
import { CloudinaryService } from '../../services/cloudinary-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { DocumentStatus, LoanDocument } from '../../models/loan-document';

@Component({
  selector: 'app-multi-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-document-upload-component.html',
  styleUrls: ['./multi-document-upload-component.css']
})
export class MultiDocumentUploadComponent {
  readonly documentTypes = ['PAN', 'Aadhaar', 'Passport', 'DrivingLicense'];

  selectedType = signal<string | null>(null);
  documentNumber = signal('');
  selectedFile = signal<File | null>(null);

  stagedDocuments = signal<{ type: string; number: string; file: File }[]>([]);
  previewModalVisible = signal(false);
  previewModalUrl = signal<string | null>(null);

  isUploading = signal(false);
  uploadProgress = signal<number>(0);

  applicationId!: number;

  private cloudinary = inject(CloudinaryService);
  private documentService = inject(DocumentService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  stageDocument(): void {
    const type = this.selectedType();
    const number = this.documentNumber();
    const file = this.selectedFile();

    if (!type || !number || !file) return;

    this.stagedDocuments.update(docs => [...docs, { type, number, file }]);
    this.resetForm();
  }

  resetForm(): void {
    this.selectedType.set(null);
    this.documentNumber.set('');
    this.selectedFile.set(null);
  }

  isTypeAdded(type: string): boolean {
    return this.stagedDocuments().some(doc => doc.type === type);
  }

  allDocumentsAdded(): boolean {
    return this.stagedDocuments().length === this.documentTypes.length;
  }

  removeDocument(type: string): void {
    this.stagedDocuments.update(docs => docs.filter(doc => doc.type !== type));
  }

  openPreview(doc: { file: File }): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewModalUrl.set(reader.result as string);
      this.previewModalVisible.set(true);
    };
    reader.readAsDataURL(doc.file);
  }

  closePreview(): void {
    this.previewModalVisible.set(false);
    this.previewModalUrl.set(null);
  }

  uploadAll(): void {
    if (!this.applicationId || !this.allDocumentsAdded()) {
      this.toast.error('Please add all required documents before uploading');
      return;
    }

    this.isUploading.set(true);
    const officerId = this.auth.getUserId();

    this.stagedDocuments().forEach(doc => {
      this.cloudinary.uploadToCloudinary(doc.file).subscribe({
        next: (urlOrProgress) => {
          if (typeof urlOrProgress === 'number') {
            this.uploadProgress.set(urlOrProgress);
            return;
          }

          const payload: Partial<LoanDocument> = {
            applicationId: this.applicationId,
            fileName: doc.file.name,
            filePath: urlOrProgress,
            documentType: doc.type,
            verificationStatus: DocumentStatus.Pending,
            uploadedAt: new Date()
          };

          this.documentService.uploadDocument(payload).subscribe({
            next: () => this.toast.success(`${doc.type} uploaded`),
            error: () => this.toast.error(`Failed to save ${doc.type}`)
          });
        },
        error: () => this.toast.error(`Cloudinary upload failed for ${doc.type}`)
      });
    });

    this.isUploading.set(false);
    this.stagedDocuments.set([]);
    this.uploadProgress.set(0);
  }
}