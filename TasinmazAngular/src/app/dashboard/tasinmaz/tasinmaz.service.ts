import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http"

@Injectable({
  providedIn: 'root'
})
export class TasinmazService {
  private apiUrl="https://localhost:7040/api/Tasinmaz";

  constructor(private http:HttpClient) { }

  getAllTasinmaz(){
    return this.http.get<any[]>(this.apiUrl);
  }

  getTasinmazById(id:number){
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addTasinmaz(tasinmaz:any){
    return this.http.post(this.apiUrl,tasinmaz);
  }

  updateTasinmaz(id:number,tasinmaz:any){
    return this.http.put(`${this.apiUrl}/${id}`,tasinmaz)
  }

  deleteTasinmaz(id:number){
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
