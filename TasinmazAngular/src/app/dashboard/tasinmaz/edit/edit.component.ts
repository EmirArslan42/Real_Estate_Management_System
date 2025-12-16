import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/shared/tasinmaz.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  tasinmazForm: FormGroup;
  id!: number;
  successMessage:string='';
  errorMessage:string='';
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  constructor(
    private fb: FormBuilder,
    private tasinmazService: TasinmazService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tasinmazForm = this.fb.group({
      ilId: ['', Validators.required],
      ilceId: ['', Validators.required],
      mahalleId: ['', Validators.required],
      lotNumber: ['', Validators.required], // ada
      parcelNumber: ['', Validators.required], // parsel
      //nitelik: ['', Validators.required],
      address: ['', Validators.required],
      coordinate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadIller();
    this.getTasinmaz();
  }

  loadIller() {
    this.locationService.getIller().subscribe((iller) => {
      this.iller = iller;
    });
  }

  // getTasinmaz() {
  //   this.tasinmazService.getTasinmazById(this.id).subscribe((tasinmaz) => {
  //     this.tasinmazForm.patchValue(tasinmaz);

  //     this.locationService.getIlceler(tasinmaz.ilId).subscribe((ilceler) => {
  //       this.ilceler = ilceler;
  //     });

  //     this.locationService
  //       .getMahalleler(tasinmaz.ilceId)
  //       .subscribe((mahalleler) => {
  //         this.mahalleler = mahalleler;
  //       });
  //   });
  // }

  getTasinmaz() {
    this.tasinmazService.getTasinmazById(this.id).subscribe((tasinmaz) => {
      this.tasinmazForm.patchValue(tasinmaz);

      this.locationService.getIller().subscribe((iller) => {
        this.iller = iller;

        iller.forEach((il) => {
          this.locationService.getIlceler(il.id).subscribe((ilceler) => {
            ilceler.forEach((ilce) => {
              this.locationService
                .getMahalleler(ilce.id)
                .subscribe((mahalleler) => {
                  const bulunanMahalle = mahalleler.find(
                    (m) => m.id === tasinmaz.mahalleId
                  );

                  if (bulunanMahalle) {
                    this.ilceler = ilceler;
                    this.mahalleler = mahalleler;
                    this.tasinmazForm.patchValue({
                      ilId: il.id,
                      ilceId: ilce.id,
                      mahalleId: tasinmaz.mahalleId,
                    });
                  }
                });
            });
          });
        });
      });
    });
  }

  onIlChange() {
    const ilId = this.tasinmazForm.get('ilId')?.value;
    this.ilceler = [];
    this.mahalleler = [];
    this.tasinmazForm.patchValue({ ilceId: '', mahalleId: '' }); // formun değerini anında günceller

    this.locationService.getIlceler(ilId).subscribe((ilceler) => {
      this.ilceler = ilceler;
    });
  }

  onIlceChange() {
    const ilceId = this.tasinmazForm.get('ilceId')?.value;
    this.mahalleler = [];
    this.tasinmazForm.patchValue({ mahalleId: '' });

    this.locationService.getMahalleler(ilceId).subscribe((mahalleler) => {
      this.mahalleler = mahalleler;
    });
  }

  updateForm() {
    this.successMessage='';
    this.errorMessage='';

    this.tasinmazService
      .updateTasinmaz(this.id, this.tasinmazForm.value)
      .subscribe({
        next: () => {
          this.successMessage = 'Taşınmaz başarıyla güncellendi.';
          setTimeout(() => {
            this.router.navigate(['/dashboard/tasinmaz/list']);
          }, 2000);
          
        },
        error: (err) => {
          //console.error(err);
          this.errorMessage = 'Taşınmaz güncelleme işlemi sırasında bir hata oluştu.';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3500);
        },
      });
  }
}
