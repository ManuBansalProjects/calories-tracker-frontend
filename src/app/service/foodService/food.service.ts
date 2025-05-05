import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  private apiUrl = 'http://localhost:3000/webservice/api/v1/food'; // Update this URL

  constructor(private http: HttpClient) {}

  GetFoodGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-all-food-groups`);
  }
}
