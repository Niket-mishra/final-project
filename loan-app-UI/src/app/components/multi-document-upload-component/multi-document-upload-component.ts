// ============================================
// ENHANCED MULTI-DOCUMENT UPLOAD COMPONENT
// ============================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DocumentService } from '../../services/document-service';
import { CloudinaryService } from '../../services/cloudinary-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { DocumentStatus, LoanDocument } from '../../models/loan-document';
import { VerificationStatus } from '../../models/customer';

@Component({
  selector: 'app-multi-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-container">
      
      <!-- Header -->
      <div class="upload-header">
        <div class="header-content">
          <div class="header-icon">📁</div>
          <div class="header-text">
            <h2 class="header-title">Document Upload Center</h2>
            <p class="header-subtitle">Upload all required documents for loan verification</p>
          </div>
        </div>
        <div class="progress-indicator">
          <div class="progress-circle">
            <svg class="progress-ring" width="60" height="60">
              <circle class="progress-ring-bg" cx="30" cy="30" r="26" />
              <circle 
                class="progress-ring-fill" 
                cx="30" cy="30" 
                r="26"
                [style.stroke-dashoffset]="getProgressOffset()"
              />
            </svg>
            <div class="progress-text">
              {{ stagedDocuments().length }}/{{ documentTypes.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="upload-content">
        
        <!-- Document Type Cards -->
        @if (!allDocumentsAdded()) {
          <div class="document-types-section">
            <h3 class="section-title">Select Document Type</h3>
            <div class="document-type-grid">
              @for (type of documentTypes; track type) {
                <button
                  class="document-type-card"
                  [class.selected]="selectedType() === type"
                  [class.completed]="isTypeAdded(type)"
                  (click)="selectType(type)"
                  [disabled]="isTypeAdded(type)"
                >
                  <div class="card-icon">{{ getDocumentIcon(type) }}</div>
                  <div class="card-label">{{ formatDocumentType(type) }}</div>
                  @if (isTypeAdded(type)) {
                    <div class="card-check">✓</div>
                  }
                </button>
              }
            </div>
          </div>
        }

        <!-- Upload Form -->
        @if (selectedType() && !isTypeAdded(selectedType()!)) {
          <div class="upload-form-section">
            <div class="form-card">
              <div class="form-header">
                <h3 class="form-title">{{ formatDocumentType(selectedType()!) }} Details</h3>
                <button class="close-btn" (click)="resetForm()">✕</button>
              </div>
              
              <div class="form-body">
                <!-- Document Number Input -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-icon">🔢</span>
                    Document Number
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    [placeholder]="getPlaceholder(selectedType()!)"
                    [(ngModel)]="documentNumber"
                    (ngModelChange)="documentNumber.set($event)"
                  />
                </div>

                <!-- File Upload -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-icon">📎</span>
                    Upload Document
                  </label>
                  <div class="file-upload-area" [class.has-file]="selectedFile()">
                    <input
                      type="file"
                      id="fileInput"
                      class="file-input"
                      accept="image/*,.pdf"
                      (change)="onFileSelect($event)"
                    />
                    <label for="fileInput" class="file-upload-label">
                      @if (selectedFile()) {
                        <div class="file-info">
                          <span class="file-icon">📄</span>
                          <div class="file-details">
                            <span class="file-name">{{ selectedFile()!.name }}</span>
                            <span class="file-size">{{ formatFileSize(selectedFile()!.size) }}</span>
                          </div>
                          <button class="remove-file-btn" (click)="clearFile($event)">✕</button>
                        </div>
                      } @else {
                        <div class="upload-prompt">
                          <span class="upload-icon">☁️</span>
                          <span class="upload-text">Click to browse or drag and drop</span>
                          <span class="upload-hint">PDF, JPG, PNG (Max 5MB)</span>
                        </div>
                      }
                    </label>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  class="btn btn-primary btn-lg"
                  (click)="stageDocument()"
                  [disabled]="!canStageDocument()"
                >
                  <span class="btn-icon">➕</span>
                  Add Document
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Staged Documents -->
        @if (stagedDocuments().length > 0) {
          <div class="staged-section">
            <h3 class="section-title">
              Staged Documents
              <span class="section-badge">{{ stagedDocuments().length }}</span>
            </h3>
            
            <div class="staged-documents-list">
              @for (doc of stagedDocuments(); track doc.type) {
                <div class="staged-document-card">
                  <div class="doc-icon">{{ getDocumentIcon(doc.type) }}</div>
                  <div class="doc-info">
                    <h4 class="doc-type">{{ formatDocumentType(doc.type) }}</h4>
                    <p class="doc-number">{{ doc.number }}</p>
                    <p class="doc-file">{{ doc.file.name }}</p>
                  </div>
                  <div class="doc-actions">
                    <button class="action-btn preview-btn" (click)="openPreview(doc)" title="Preview">
                      👁️
                    </button>
                    <button class="action-btn delete-btn" (click)="removeDocument(doc.type)" title="Remove">
                      🗑️
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Upload All Button -->
            @if (allDocumentsAdded()) {
              <div class="upload-all-section">
                <div class="ready-indicator">
                  <span class="ready-icon">✓</span>
                  <span class="ready-text">All documents ready for upload</span>
                </div>
                
                <button
                  class="btn btn-success btn-xl"
                  (click)="uploadAll()"
                  [disabled]="isUploading()"
                >
                  @if (isUploading()) {
                    <span class="spinner"></span>
                    Uploading... {{ uploadProgress() }}%
                  } @else {
                    <span class="btn-icon">🚀</span>
                    Upload All Documents
                  }
                </button>

                @if (isUploading()) {
                  <div class="upload-progress-bar">
                    <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (stagedDocuments().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3 class="empty-title">No Documents Added Yet</h3>
            <p class="empty-text">Select a document type above to get started</p>
          </div>
        }
      </div>

      <!-- Preview Modal -->
      @if (previewModalVisible() && previewModalUrl()) {
        <div class="modal-overlay" (click)="closePreview()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Document Preview</h3>
              <button class="modal-close-btn" (click)="closePreview()">✕</button>
            </div>
            <div class="modal-body">
              <img [src]="previewModalUrl()" alt="Document preview" class="preview-image" />
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      color: white;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon {
      font-size: 3rem;
    }

    .header-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .header-subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .progress-indicator {
      position: relative;
    }

    .progress-circle {
      position: relative;
      width: 60px;
      height: 60px;
    }

    .progress-ring {
      transform: rotate(-90deg);
    }

    .progress-ring-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 4;
    }

    .progress-ring-fill {
      fill: none;
      stroke: white;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 163.36;
      transition: stroke-dashoffset 0.3s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 700;
      font-size: 0.9rem;
    }

    /* Content */
    .upload-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Document Type Cards */
    .document-type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .document-type-card {
      position: relative;
      padding: 2rem 1.5rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .document-type-card:hover:not(:disabled) {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
    }

    .document-type-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }

    .document-type-card.completed {
      border-color: #10b981;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      cursor: not-allowed;
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .card-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
    }

    .card-check {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 24px;
      height: 24px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }

    /* Upload Form */
    .upload-form-section {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .form-header {
      padding: 1.5rem;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.2rem;
      color: #6b7280;
    }

    .close-btn:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fecaca;
    }

    .form-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .label-icon {
      font-size: 1.1rem;
    }

    .form-control {
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    /* File Upload */
    .file-upload-area {
      position: relative;
    }

    .file-input {
      display: none;
    }

    .file-upload-label {
      display: block;
      padding: 2rem;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f9fafb;
    }

    .file-upload-label:hover {
      border-color: #667eea;
      background: #eff6ff;
    }

    .file-upload-area.has-file .file-upload-label {
      border-style: solid;
      border-color: #10b981;
      background: #ecfdf5;
    }

    .upload-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .upload-icon {
      font-size: 2.5rem;
    }

    .upload-text {
      font-weight: 600;
      color: #374151;
    }

    .upload-hint {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .file-icon {
      font-size: 2rem;
    }

    .file-details {
      flex: 1;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-name {
      font-weight: 600;
      color: #374151;
    }

    .file-size {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .remove-file-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #6b7280;
    }

    .remove-file-btn:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fecaca;
    }

    /* Buttons */
    .btn {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-lg {
      width: 100%;
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }

    .btn-xl {
      width: 100%;
      padding: 1.25rem 2rem;
      font-size: 1.1rem;
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    /* Staged Documents */
    .staged-documents-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .staged-document-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    .staged-document-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .doc-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .doc-info {
      flex: 1;
    }

    .doc-type {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .doc-number {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0 0 0.25rem 0;
    }

    .doc-file {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .doc-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.2rem;
    }

    .preview-btn:hover {
      background: #eff6ff;
      border-color: #3b82f6;
    }

    .delete-btn:hover {
      background: #fee2e2;
      border-color: #ef4444;
    }

    /* Upload All Section */
    .upload-all-section {
      margin-top: 1.5rem;
      padding: 2rem;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ready-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #059669;
      font-weight: 600;
    }

    .ready-icon {
      font-size: 1.5rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .upload-progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: white;
      transition: width 0.3s ease;
    }

    /* Empty State */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .empty-text {
      margin: 0;
      font-size: 0.95rem;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }

    .modal-container {
      background: white;
      border-radius: 20px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: modalSlide 0.3s ease-out;
    }

    @keyframes modalSlide {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .modal-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f3f4f6;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.3rem;
      color: #6b7280;
    }

    .modal-close-btn:hover {
      background: #fee2e2;
      color: #ef4444;
    }

    .modal-body {
      padding: 2rem;
      overflow: auto;
      flex: 1;
    }

    .preview-image {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .upload-container {
        padding: 1rem;
      }

      .upload-header {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .header-content {
        flex-direction: column;
      }

      .document-type-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .staged-document-card {
        flex-wrap: wrap;
      }
    }
  `]
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

  selectType(type: string): void {
    if (!this.isTypeAdded(type)) {
      this.selectedType.set(type);
    }
  }

  getDocumentIcon(type: string): string {
    const icons: Record<string, string> = {
      'PAN': '🆔',
      'Aadhaar': '🪪',
      'Passport': '📘',
      'DrivingLicense': '🚗'
    };
    return icons[type] || '📄';
  }

  formatDocumentType(type: string): string {
    const formats: Record<string, string> = {
      'PAN': 'PAN Card',
      'Aadhaar': 'Aadhaar Card',
      'Passport': 'Passport',
      'DrivingLicense': 'Driving License'
    };
    return formats[type] || type;
  }

  getPlaceholder(type: string): string {
    const placeholders: Record<string, string> = {
      'PAN': 'e.g., ABCDE1234F',
      'Aadhaar': 'e.g., 1234 5678 9012',
      'Passport': 'e.g., A1234567',
      'DrivingLicense': 'e.g., DL-0123456789'
    };
    return placeholders[type] || 'Enter document number';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
              this.toast.error('❌ File size exceeds 5MB limit');
        return;
      }
      this.selectedFile.set(file);
    }
  }

  clearFile(event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedFile.set(null);
  }

  canStageDocument(): boolean {
    return !!this.selectedType() && !!this.documentNumber() && !!this.selectedFile();
  }

  isTypeAdded(type: string): boolean {
    return this.stagedDocuments().some(doc => doc.type === type);
  }

  stageDocument(): void {
    if (!this.canStageDocument()) return;

    this.stagedDocuments.update(prev => [
      ...prev,
      {
        type: this.selectedType()!,
        number: this.documentNumber(),
        file: this.selectedFile()!
      }
    ]);

    // Reset form
    this.selectedType.set(null);
    this.documentNumber.set('');
    this.selectedFile.set(null);

    this.toast.success('✅ Document staged successfully');
  }

  resetForm(): void {
    this.selectedType.set(null);
    this.documentNumber.set('');
    this.selectedFile.set(null);
  }

  removeDocument(type: string): void {
    this.stagedDocuments.update(prev => prev.filter(doc => doc.type !== type));
    this.toast.info('🗑️ Document removed');
  }

  allDocumentsAdded(): boolean {
    return this.stagedDocuments().length === this.documentTypes.length;
  }

  openPreview(doc: { type: string; number: string; file: File }): void {
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

  async uploadAll(): Promise<void> {
    if (this.stagedDocuments().length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    const totalDocs = this.stagedDocuments().length;

    for (let i = 0; i < totalDocs; i++) {
      const doc = this.stagedDocuments()[i];
      try {
        // Upload file to Cloudinary or your storage service
        const { firstValueFrom } = await import('rxjs');
        const uploadedUrl = await firstValueFrom(this.cloudinary.uploadToCloudinary(doc.file));

        // Save document record in backend
        await this.documentService.uploadDocument({
          applicationId: this.applicationId,
          documentType: doc.type,
          fileName: doc.number,
          filePath: uploadedUrl as string,
          verificationStatus: DocumentStatus.Pending,
          uploadedAt: new Date()
        });

        // Update progress
        this.uploadProgress.set(Math.round(((i + 1) / totalDocs) * 100));

      } catch (err) {
        console.error(err);
        this.toast.error(`❌ Failed to upload ${doc.type}`);
      }
    }

    this.toast.success('✅ All documents uploaded successfully');
    this.stagedDocuments.set([]);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
  }

  getProgressOffset(): number {
    const stagedCount = this.stagedDocuments().length;
    const totalCount = this.documentTypes.length;
    const circumference = 2 * Math.PI * 26; // radius = 26
    const progress = totalCount ? stagedCount / totalCount : 0;
    return circumference * (1 - progress);
  }
}
