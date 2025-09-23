import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl ="";
  

  constructor(private http:HttpClient){

  }
  getAllReports(): Observable<Report[]> {
  return this.http.get<Report[]>(`${this.apiUrl}`);
}
  
}
