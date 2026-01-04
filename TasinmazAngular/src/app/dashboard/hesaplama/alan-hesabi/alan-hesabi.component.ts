import { Component, OnInit } from '@angular/core';
import * as turf from '@turf/turf';
import { getArea } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { AlanAnalizService } from '../alan-analiz.service';

@Component({
  selector: 'app-alan-hesabi',
  templateUrl: './alan-hesabi.component.html',
  styleUrls: ['./alan-hesabi.component.css'],
})
export class AlanHesabiComponent implements OnInit {
  mode: 'manual' | 'auto' = 'manual';
  constructor(private alanAnalizService:AlanAnalizService) {}

  ngOnInit() {
    console.log("Default gelen mod:",this.mode);
  }

  manualAreas: any = {
    A: { geometry: null, area: 0 },
    B: { geometry: null, area: 0 },
    C: { geometry: null, area: 0 },
  };

  maxDrawReached = false;
  geometryResult: any = null;
  currentOperation: string | null = null;

  onGeometryDrawn(event: any) {
    // Eğer daha önce A dolmadıysa A'ya, A doluysa B'ye, B doluysa C'ye yaz
    let name: 'A' | 'B' | 'C'

    if (!this.manualAreas.A.geometry) {
      name='A'
      console.log('Alan A kaydedildi.');
    } else if (!this.manualAreas.B.geometry) {
      name='B'
      console.log('Alan B kaydedildi.');
    } else if (!this.manualAreas.C.geometry) {
      name='C'
      console.log('Alan C kaydedildi.');
      this.maxDrawReached = true;
    } else {
      alert('Zaten 3 alan çizildi. Yeni çizim için temizleyiniz.');
      return;
    }

      const geometryString =
    typeof event.geojson === 'string'
      ? event.geojson
      : JSON.stringify(event.geojson);

  this.manualAreas[name] = {
    geometry: geometryString,
    area: event.area,
  };

  const dto = {
    name: name,
    operation: name,
    geometry: geometryString,
    area: event.area,
  };

  this.alanAnalizService.save(dto).subscribe({
    next: () => console.log(`${name} kaydedildi / güncellendi`),
    error: () => alert(`${name} kaydedilirken hata oluştu`),
  });


    // if (!this.manualAreas.A.geometry) {
    //   this.manualAreas.A = { geometry: event.geojson, area: event.area };
    //   console.log('Alan A kaydedildi.');
    // } else if (!this.manualAreas.B.geometry) {
    //   this.manualAreas.B = { geometry: event.geojson, area: event.area };
    //   console.log('Alan B kaydedildi.');
    // } else if (!this.manualAreas.C.geometry) {
    //   this.manualAreas.C = { geometry: event.geojson, area: event.area };
    //   console.log('Alan C kaydedildi.');
    //   this.maxDrawReached = true;
    // } else {
    //   alert('Zaten 3 alan çizildi. Yeni çizim için temizleyiniz.');
    // }
  }

  alan: number = 0;
  intersection: number = 0;
  resetCounter: number = 0;
  savedResults:any[]=[];


  loadSavedResults(){
    this.alanAnalizService.getUnionResults().subscribe({
      next:(res:any)=>{
        //this.savedResults=res;

        this.alanAnalizService.getAutoSelect().subscribe({
          next:(abc:any)=>{
            const abcList=[
              {id:abc.a.id,name:'A',operation:'A',geometry:abc.a.geometry,area:abc.a.area},
              {id:abc.b.id,name:'B',operation:'B',geometry:abc.b.geometry,area:abc.b.area},
              {id:abc.c.id,name:'C',operation:'C',geometry:abc.c.geometry,area:abc.c.area},
            ];
            this.savedResults=[...abcList,...res];
          },
          error:(err)=>{
            this.savedResults = res;
          }
        })
      },
      error:(err)=>{
        alert("Sonuçlar yüklenemedi");
      }
    })

    console.log(this.savedResults);
    
  };

  showResultOnMap(result:any){
  this.geometryResult = {
    geojson: JSON.parse(result.geometry),
    operation: 'union'
  };

  this.alan = result.area;
  this.currentOperation = result.operation;
}


  getTotalArea() {
    this.currentOperation="A+B+C"
    this.alan =
      this.manualAreas.A.area +
      this.manualAreas.B.area +
      this.manualAreas.C.area;
    //console.log("TOPLAM ALAN: "+this.alan)
    return this.alan;
  }

  resetAnaliz(){
    this.alanAnalizService.deleteAllAnaliz().subscribe({
      next:()=>{
        console.log("A, B, C, D, E db'den silindi");
      }
    })
  }
  resetAreas() {
    this.manualAreas = {
      A: { geometry: null, area: 0 },
      B: { geometry: null, area: 0 },
      C: { geometry: null, area: 0 },
    };
    this.resetCounter++;
    this.maxDrawReached = false;
    this.alan = 0;
    this.currentOperation = null;
    this.geometryResult = null;
  }

  // alan-hesabi.component.ts
  formatArea(areaSqMeters: number): string {
    if (areaSqMeters >= 1_000_000) {
      return (
        (areaSqMeters / 1_000_000).toLocaleString('tr-TR', {
          maximumFractionDigits: 2,
        }) + ' km²'
      );
    }
    if (areaSqMeters >= 10_000) {
      return (
        (areaSqMeters / 10_000).toLocaleString('tr-TR', {
          maximumFractionDigits: 2,
        }) + ' Hektar'
      );
    }
    return (
      areaSqMeters.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' m²'
    );
  }



  calculateIntersection(a: 'A' | 'B' | 'C', b: 'A' | 'B' | 'C') {
  // 1. İlgili harf parametrelerine göre geometrileri al
  const geomA = this.manualAreas[a].geometry;
  const geomB = this.manualAreas[b].geometry;

  // 2. Geometri varlık kontrolü
  if (!geomA || !geomB) {
    alert(`Lütfen ${a} ve ${b} alanlarını tamamlayın.`);
    return;
  }

  try {
    // 3. Güvenli Parse (String ise objeye çevir, nesne ise direkt al)
    const fa = typeof geomA === 'string' ? JSON.parse(geomA) : geomA;
    const fb = typeof geomB === 'string' ? JSON.parse(geomB) : geomB;

    // 4. Feature Çıkarma (Kritik fa.type ve fb.type kontrolleri)
    const featureA = fa.type === 'FeatureCollection' ? fa.features[0] : (fa.type === 'Feature' ? fa : turf.feature(fa));
    const featureB = fb.type === 'FeatureCollection' ? fb.features[0] : (fb.type === 'Feature' ? fb : turf.feature(fb));

    // 5. Kesişim (Intersection) İşlemi
    const intersection = turf.intersect(turf.featureCollection([featureA, featureB]));

    // 6. REQ-10: Kesişim bulunamadıysa uyarı ver
    if (!intersection) {
      this.alan = 0;
      this.currentOperation = null;
      this.geometryResult = null; // Haritadaki eski sonucu temizle
      alert('Kesişim bulunamadı (No intersection found).');
      return;
    }

    // 7. REQ-11: Kesişim varsa m² hesapla ve haritada göster
    this.currentOperation = `${a} ∩ ${b}`;
    this.alan = turf.area(intersection); // Alan m² olarak hesaplanır

    console.log(`KESİŞİM ${a} ∩ ${b} (m²):`, this.alan);

    // Sonucu harita bileşenine gönder
    this.drawResult({
      geojson: intersection,
      operation: 'intersection',
    });

    this.maxDrawReached = true;

  } catch (error) {
    console.error("Kesişim hesaplama hatası:", error);
    alert("Geometri verisi işlenirken bir hata oluştu.");
  }
}

  drawResult(result: { geojson: any; operation: string }) {
    this.geometryResult = result;
  }


  calculateUnionAB() {
  const geomA = this.manualAreas.A.geometry;
  const geomB = this.manualAreas.B.geometry;

  // 1. Geometri varlık kontrolü
  if (!geomA || !geomB) {
    alert("Lütfen A ve B alanlarını tamamlayın.");
    return;
  }

  try {
    // 2. Güvenli Parse (String gelirse objeye çevir, nesne ise direkt al)
    const fa = typeof geomA === 'string' ? JSON.parse(geomA) : geomA;
    const fb = typeof geomB === 'string' ? JSON.parse(geomB) : geomB;

    // 3. Feature Çıkarma (FeatureCollection veya Feature fark etmeksizin)
    const featureA = fa.type === 'FeatureCollection' ? fa.features[0] : (fa.type === 'Feature' ? fa : turf.feature(fa));
    const featureB = fb.type === 'FeatureCollection' ? fb.features[0] : (fb.type === 'Feature' ? fb : turf.feature(fb));

    // 4. Union İşlemi
    const union = turf.union(turf.featureCollection([featureA, featureB]));

    if (!union) {
      alert('Birleşim oluşturulamadı.');
      return;
    }

    // 5. Alan Hesaplama ve UI Güncelleme
    this.currentOperation = 'A ∪ B';
    this.alan = turf.area(union); // m² cinsinden döner

    // 6. REQ-13: Sonucu 'D' ismiyle Veritabanına Kaydet
    this.alanAnalizService.save({
      name: 'D', // SRS Gereksinimi
      operation: 'A ∪ B',
      geometry: JSON.stringify(union),
      area: this.alan
    }).subscribe({
      next: () => {
        console.log("Birleşim D başarıyla kaydedildi.");
        this.loadSavedResults(); // Tabloyu yenile
      },
      error: (err) => console.error("D kaydı başarısız:", err)
    });

    // 7. Haritada Göster
    this.drawResult({
      geojson: union,
      operation: 'union'
    });

  } catch (error) {
    console.error("Union AB Hatası:", error);
    alert("Geometri verisi işlenirken hata oluştu.");
  }
}

  calculateUnionABC() {
  const geomA = this.manualAreas.A.geometry;
  const geomB = this.manualAreas.B.geometry;
  const geomC = this.manualAreas.C.geometry;

  // 1. 3 Geometri de var mı kontrolü (REQ-4)
  if (!geomA || !geomB || !geomC) {
    alert("Lütfen A, B ve C alanlarının tamamını hazırlayın.");
    return;
  }

  try {
    // 2. Güvenli Parse
    const fa = typeof geomA === 'string' ? JSON.parse(geomA) : geomA;
    const fb = typeof geomB === 'string' ? JSON.parse(geomB) : geomB;
    const fc = typeof geomC === 'string' ? JSON.parse(geomC) : geomC;

    // 3. Feature formatına zorlama (Kritik fa.type kontrolü)
    const fA = fa.type === 'FeatureCollection' ? fa.features[0] : (fa.type === 'Feature' ? fa : turf.feature(fa));
    const fB = fb.type === 'FeatureCollection' ? fb.features[0] : (fb.type === 'Feature' ? fb : turf.feature(fb));
    const fC = fc.type === 'FeatureCollection' ? fc.features[0] : (fc.type === 'Feature' ? fc : turf.feature(fc));

    // 4. Üçlü Union (A ∪ B ∪ C)
    // Önce A ve B'yi birleştir, sonra sonucu C ile birleştir
    const unionAB = turf.union(turf.featureCollection([fA, fB]));
    if (!unionAB) return;
    
    const unionABC = turf.union(turf.featureCollection([unionAB, fC]));

    if (!unionABC) {
      alert('Üçlü birleşim oluşturulamadı.');
      return;
    }

    // 5. Alan Hesaplama (REQ-14)
    this.currentOperation = 'A ∪ B ∪ C';
    this.alan = turf.area(unionABC);

    // 6. REQ-13: Sonucu 'E' ismiyle Veritabanına Kaydet
    this.alanAnalizService.save({
      name: 'E', // SRS Gereksinimi
      operation: 'A ∪ B ∪ C',
      geometry: JSON.stringify(unionABC),
      area: this.alan
    }).subscribe({
      next: () => {
        console.log("Birleşim E başarıyla kaydedildi.");
        this.loadSavedResults();
      },
      error: (err) => console.error("E kaydı başarısız:", err)
    });

    // 7. Haritada Göster
    this.drawResult({
      geojson: unionABC,
      operation: 'union'
    });

  } catch (error) {
    console.error("Union ABC Hatası:", error);
  }
}

loadManualSelect(){
  this.mode='manual';
  this.resetAreas();
  console.log("Manual mode'a geçtik")
}

  loadAutoSelect() {
  this.mode = 'auto';
  console.log("Auto moda geçti: ",this.mode);
  this.resetAreas();
  this.maxDrawReached = true;

  this.alanAnalizService.getAutoSelect().subscribe({
    next: (res: any) => {
      const a = JSON.parse(res.a.geometry);
      const b = JSON.parse(res.b.geometry);
      const c = JSON.parse(res.c.geometry);

      this.manualAreas.A = { geometry: res.a.geometry, area: res.a.area };
      this.manualAreas.B = { geometry: res.b.geometry, area: res.b.area };
      this.manualAreas.C = { geometry: res.c.geometry, area: res.c.area };

      this.geometryResult = {
        geojson: {
          type: 'FeatureCollection',
          features: [a, b, c],
        },
        operation: 'auto-select',
      };

      this.maxDrawReached = true;
    },
    error: () => {
      alert('Kayıtlı A, B, C bulunamadı. Lütfen manuel çizim yapın.');
      this.loadManualSelect();
    },
  });
}

}