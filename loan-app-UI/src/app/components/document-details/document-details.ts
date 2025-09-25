import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanDocument } from '../../models/loan-document';
import { DocumentService } from '../../services/document-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './document-details.html',
  styleUrls: ['./document-details.css']
})
export class DocumentDetails implements OnInit {
  @Input() applicationId!: number;

  documents: LoanDocument[] = [];
  isLoading = true;

  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadDocuments();
    } else {
      this.toast.error('No application ID provided');
      this.isLoading = false;
    }
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocumentsByApplication(this.applicationId).subscribe({
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
}