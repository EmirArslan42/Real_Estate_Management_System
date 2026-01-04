import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlanAnalizService {
  private apiUrl="https://localhost:7040/api/alan-analizi";

  constructor(private http:HttpClient) { }

  save(dto:any){
    return this.http.post(`${this.apiUrl}/save`,dto);
  }

  getAutoSelect(){
    return this.http.get(`${this.apiUrl}/auto-select`);
  }

  getUnionResults(){
    return this.http.get(`${this.apiUrl}/results`);
  }

  deleteAllAnaliz(){
    return this.http.delete(`${this.apiUrl}`);
  }
}
