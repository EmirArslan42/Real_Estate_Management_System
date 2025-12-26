import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alan-hesabi',
  templateUrl: './alan-hesabi.component.html',
  styleUrls: ['./alan-hesabi.component.css']
})
export class AlanHesabiComponent implements OnInit{

  mode:'manual' | 'auto' ='manual'
  constructor(){

  }

  ngOnInit(){
    console.log(this.mode)
  }

//   manualAreas: any = {
//   A: null,
//   B: null,
//   C: null
// };

manualAreas: any = {
  A: { geometry: null, area: 0 },
  B: { geometry: null, area: 0 },
  C: { geometry: null, area: 0 }
};

// onGeometryDrawn(event: any) {
//   this.manualAreas[event.label] = event.geometry;
//   console.log(this.manualAreas);
// }
  
onGeometryDrawn(event: any) {
  // Eğer daha önce A dolmadıysa A'ya, A doluysa B'ye, B doluysa C'ye yaz
  if (!this.manualAreas.A.geometry) {
    this.manualAreas.A = { geometry: event.geojson, area: event.area };
    console.log("Alan A kaydedildi.");
  } else if (!this.manualAreas.B.geometry) {
    this.manualAreas.B = { geometry: event.geojson, area: event.area };
    console.log("Alan B kaydedildi.");
  } else if (!this.manualAreas.C.geometry) {
    this.manualAreas.C = { geometry: event.geojson, area: event.area };
    console.log("Alan C kaydedildi.");
  } else {
    alert("Zaten 3 alan çizildi. Yeni çizim için temizleyiniz.");
  }
}

alan:number=0;

getTotalArea(): number {
  this.alan= this.manualAreas.A.area + this.manualAreas.B.area + this.manualAreas.C.area;
  console.log("TOPLAM ALAN: "+this.alan)
  return this.alan;
}

resetAreas() {
  this.manualAreas = {
    A: { geometry: null, area: 0 },
    B: { geometry: null, area: 0 },
    C: { geometry: null, area: 0 }
  };
}

// alan-hesabi.component.ts

formatArea(areaSqMeters: number): string {
  if (!areaSqMeters) return '0 m²';

  if (areaSqMeters >= 1_000_000) {
    // 1 milyon m2'den büyükse Kilometrekareye çevir
    const km2 = areaSqMeters / 1_000_000;
    return km2.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' km²';
  } else if (areaSqMeters >= 10_000) {
    // 10 bin m2'den büyükse Hektar/Dönüm cinsinden göster (Opsiyonel)
    const hektar = areaSqMeters / 10_000;
    return hektar.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' Hektar';
  } else {
    // Küçük alanlar için metrekare
    return areaSqMeters.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' m²';
  }
}


}