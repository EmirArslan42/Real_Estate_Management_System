import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  tasinmazForm: FormGroup;
  id!: number;
  successMessage: string = '';
  errorMessage: string = '';
  drawnGeometry: string = '';
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  selectedImage!: File;

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
      address: ['', Validators.required],
      coordinate: ['', Validators.required],
    });
  }

  showErrorAlert(errorMessage:string){
    this.errorMessage = errorMessage;
    setTimeout(() => {
      this.errorMessage = "";
    }, 2000);
  }
  showSuccessAlert(successMessage:string){
  this.successMessage = successMessage;
    setTimeout(() => {
      this.successMessage = "";
    }, 2000);
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

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  onGeometryDrawn(event: any) {
    // GeoJSON string mi object mi ayır
    const geoString = typeof event === 'string' ? event : event.geojson; // Alan hesabından gelirse

    // String'e emin olduktan sonra parse et
    const parsed =
      typeof geoString === 'string' ? JSON.parse(geoString) : geoString;

    // Backend sadece geometry bekliyorsa
    this.drawnGeometry = JSON.stringify(
      parsed.type === 'Feature' ? parsed.geometry : parsed
    );

    // Formu valid tut
    this.tasinmazForm.patchValue({
      coordinate: geoString,
    });
  }

  getTasinmaz() {
    this.tasinmazService.getTasinmazById(this.id).subscribe((tasinmaz) => {
      this.drawnGeometry = tasinmaz.geometry;
      this.tasinmazForm.patchValue({
        mahalleId: tasinmaz.mahalleId,
        lotNumber: tasinmaz.lotNumber,
        parcelNumber: tasinmaz.parcelNumber,
        address: tasinmaz.address,
        coordinate: tasinmaz.geometry,
      });

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
    const formData = new FormData();

    formData.append('MahalleId', this.tasinmazForm.value.mahalleId);
    formData.append('LotNumber', this.tasinmazForm.value.lotNumber);
    formData.append('ParcelNumber', this.tasinmazForm.value.parcelNumber);
    formData.append('Address', this.tasinmazForm.value.address);
    formData.append('Geometry', this.drawnGeometry);

    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }

    this.tasinmazService.updateTasinmaz(this.id, formData).subscribe({
      next: () => {
        this.showSuccessAlert("Taşınmaz başarıyla güncellendi.");
        setTimeout(() => {
          this.router.navigate(['/dashboard/tasinmaz/list'], {
            state: { reload: true },
          });
        }, 2000);
      },
      error: () => {
        this.showErrorAlert("Güncelleme sırasında hata oluştu.");
      },
    });
  }
}