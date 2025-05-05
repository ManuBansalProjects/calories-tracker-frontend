import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalorieService {
  private apiUrl = 'http://localhost:3000/webservice/api/v1/calorie'; // Update this URL

  constructor(private http: HttpClient) {}

  AddCalorie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-user-calories`, data);
  }
  ListCalories(data: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/list-user-calories?skip=${data.skip}&limit=${data.limit}&user_id=${data.userId}`);
  }
  UpdateCalories(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-user-calories`, data);
  }
  GetCalories(_id : string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-user-calories?_id=${_id}`);
  }
  DeleteCalories(_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user-calories?_id=${_id}`);
  }
}
