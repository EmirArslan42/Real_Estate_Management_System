import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LocationService } from 'src/app/shared/location.service';
import { TasinmazService } from 'src/app/dashboard/tasinmaz/tasinmaz.service';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { add } from 'ol/coordinate';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from  'html2canvas' ;

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
  filterForm!:FormGroup;
  filteredTasinmazlar:any[]=[];
  

  // ilMap = new Map<number, string>();
  // ilceMap = new Map<number, { ad: string; ilId: number }>();
  // mahalleMap = new Map<number, { ad: string; ilceId: number }>();

  constructor(
    private tasinmazService: TasinmazService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router,
    private fb:FormBuilder
  ) {}

  ngOnInit() {
    //this.loadLocations();
    this.filterForm=this.fb.group({
      il:[''],
      ilce:[''],
      mahalle:[''],
      address:[''],
      user:[''],
    });
    this.isAdmin=this.authService.isAdmin(); 
    this.loadTasinmaz();

    this.filterForm.valueChanges.subscribe(()=>{
      this.applyFilter();
    })
  }

  applyFilter(){
    const {il,ilce,mahalle,address,user}=this.filterForm.value;
    this.filteredTasinmazlar=this.tasinmazlar.filter(tasinmaz=>{ 
      
      const ilMatch= !il || tasinmaz.ilAdi?.toLowerCase().includes(il.toLowerCase()); 
      const ilceMatch= !ilce || tasinmaz.ilceAdi?.toLowerCase().includes(ilce.toLowerCase());
      const mahalleMatch= !mahalle || tasinmaz.mahalleAdi?.toLowerCase().includes(mahalle.toLowerCase());
      const addressMatch= !address || tasinmaz.address?.toLowerCase().includes(address.toLowerCase());
      const userMatch= !user || tasinmaz.userEmail?.toLowerCase().includes(user.toLowerCase());
      return ilMatch && ilceMatch && mahalleMatch && addressMatch && userMatch;
    });
  }

  clearFilterForm(){
    this.filterForm.reset();
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
    
    const request=this.isAdmin ? this.tasinmazService.getAllTasinmazForAdmin()
    :  this.tasinmazService.getAllTasinmaz();

    request.subscribe({
      next: (tasinmaz) => {
        console.log("Gelen ilk kayıt:", tasinmaz[0]);
        this.tasinmazlar = tasinmaz;
        this.filteredTasinmazlar=tasinmaz;
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

  exportExcel() {
  const data = this.filteredTasinmazlar.map(t => ({
    ID:t.id,
    Ada: t.lotNumber,
    Parsel: t.parcelNumber,
    İl: t.ilAdi,
    İlçe: t.ilceAdi,
    Mahalle: t.mahalleAdi,
    Adres: t.address,
    ...(this.isAdmin && { Kullanıcı: t.userEmail })
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Taşınmazlar': worksheet },
    SheetNames: ['Taşınmazlar']
  };

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  saveAs(blob, `tasinmazlar_${new Date().toISOString()}.xlsx`);
}

  exportPdf() { 
    const data = document.getElementById('contentToConvert'); 
    if(!data) { return; }
    html2canvas(data).then( canvas => { 
      const imgWidth = 208 ; 
      const pageHeight = 295 ; 
      const imgHeight = canvas. height * imgWidth / canvas. width ; 
      const heightLeft = imgHeight; 

      const contentDataURL = canvas. toDataURL ( 'image/png' ); 
      const pdf = new  jsPDF ( 'p' , 'mm' , 'a4' ); // PDF'nin A4 boyutlu sayfası 

      let position = 0 ; 
      pdf. addImage (contentDataURL, 'PNG' , 0 , position, imgWidth, imgHeight); 
      pdf. save ( 'Taşınmaz-liste.pdf' ); // Oluşturulan PDF
     }); 
  } 

  onExcelUpload(event:any){
    const file=event.target.files[0];
    if(!file) return;

    const reader=new FileReader();
    reader.onload=(e:any)=>{
      const data=new Uint8Array(e.target.result);
      const workbook=XLSX.read(data,{type:'array'});
      const sheetName=workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<any>(worksheet);
      this.addTasinmazFromExcel(rows);
    }
    reader.readAsArrayBuffer(file);
  }


onTasinmazSelected(tasinmaz: any) {
  this.selectedTasinmaz = tasinmaz;
}

  addTasinmazFromExcel(rows:any[]){
    rows.forEach(row=>{
      const dto={
        mahalleId: Number(row.MahalleId),
        lotNumber: row.Ada?.toString(),
        parcelNumber: row.Parsel?.toString(),
        address: row.Adres || "",
        geometry: JSON.stringify({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
           [
             [0, 0], [0, 0.0001], [0.0001, 0.0001], [0.0001, 0], [0, 0]
           ]
        ]
     },
    properties: {}
  })

      };
      console.log('Excel satırı:', row);
      

      this.tasinmazService.addTasinmazFromExcel({
  mahalleId: Number(row['MahalleId']), 
  lotNumber: row['Ada']?.toString(),
  parcelNumber: row['Parsel']?.toString(),
  address: row['Adres']?.toString()
})
    .subscribe({
      next: () => console.log('Excel satırı eklendi'),
      error: () => console.error('Excel satırı eklenemedi')
    });

      
    })
    alert("Excelden taşınmaz ekleme işlemi başarılı");
    this.loadTasinmaz();
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
