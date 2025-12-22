import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Geometry } from 'ol/geom';
import Feature from 'ol/Feature';

@Component({
  selector: 'app-tasinmaz-map',
  templateUrl: './tasinmaz-map.component.html',
  styleUrls: ['./tasinmaz-map.component.css'],
})
export class TasinmazMapComponent implements OnInit {

  @Input() allTasinmazlar: any[] = [];
// 🔹 Edit ekranında eski polygonu göstermek için
  @Input() existingGeometry: string | null = null;
  @Output() geometryDrawn = new EventEmitter<string>();

  map!: Map;
  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer({
    source: this.vectorSource,
  });

  draw!: Draw;

  ngOnInit(): void {
    this.initMap();
    this.addDrawInteraction();

    // 🔴 Edit ekranından gelen eski polygonu çiz
  // 🔴 Edit ekranından gelen eski polygonu haritaya çizdiğimiz kısım
  if (this.existingGeometry) {
    // BURAYA YAZILACAK:
    const feature = new GeoJSON().readFeature(this.existingGeometry, {
      dataProjection: 'EPSG:4326', // Veritabanındaki Enlem/Boylam formatı
      featureProjection: this.map.getView().getProjection(), // Haritadaki Metre (3857) formatı
    });

    this.vectorSource.addFeature(feature as Feature<Geometry>);
    
    // Opsiyonel: Haritayı bu şekle otomatik odakla
    this.map.getView().fit(this.vectorSource.getExtent(), { 
      padding: [50, 50, 50, 50],
      maxZoom: 18 
    });
  }

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingGeometry'] && changes['existingGeometry'].currentValue && this.map) {
      const geojsonFormat = new GeoJSON();
      const feature = geojsonFormat.readFeature(changes['existingGeometry'].currentValue, {
        dataProjection: 'EPSG:4326',
        featureProjection: this.map.getView().getProjection(),
      });

      this.vectorSource.clear();
      this.vectorSource.addFeature(feature as Feature<Geometry>);
    }
    // Liste değiştiğinde veya yüklendiğinde çalışır
    if (changes['allTasinmazlar'] && this.allTasinmazlar) {
      this.drawAllTasinmazlar();
    }
  }

  private drawAllTasinmazlar() {
    if (!this.map) return;
    this.vectorSource.clear(); // Önce temizle

    const geojsonFormat = new GeoJSON();

    this.allTasinmazlar.forEach(tasinmaz => {
      const geoData = tasinmaz.geometry || tasinmaz.coordinate;
      if (geoData) {
        try {
          const features = geojsonFormat.readFeatures(geoData, {
            dataProjection: 'EPSG:4326',
            featureProjection: this.map.getView().getProjection()
          });
          
          // Her bir şekle bilgi ekleyebiliriz (Tıklandığında göstermek için)
          features.forEach(f => f.set('info', tasinmaz));
          
          this.vectorSource.addFeatures(features);
        } catch (e) {
          console.error("Geometri okunamadı:", tasinmaz.id);
        }
      }
    });

    // Haritayı tüm taşınmazları içine alacak şekilde odakla
    // if (this.vectorSource.getFeatures().length > 0) {
    //   this.map.getView().fit(this.vectorSource.getExtent(), { 
    //     padding: [50, 50, 50, 50],
    //     duration: 1000 
    //   });
    // }
  }

  initMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: fromLonLat([32.8597, 39.9334]), // Türkiye merkezi
        zoom: 6,
      }),
    });
  }

  addDrawInteraction() {
    this.draw = new Draw({
      source: this.vectorSource,
      type: 'Polygon',
    });

    this.map.addInteraction(this.draw);

    this.draw.on('drawend', (event) => {
  const feature = event.feature;
  
  // Veriyi klonlayıp çeviriyoruz ki haritadaki orijinal çizim bozulmasın
  const clonedFeature = feature.clone();
  clonedFeature.getGeometry()?.transform('EPSG:3857', 'EPSG:4326');

  // writeGeometry yerine writeFeature kullanarak tam GeoJSON objesi oluşturuyoruz
  const geojson = new GeoJSON().writeFeature(clonedFeature);

  this.geometryDrawn.emit(geojson);
});
  }
}
