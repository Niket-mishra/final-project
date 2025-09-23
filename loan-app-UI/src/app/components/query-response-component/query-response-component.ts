import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { CustomerQuery, QueryStatus } from '../../models/customer-query';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-query-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './query-response-component.html',
  styleUrls: ['./query-response-component.css']
})
export class QueryResponseComponent implements OnInit {
  officerId!: number;
  queries: CustomerQuery[] = [];
  selectedQuery!: CustomerQuery;
  responseForm!: FormGroup;
  isLoading = true;

  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.officerId = this.auth.getUserId() ?? 0;
    this.loadQueries();
    this.initForm();
  }

  initForm(): void {
    this.responseForm = this.fb.group({
      officerResponse: ['', Validators.required]
    });
  }

  loadQueries(): void {
    this.officerService.getHandledQueries(this.officerId).subscribe({
      next: (res) => {
        this.queries = res.filter(q => q.queryStatus !== QueryStatus.Resolved && q.queryStatus !== QueryStatus.Closed);
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load queries');
        this.isLoading = false;
      }
    });
  }

  selectQuery(query: CustomerQuery): void {
    this.selectedQuery = query;
    this.responseForm.reset({ officerResponse: query.officerResponse || '' });
  }

  submitResponse(): void {
    if (!this.selectedQuery || this.responseForm.invalid) return;

    const responseText = this.responseForm.value.officerResponse;

    this.officerService.respondToQuery(this.officerId, this.selectedQuery.queryId, responseText).subscribe({
      next: () => {
        this.toast.success('Response submitted');
        this.selectedQuery.officerResponse = responseText;
        this.selectedQuery.queryStatus = QueryStatus.Resolved;
        this.responseForm.reset();
      },
      error: () => this.toast.error('Failed to submit response')
    });
  }
}