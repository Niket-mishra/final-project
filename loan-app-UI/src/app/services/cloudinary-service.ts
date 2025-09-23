import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudUrl = 'https://api.cloudinary.com/v1_1/<your-cloud-name>/upload';
  private readonly uploadPreset = '<your-upload-preset>';

  constructor(private http: HttpClient) {}

  uploadToCloudinary(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(this.cloudUrl, formData).pipe(
      map(res => res.secure_url)
    );
  }
}