import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any[]>('https://localhost:7040/api/User');
  }

  getTasinmazlar() {
    return this.http.get<any[]>('https://localhost:7040/api/Tasinmaz');
  }

  getLogs() {
    return this.http.get<any[]>('https://localhost:7040/api/Log');
  }
}
