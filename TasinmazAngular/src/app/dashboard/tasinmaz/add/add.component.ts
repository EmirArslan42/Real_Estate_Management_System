import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/shared/tasinmaz.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddComponent implements OnInit {
  tasinmazForm: FormGroup;

  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  constructor(
    private fb: FormBuilder,
    private tasinmazService: TasinmazService,
    private locationService: LocationService,
    private router: Router
  ) {
    this.tasinmazForm = this.fb.group({
      ilId: ['', Validators.required],
      ilceId: ['', Validators.required],
      mahalleId: ['', Validators.required],
      lotNumber: ['', Validators.required], // ada
      parcelNumber: ['', Validators.required], // parsel
      //nitelik: ['', Validators.required],
      address: ['', Validators.required],
      coordinate: [''],
    });
  }

  ngOnInit() {
    this.loadIller();
  }

  loadIller() {
    this.locationService.getIller().subscribe(iller=>{
      this.iller=iller;
    })
  }

  onIlChange(){
    const ilId=this.tasinmazForm.get('ilId')?.value;
    this.ilceler=[];
    this.mahalleler=[];
    this.tasinmazForm.patchValue({ilceId:'',mahalleId:''});  // formun değerini anında günceller

    this.locationService.getIlceler(ilId).subscribe(ilceler=>{
      this.ilceler=ilceler;
    })
  }

  onIlceChange(){
    const ilceId=this.tasinmazForm.get('ilceId')?.value;
    this.mahalleler=[];
    this.tasinmazForm.patchValue({mahalleId:''}) 

    this.locationService.getMahalleler(ilceId).subscribe(mahalleler=>{
      this.mahalleler=mahalleler;
    })
  }

  saveForm(){
    this.tasinmazService.addTasinmaz(this.tasinmazForm.value).subscribe({
      next:()=>{
        alert("Taşınmaz ekleme işlemi başarılı");
        this.router.navigate(['/dashboard/tasinmaz/list']);
      },
      error:(err)=>{
        console.log(err);
        alert("Form Kaydedilirken hata oluştu")
      }
    })
  }


}
