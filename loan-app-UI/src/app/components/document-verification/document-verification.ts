import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document-service';
import { LoanDocument } from '../../models/loan-document';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-verification.html',
  styleUrl: './document-verification.css'
})
export class DocumentVerification implements OnInit {
  isLoading = true;
  errorMessage = '';
  documents: LoanDocument[] = [];

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getPendingDocuments().subscribe({
      next: (data: LoanDocument[]) => {
        this.documents = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load documents.';
        this.isLoading = false;
      }
    });
  }

 verify(docId: number): void {
  const status = 'Verified';
  const remarks = 'Verified by officer';

  this.documentService.verifyDocument(docId, status, remarks).subscribe({
    next: () => {
      this.documents = this.documents.filter(doc => doc.documentId !== docId);
    },
    error: () => {
      this.errorMessage = `Failed to verify document ${docId}.`;
    }
  });
}

  reject(docId: number): void {
    this.documentService.rejectDocument(docId).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.documentId !== docId);
      },
      error: () => {
        this.errorMessage = `Failed to reject document ${docId}.`;
      }
    });
  }
}