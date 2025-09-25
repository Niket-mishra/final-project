import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DocumentService } from '../../services/document-service';
import { CloudinaryService } from '../../services/cloudinary-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { DocumentStatus } from '../../models/loan-document';

@Component({
  selector: 'app-multi-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-document-upload-component.html',
  styleUrls: ['./multi-document-upload-component.css']
})
export class MultiDocumentUploadComponent {
  readonly documentTypes = ['PAN', 'Aadhaar', 'Passport', 'DrivingLicense'];

  selectedType: string | null = null;
  documentNumber: string = '';
  selectedFile: File | null = null;
  isUploading = false;

  stagedDocuments: { type: string; number: string; file: File }[] = [];

  previewModalVisible = false;
  previewModalUrl: string | null = null;

  applicationId!: number;

  private cloudinary = inject(CloudinaryService);
  private documentService = inject(DocumentService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  stageDocument(): void {
    if (!this.selectedType || !this.documentNumber || !this.selectedFile) return;

    this.stagedDocuments.push({
      type: this.selectedType,
      number: this.documentNumber,
      file: this.selectedFile
    });

    this.selectedType = null;
    this.documentNumber = '';
    this.selectedFile = null;
  }

  isTypeAdded(type: string): boolean {
    return this.stagedDocuments.some(doc => doc.type === type);
  }

  allDocumentsAdded(): boolean {
    return this.stagedDocuments.length === this.documentTypes.length;
  }

  removeDocument(type: string): void {
    this.stagedDocuments = this.stagedDocuments.filter(doc => doc.type !== type);
  }

  openPreview(doc: { file: File }): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewModalUrl = reader.result as string;
      this.previewModalVisible = true;
    };
    reader.readAsDataURL(doc.file);
  }

  closePreview(): void {
    this.previewModalVisible = false;
    this.previewModalUrl = null;
  }

  uploadAll(): void {
    if (!this.applicationId || !this.allDocumentsAdded()) {
      this.toast.error('Please add all required documents before uploading');
      return;
    }

    this.isUploading = true;
    const officerId = this.auth.getUserId();

    this.stagedDocuments.forEach(doc => {
      this.cloudinary.uploadToCloudinary(doc.file).subscribe({
        next: (url) => {
          const payload = {
            applicationId: this.applicationId,
            fileName: doc.file.name,
            filePath: url,
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

    this.isUploading = false;
    this.stagedDocuments = [];
  }
}