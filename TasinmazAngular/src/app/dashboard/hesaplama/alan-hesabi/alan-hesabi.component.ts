import { Component} from '@angular/core';
import * as turf from '@turf/turf';
import { AlanAnalizService } from '../alan-analiz.service';

type AreaKey = 'A' | 'B' | 'C';

@Component({
  selector: 'app-alan-hesabi',
  templateUrl: './alan-hesabi.component.html',
  styleUrls: ['./alan-hesabi.component.css'],
})

export class AlanHesabiComponent{
  errorMessage: string = '';
  successMessage: string = '';
  mode: 'manual' | 'auto' = 'manual';
  constructor(private alanAnalizService: AlanAnalizService) {}

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
    let name: AreaKey;

    if (!this.manualAreas.A.geometry) {
      name = 'A';
    } else if (!this.manualAreas.B.geometry) {
      name = 'B';
    } else if (!this.manualAreas.C.geometry) {
      name = 'C';
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
      next: () => this.showSuccessAlert(`${name} kaydedildi / güncellendi`),
      error: () => this.showErrorAlert(`${name} kaydedilirken hata oluştu`),
    });
  }

  alan: number = 0;
  intersection: number = 0;
  resetCounter: number = 0;
  savedResults: any[] = [];

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

  loadSavedResults() {
    this.alanAnalizService.getUnionResults().subscribe({
      next: (res: any) => {
        this.alanAnalizService.getAutoSelect().subscribe({
          next: (abc: any) => {
            const abcList = [
              {
                id: abc.a.id,
                name: 'A',
                operation: 'A',
                geometry: abc.a.geometry,
                area: abc.a.area,
              },
              {
                id: abc.b.id,
                name: 'B',
                operation: 'B',
                geometry: abc.b.geometry,
                area: abc.b.area,
              },
              {
                id: abc.c.id,
                name: 'C',
                operation: 'C',
                geometry: abc.c.geometry,
                area: abc.c.area,
              },
            ];
            this.savedResults = [...abcList, ...res];
          },
          error: (err) => {
            this.savedResults = res;
          },
        });
      },
      error: (err) => {
        alert('Sonuçlar yüklenemedi');
      },
    });
  }

  showResultOnMap(result: any) {
    this.geometryResult = {
      geojson: JSON.parse(result.geometry),
      operation: 'union',
    };

    this.alan = result.area;
    this.currentOperation = result.operation;
  }

  getTotalArea() {
    this.currentOperation = 'A+B+C';
    this.alan =
      this.manualAreas.A.area +
      this.manualAreas.B.area +
      this.manualAreas.C.area;
    return this.alan;
  }

  resetAnaliz() {
    this.alanAnalizService.deleteAllAnaliz().subscribe({
      next: () => {
        this.showSuccessAlert("A, B, C, D, E db'den silindi");
      },
    });
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

  private toFeature(input: any) {
  if (input.type === 'FeatureCollection') {
    return input.features[0];
  }

  if (input.type === 'Feature') {
    return input;
  }

  return turf.feature(input);
}

private parseGeometry(geom: any) {
  return typeof geom === 'string' ? JSON.parse(geom) : geom;
}

  calculateIntersection(a: AreaKey, b: AreaKey) {
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
      const featureA=this.toFeature(fa);
      const featureB=this.toFeature(fb);
      // 5. Kesişim  İşlemi
      const intersection = turf.intersect(
        turf.featureCollection([featureA, featureB])
      );

      // 6. Kesişim bulunamadıysa uyarı ver
      if (!intersection) {
        this.alan = 0;
        this.currentOperation = null;
        this.geometryResult = null; // Haritadaki eski sonucu temizle
        alert('Kesişim bulunamadı (No intersection found).');
        return;
      }
      // 7. Kesişim varsa m² hesapla ve haritada göster
      this.currentOperation = `${a} ∩ ${b}`;
      this.alan = turf.area(intersection); // Alan m² olarak hesaplanır

      // Sonucu harita bileşenine gönder
      this.drawResult({
        geojson: intersection,
        operation: 'intersection',
      });

      this.maxDrawReached = true;
    } catch (error) {
      this.showErrorAlert(`Kesişim hesaplama hatası, geometri verisi işlenemedi`);
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
      alert('Lütfen A ve B alanlarını tamamlayın.');
      return;
    }

    try {
      // 2. Güvenli Parse (String gelirse objeye çevir, nesne ise direkt al)
      const fa = typeof geomA === 'string' ? JSON.parse(geomA) : geomA;
      const fb = typeof geomB === 'string' ? JSON.parse(geomB) : geomB;

      // 3. Feature Çıkarma (FeatureCollection veya Feature fark etmeksizin)
      const featureA=this.toFeature(fa);
      const featureB=this.toFeature(fb);

      // 4. Union İşlemi
      const union = turf.union(turf.featureCollection([featureA, featureB]));

      if (!union) {
        alert('Birleşim oluşturulamadı.');
        return;
      }

      // 5 Alan Hesaplama ve UI Güncelleme
      this.currentOperation = 'A ∪ B';
      this.alan = turf.area(union); // m² cinsinden döner

      // 6 Sonucu D olarak dbye Kaydet
      this.alanAnalizService
        .save({
          name: 'D', // SRS Gereksinimi
          operation: 'A ∪ B',
          geometry: JSON.stringify(union),
          area: this.alan,
        })
        .subscribe({
          next: () => {
            this.showSuccessAlert("Birleşim D başarıyla kaydedildi.");
            this.loadSavedResults(); // Tabloyu yenile
          },
          error: () => this.showErrorAlert(`D kaydı başarısız:`),
        }); 

      // 7. Haritada Göster
      this.drawResult({
        geojson: union,
        operation: 'union',
      });
    } catch (error) {
      this.showErrorAlert("Union AB Hatası");
      alert('Geometri verisi işlenirken hata oluştu.');
    }
  }
  calculateUnionABC() {
    const {A,B,C} = this.manualAreas;
    // 1. 3 Geometri de var mı kontrolü (REQ-4)
    if (!A.geometry || !B.geometry || !C.geometry) {
      alert('Lütfen A, B ve C alanlarının tamamını hazırlayın.');
      return;
    }

    try {
      //  Parse işlemi
      const fA = this.toFeature(this.parseGeometry(A.geometry));
      const fB = this.toFeature(this.parseGeometry(B.geometry));
      const fC = this.toFeature(this.parseGeometry(C.geometry))

      // (A ∪ B ∪ C) Önce A ve B'yi birleştir, sonra sonucu C ile birleştir
      const unionAB = turf.union(turf.featureCollection([fA, fB]));
      if (!unionAB){
        alert("A ∪ B oluşturulamadı.");
      }

      const unionABC = turf.union(turf.featureCollection([unionAB, fC]));

      if (!unionABC) {
        alert('Üçlü birleşim oluşturulamadı.');
        return;
      }
      // Alan Hesaplama 
      this.currentOperation = 'A ∪ B ∪ C';
      this.alan = turf.area(unionABC);

      // Sonucu E olarak dbye Kaydet
      this.alanAnalizService
        .save({
          name: 'E', 
          operation: 'A ∪ B ∪ C',
          geometry: JSON.stringify(unionABC),
          area: this.alan,
        })
        .subscribe({
          next: () => {
            this.showSuccessAlert("Birleşim E başarıyla kaydedildi.");
            this.loadSavedResults();
          },
          error: (err) => this.showErrorAlert("E kaydı başarısız"),
        });

      // Haritada Göster
      this.drawResult({
        geojson: unionABC,
        operation: 'union',
      });
    } catch (error) {
      this.showErrorAlert("Union ABC Hatası");
    }
  }

  loadManualSelect() {
    this.mode = 'manual';
    this.resetAreas();
  }

  loadAutoSelect() {
    this.mode = 'auto';
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