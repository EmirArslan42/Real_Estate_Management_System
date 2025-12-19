import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddComponent implements OnInit {

  tasinmazForm: FormGroup;
  successMessage:string='';
  errorMessage:string='';
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
  this.successMessage='';
  this.errorMessage='';

    const payload = {
    mahalleId: this.tasinmazForm.value.mahalleId,
    lotNumber: this.tasinmazForm.value.lotNumber,
    parcelNumber: this.tasinmazForm.value.parcelNumber,
    address: this.tasinmazForm.value.address,
    coordinate: this.tasinmazForm.value.coordinate
  };

    this.tasinmazService.addTasinmaz(payload).subscribe({
      next:()=>{
        this.successMessage = 'Taşınmaz başarıyla eklendi.';
        setTimeout(() => {
        this.router.navigate(['/dashboard/tasinmaz/list']);
      }, 2000);
      },
      error:(err)=>{
        //console.log(err);
         this.errorMessage = 'Form kaydedilirken bir hata oluştu.';
         setTimeout(() => {
          this.errorMessage = '';
        }, 3500);
      }
    })
  }


}
