import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  private apiUrl = 'https://localhost:7040/api/User';

  changeUserStatus(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getUsers(){
    return this.http.get<any[]>(this.apiUrl);
  }

  updateUser(id: number, data: any){
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  addUser(user: any) {
  return this.http.post(`${this.apiUrl}`, user);
}


}
