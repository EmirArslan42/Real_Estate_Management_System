import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  tasinmazlar: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  isAdmin:boolean=false;
  vectorSource=new VectorSource();
  selectedTasinmaz: any = null;

  // ilMap = new Map<number, string>();
  // ilceMap = new Map<number, { ad: string; ilId: number }>();
  // mahalleMap = new Map<number, { ad: string; ilceId: number }>();

  constructor(
    private tasinmazService: TasinmazService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    //this.loadLocations();
    this.isAdmin=this.authService.isAdmin();
    this.loadTasinmaz();
  }

  showPopup(tasinmaz: any) {
  this.selectedTasinmaz = tasinmaz;
  }
  closePopup() {
    this.selectedTasinmaz = null;
  }

  formatCoordinates(data: any): string {
  if (!data) return 'Koordinat yok';
  
  try {
    // Eğer veri zaten bir objeyse parse etme, değilse et
    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    let coords: any;

    if (obj.type === 'Feature' && obj.geometry) {
      coords = obj.geometry.coordinates[0];
    } else if (obj.coordinates) {
      coords = obj.coordinates[0];
    }

    if (!coords || !Array.isArray(coords)) return 'Format uyumsuz';

    return coords
      .slice(0, 3) // Tablo çok uzamasın diye ilk 3 noktayı göster
      .map((c: any) => `[${c[0].toFixed(2)}, ${c[1].toFixed(2)}]`)
      .join(' |') + (coords.length > 3 ? '...' : '');

  } catch (e) {
    return 'Veri okunamadı';
  }
}

  loadTasinmaz() {
    this.tasinmazService.getAllTasinmaz().subscribe({
      next: (tasinmaz) => {
        console.log("Gelen ilk kayıt:", tasinmaz[0]);
        this.tasinmazlar = tasinmaz;
        this.isLoading = false;
        console.log("Tasinmazlar yüklendi !",this.tasinmazlar);

        this.vectorSource.clear();
        this.tasinmazlar.forEach(tasinmaz=>{
          if (tasinmaz.coordinate) {
        const geojsonFormat = new GeoJSON();
        // readFeatures yerine daha garanti bir okuma:
        const features = geojsonFormat.readFeatures(tasinmaz.coordinate, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
            
            features.forEach(f=>{
              f.setProperties({
                lotNumber:tasinmaz.lotNumber,
                parcelNumber:tasinmaz.parcelNumber,
                address:tasinmaz.address
              });
            });
            this.vectorSource.addFeatures(features);

          }
        })
      },
      error: (err) => {
        console.error('Tasinmazlar yüklenemedi !', err);
        this.isLoading = false;
      },
    });
  }

  // loadLocations() {
  //   this.locationService.getIller().subscribe((iller) => {
  //     iller.forEach((il) => {
  //       this.ilMap.set(il.id, il.ad);

  //       this.locationService.getIlceler(il.id).subscribe((ilceler) => {
  //         ilceler.forEach((ilce) => {
  //           this.ilceMap.set(ilce.id, { ad: ilce.ad, ilId: il.id });

  //           this.locationService
  //             .getMahalleler(ilce.id)
  //             .subscribe((mahalleler) => {
  //               mahalleler.forEach((m) => {
  //                 this.mahalleMap.set(m.id, { ad: m.ad, ilceId: ilce.id });
  //               });
  //             });
  //         });
  //       });
  //     });
  //   });
  // }

  editTasinmaz(id: number) {
    this.router.navigate(['/dashboard/tasinmaz/edit', id]);
  }

  deleteTasinmaz(id: number) {
    if (confirm('Bu taşınmazı silmek istediğinize emin misiniz?')) {
      this.tasinmazService.deleteTasinmaz(id).subscribe({
      next: () => {
        this.successMessage = 'Taşınmaz başarıyla silindi.';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        this.loadTasinmaz();
      },
      error: (e) => {
        //console.error("Silinirken hata oluştu !",e)
        this.errorMessage = 'Taşınmaz silinirken bir hata oluştu.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3500);
      },
    });
    
}
  }
}
