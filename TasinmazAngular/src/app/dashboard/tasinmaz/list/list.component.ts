import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';

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

  loadTasinmaz() {
    this.tasinmazService.getAllTasinmaz().subscribe({
      next: (tasinmaz) => {
        this.tasinmazlar = tasinmaz;
        this.isLoading = false;
        //console.log("Tasinmazlar yüklendi !",this.tasinmazlar);
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
