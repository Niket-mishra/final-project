import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanScheme } from '../models/loan-scheme';

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private readonly apiUrl = 'https://your-api.com/api/schemes';

  constructor(private http: HttpClient) {}

  getAllSchemes(): Observable<LoanScheme[]> {
    return this.http.get<LoanScheme[]>(this.apiUrl);
  }

  getSchemeById(id: number): Observable<LoanScheme> {
    return this.http.get<LoanScheme>(`${this.apiUrl}/${id}`);
  }

  createScheme(payload: LoanScheme): Observable<LoanScheme> {
    return this.http.post<LoanScheme>(this.apiUrl, payload);
  }
}