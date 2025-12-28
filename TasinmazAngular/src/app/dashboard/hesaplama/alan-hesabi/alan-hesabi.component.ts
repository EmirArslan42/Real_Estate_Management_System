import { Component, OnInit } from '@angular/core';
import * as turf from '@turf/turf';
import { getArea } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

@Component({
  selector: 'app-alan-hesabi',
  templateUrl: './alan-hesabi.component.html',
  styleUrls: ['./alan-hesabi.component.css'],
})
export class AlanHesabiComponent implements OnInit {
  mode: 'manual' | 'auto' = 'manual';
  constructor() {}

  ngOnInit() {
    console.log(this.mode);
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
    if (!this.manualAreas.A.geometry) {
      this.manualAreas.A = { geometry: event.geojson, area: event.area };
      console.log('Alan A kaydedildi.');
    } else if (!this.manualAreas.B.geometry) {
      this.manualAreas.B = { geometry: event.geojson, area: event.area };
      console.log('Alan B kaydedildi.');
    } else if (!this.manualAreas.C.geometry) {
      this.manualAreas.C = { geometry: event.geojson, area: event.area };
      console.log('Alan C kaydedildi.');
      this.maxDrawReached = true;
    } else {
      alert('Zaten 3 alan çizildi. Yeni çizim için temizleyiniz.');
    }
  }

  alan: number = 0;
  intersection: number = 0;
  resetCounter: number = 0;

  getTotalArea() {
    this.alan =
      this.manualAreas.A.area +
      this.manualAreas.B.area +
      this.manualAreas.C.area;
    //console.log("TOPLAM ALAN: "+this.alan)
    return this.alan;
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
    const geomA = this.manualAreas[a].geometry;
    const geomB = this.manualAreas[b].geometry;
    if (!geomA || !geomB) return;

    const fa = JSON.parse(geomA);
    const fb = JSON.parse(geomB);

    const intersection = turf.intersect(
      turf.featureCollection([
        fa.type === 'FeatureCollection' ? fa.features[0] : fa,
        fb.type === 'FeatureCollection' ? fb.features[0] : fb,
      ])
    );

    if (!intersection) {
      this.alan = 0;
      alert('Kesişim yok');
      return;
    }
    this.currentOperation = 'A ∩ B';
    // ✅ DOĞRU VE TEK ALAN HESABI
    this.alan = turf.area(intersection);

    console.log('DOĞRU KESİŞİM (m²):', this.alan / 1000000);

    this.drawResult({
      geojson: intersection,
      operation: 'intersection',
    }); // 4326 olarak gönder

    this.maxDrawReached = true;
  }

  drawResult(result: { geojson: any; operation: string }) {
    this.geometryResult = result;
  }

  calculateUnionAB() {
    const geomA = this.manualAreas.A.geometry;
    const geomB = this.manualAreas.B.geometry;
    if (!geomA || !geomB) return;

    const fa = JSON.parse(geomA);
    const fb = JSON.parse(geomB);

    const featureA = fa.type === 'FeatureCollection' ? fa.features[0] : fa;
    const featureB = fb.type === 'FeatureCollection' ? fb.features[0] : fb;

    const union = turf.union(turf.featureCollection([featureA, featureB]));

    if (!union) {
      alert('Birleşim oluşturulamadı.');
      return;
    }

    this.currentOperation = 'A ∪ B';

    this.alan = turf.area(union);

    console.log('UNION A ∪ B (km²):', this.alan / 1000000);

    this.drawResult({
      geojson: union,
      operation: 'union',
    });
  }

  calculateUnionABC() {
    console.log('1 kere çalış');
    const geomA = this.manualAreas.A.geometry;
    const geomB = this.manualAreas.B.geometry;
    const geomC = this.manualAreas.C.geometry;

    if (!geomA || !geomB || !geomC) return;

    const fa = JSON.parse(geomA);
    const fb = JSON.parse(geomB);
    const fc = JSON.parse(geomC);
    const featureA = fa.type === 'FeatureCollection' ? fa.features[0] : fa;
    const featureB = fb.type === 'FeatureCollection' ? fb.features[0] : fb;
    const featureC = fc.type === 'FeatureCollection' ? fc.features[0] : fc;
    // A ∪ B
    const unionAB = turf.union(turf.featureCollection([featureA, featureB]));
    if (!unionAB) {
      alert('A ∪ B başarısız');
      return;
    }
    // (A ∪ B) ∪ C
    const unionABC = turf.union(turf.featureCollection([unionAB, featureC]));
    if (!unionABC) {
      alert('A ∪ B ∪ C başarısız');
      return;
    }

    this.alan = turf.area(unionABC);
    this.currentOperation = 'A ∪ B ∪ C';

    console.log('UNION A ∪ B ∪ C (km²):', this.alan / 1000000);

    this.drawResult({
      geojson: unionABC,
      operation: 'union',
    });
  }
}
