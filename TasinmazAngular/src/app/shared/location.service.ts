import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnInit{

  constructor(private http:HttpClient) { }

  ngOnInit(){

  }

  getIller(){
    return this.http.get<any[]>('https://localhost:7040/api/Location/iller');
  }

  getIlceler(ilId:number){
    return this.http.get<any[]>(`https://localhost:7040/api/Location/ilceler/${ilId}`);
  }

  getMahalleler(ilceId:number){
    return this.http.get<any[]>(`https://localhost:7040/api/Location/mahalleler/${ilceId}`);
  }
}
