import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlanAnalizService {
  private apiUrl="https://localhost:7040/api/AlanAnalizSonucu";
  constructor(private http:HttpClient) { }

  getResults(){
    return this.http.get(`${this.apiUrl}/results`);
  }

  saveUnionResult(dto:any){
    return this.http.post(`${this.apiUrl}/union`,dto);
  }

  autoSelect(){
    return this.http.get(`${this.apiUrl}/auto-select`);
  }
}
