import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddComponent implements OnInit {
  tasinmazForm: FormGroup;
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
    private snackBar: MatSnackBar
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

  ngOnInit() {
    this.loadIller();
  }

  loadIller() {
    this.locationService.getIller().subscribe((iller) => {
      this.iller = iller;
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

  onGeometryDrawn(event: any) {
    const geojson = typeof event === 'string' ? event : event.geojson;

    this.drawnGeometry = geojson;
    this.tasinmazForm.patchValue({ coordinate: geojson });
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  onIlceChange() {
    const ilceId = this.tasinmazForm.get('ilceId')?.value;
    this.mahalleler = [];
    this.tasinmazForm.patchValue({ mahalleId: '' });

    this.locationService.getMahalleler(ilceId).subscribe((mahalleler) => {
      this.mahalleler = mahalleler;
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
  saveForm() {
    if (!this.drawnGeometry) {
      this.showErrorAlert("Lütfen harita üzerinde taşınmaz alanını çizin.");
      return;
    }

    const formData = new FormData();

    // Değerleri append ederken null/undefined kontrolü yapıyoruz
    formData.append(
      'MahalleId',
      this.tasinmazForm.get('mahalleId')?.value?.toString() || ''
    );
    formData.append(
      'LotNumber',
      this.tasinmazForm.get('lotNumber')?.value || ''
    );
    formData.append(
      'ParcelNumber',
      this.tasinmazForm.get('parcelNumber')?.value || ''
    );
    formData.append('Address', this.tasinmazForm.get('address')?.value || '');

    const geoString =
      typeof this.drawnGeometry === 'string'
        ? this.drawnGeometry
        : JSON.stringify(this.drawnGeometry);

    formData.append('Geometry', geoString);

    if (this.selectedImage) {
      formData.append('Image', this.selectedImage, this.selectedImage.name);
    }

    this.tasinmazService.addTasinmaz(formData).subscribe({
      next: () => {
        this.showSuccessAlert("Taşınmaz başarıyla eklendi.")
        setTimeout(
          () =>
            this.router.navigate(['/dashboard/tasinmaz/list'], {
              state: { reload: true },
            }),
          2000
        );
      },
      error: (err) => {
        console.error("Backend'den gelen hata detayı:", err);
        this.errorMessage =
          'Form kaydedilirken bir hata oluştu. Detay: ' +
          (err.error || 'Bilinmiyor');
      },
    });
  }
}
