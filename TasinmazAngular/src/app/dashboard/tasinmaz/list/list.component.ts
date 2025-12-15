import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasinmazService } from 'src/app/shared/tasinmaz.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit{  

  tasinmazlar:any[]=[];
  isLoading:boolean=true;
  constructor(
    private tasinmazService:TasinmazService,
    private router:Router
  ){}

  ngOnInit(){
    this.loadTasinmaz();
  }

  loadTasinmaz(){
    this.tasinmazService.getAllTasinmaz().subscribe({
      next:(tasinmaz)=>{
        this.tasinmazlar=tasinmaz;
        this.isLoading=false;
      },
      error:(err)=>{
        console.error("Tasinmazlar yüklenemedi !",err);
        this.isLoading=false;
      }
    })
  }

  editTasinmaz(id:number){
    this.router.navigate(['/dashboard/tasinmaz/edit',id]);
  }

  deleteTasinmaz(id:number){
    this.tasinmazService.deleteTasinmaz(id).subscribe({
      next:()=>{
        alert('Taşınmaz silindi');
        this.loadTasinmaz();
      },
      error:(e)=>{
        console.error("Silinirken hata oluştu !",e)
      }
    })
  }

}
