import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudUrl = 'https://api.cloudinary.com/v1_1/difkvkpgb/upload';
  private readonly uploadPreset = 'Documents';
  private readonly folder = 'loan/user-kyc-docs';

  constructor(private http: HttpClient) {}

  uploadToCloudinary(file: File): Observable<number | string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', this.folder);
    formData.append('context', `alt=KYC Document|caption=${file.name}`);

    return new Observable(observer => {
      this.http.post<any>(this.cloudUrl, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next(progress);
        } else if (event.type === HttpEventType.Response) {
          observer.next(event.body.secure_url);
          observer.complete();
        }
      }, error => observer.error(error));
    });
  }
}