import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:3000/webservice/api/v1/outdoor-activity'; // Update this URL

  constructor(private http: HttpClient) {}

  GetActivityCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-all-activity-categories`);
  }
}
