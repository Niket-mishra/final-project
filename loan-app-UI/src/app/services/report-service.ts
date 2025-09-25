import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Report } from '../models/report'; // ✅ Import your Report model

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = 'https://your-api.com/api/reports'; // ✅ Set your actual endpoint

  constructor(private http: HttpClient) {}

  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }
}