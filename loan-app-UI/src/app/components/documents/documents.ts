import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanDocument } from '../../models/loan-document';
import { DocumentService } from '../../services/document-service';
import { ToastService } from '../../services/toast-service';

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

  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

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

  getDownloadUrl(doc: LoanDocument): string {
    return `/files/${doc.filePath}`;
  }
}