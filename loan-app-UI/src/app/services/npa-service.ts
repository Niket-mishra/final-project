import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NPA } from '../models/npa';

@Injectable({ providedIn: 'root' })
export class NpaService {
  private readonly apiUrl = 'https://your-api.com/api/npa';

  constructor(private http: HttpClient) {}

  getNpaByLoan(loanId: number): Observable<NPA[]> {
    return this.http.get<NPA[]>(`${this.apiUrl}/loan/${loanId}`);
  }

  flagAsNpa(payload: NPA): Observable<NPA> {
    return this.http.post<NPA>(this.apiUrl, payload);
  }
  getAllNPAs(): Observable<NPA[]> {
  return this.http.get<NPA[]>(`${this.apiUrl}`);
}
}