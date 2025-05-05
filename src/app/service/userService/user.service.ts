import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/webservice/api/v1/user'; // Update this URL

  constructor(private http: HttpClient) {}

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }
  ListUsers(data: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/list?skip=${data.skip}&limit=${data.limit}`);
  }
  UpdateUser(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }
  GetUser(userId : string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get?_id=${userId}`);
  }
  DeleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete?_id=${userId}`);
  }
}
