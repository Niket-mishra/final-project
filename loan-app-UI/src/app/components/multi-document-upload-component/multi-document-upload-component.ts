import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document-service';
import { CloudinaryService } from '../../services/cloudinary-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { FormsModule } from '@angular/forms';
import { DocumentStatus } from '../../models/loan-document';

@Component({
  selector: 'app-multi-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-document-upload-component.html',
  styleUrls: ['./multi-document-upload-component.css']
})
export class MultiDocumentUploadComponent {
  selectedFiles: File[] = [];
  isUploading = false;
  applicationId!: number; // Pass this from parent or route
  documentType = 'PAN'; // Default, can be dynamic

  private cloudinary = inject(CloudinaryService);
  private documentService = inject(DocumentService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFiles = Array.from(input.files);
  }

  uploadDocuments(): void {
    if (!this.selectedFiles.length || !this.applicationId) return;

    this.isUploading = true;
    const officerId = this.auth.getUserId();

    this.selectedFiles.forEach(file => {
      this.cloudinary.uploadToCloudinary(file).subscribe({
        next: (url) => {
          const payload = {
            applicationId: this.applicationId,
            fileName: file.name,
            filePath: url,
            documentType: this.documentType,
            verificationStatus: DocumentStatus.Pending,
            uploadedAt: new Date()
          };

          this.documentService.uploadDocument(payload).subscribe({
            next: () => this.toast.success(`${file.name} uploaded`),
            error: () => this.toast.error(`Failed to save ${file.name}`)
          });
        },
        error: () => this.toast.error(`Cloudinary upload failed for ${file.name}`)
      });
    });

    this.isUploading = false;
    this.selectedFiles = [];
  }
}