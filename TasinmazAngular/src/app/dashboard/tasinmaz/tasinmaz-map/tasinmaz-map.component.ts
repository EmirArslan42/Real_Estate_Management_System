import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from '@angular/core';

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
import { Router } from '@angular/router';
import { getArea } from 'ol/sphere';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

@Component({
  selector: 'app-tasinmaz-map',
  templateUrl: './tasinmaz-map.component.html',
  styleUrls: ['./tasinmaz-map.component.css'],
})
export class TasinmazMapComponent implements OnInit {
  @Input() allTasinmazlar: any[] = [];
  @Input() existingGeometry: string | null = null; // Edit ekranında eski polygonu göstermek için
  @Output() geometryDrawn = new EventEmitter<any>();
  @Output() tasinmazSelected = new EventEmitter<any>();
  @Input() mode: 'add' | 'edit' | 'manual' | 'auto' = 'add';
  @Input() resetCounter = 0;
  @Input() disableDraw = false;
  @Input() resultGeometry: any;

  map!: Map;
  manualDrawIndex = 0;
  manualLabels = ['A', 'B', 'C'];
  drawnFeatures: Feature[] = [];

  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer({
    source: this.vectorSource,
  });

  draw!: Draw;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initMap();

    if (
      !this.router.url.includes('/dashboard/tasinmaz/list') &&
      (this.mode == 'edit' || this.mode == 'add' || this.mode == 'manual')
    ) {
      this.addDrawInteraction();
    }

    // Edit ekranından gelen eski polygonu haritaya çizdiğimiz kısım
    if (this.existingGeometry) {
      const feature = new GeoJSON().readFeature(this.existingGeometry, {
        dataProjection: 'EPSG:4326', // Veritabanındaki Enlem/Boylam formatı
        featureProjection: this.map.getView().getProjection(), // Haritadaki Metre (3857) formatı
      });

      this.vectorSource.addFeature(feature as Feature<Geometry>);

      // Haritayı odaklamak için
      this.map.getView().fit(this.vectorSource.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 18,
      });
    }

    this.map.on('singleclick', (event) => {
      this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const tasinmaz = feature.get('info');
        if (tasinmaz) {
          this.tasinmazSelected.emit(tasinmaz);
        }
      });
    });
  }

  areaStyles: Record<string, Style> = {
    A: new Style({
      fill: new Fill({ color: 'rgba(40, 167, 69, 0.4)' }),
      stroke: new Stroke({ color: '#28a745', width: 2 }),
    }),
    B: new Style({
      fill: new Fill({ color: 'rgba(255, 193, 7, 0.4)' }),
      stroke: new Stroke({ color: '#ffc107', width: 2 }),
    }),
    C: new Style({
      fill: new Fill({ color: 'rgba(108, 117, 125, 0.4)' }),
      stroke: new Stroke({ color: '#6c757d', width: 2 }),
    }),
  };

  intersectionStyle = new Style({
    fill: new Fill({ color: 'rgba(255,0,0,0.5)' }),
    stroke: new Stroke({ color: '#ff0000', width: 3 }),
  });

  unionStyle = new Style({
    fill: new Fill({ color: 'rgba(0,123,255,0.4)' }),
    stroke: new Stroke({ color: '#007bff', width: 3 }),
  });

  private handleExistingGeometry(changes: SimpleChanges): void {
    if (
      changes['existingGeometry'] &&
      changes['existingGeometry'].currentValue &&
      this.map
    ) {
      const geojsonFormat = new GeoJSON();
      const feature = geojsonFormat.readFeature(
        changes['existingGeometry'].currentValue,
        {
          dataProjection: 'EPSG:4326',
          featureProjection: this.map.getView().getProjection(),
        }
      );

      this.vectorSource.clear();
      this.vectorSource.addFeature(feature as Feature<Geometry>);
    }
  }

  private handleAllTasinmazlar(changes: SimpleChanges): void {
    // Liste değiştiğinde veya yüklendiğinde çalışır
    if (changes['allTasinmazlar'] && this.allTasinmazlar) {
      this.drawAllTasinmazlar();
    }
  }

  private handleReset(changes: SimpleChanges): void {
    if (changes['resetCounter'] && !changes['resetCounter'].firstChange) {
      this.vectorSource.clear();
    }
  }

  private handleDrawToggle(changes: SimpleChanges): void {
    if (changes['disableDraw'] && this.draw) {
      if (this.disableDraw) {
        this.map.removeInteraction(this.draw); // çizim kapalı
      } else {
        this.map.addInteraction(this.draw); // çizim açık
      }
    }
  }

  private readResultFeatures(): Feature<Geometry>[] {
    const format = new GeoJSON();

    if (this.resultGeometry.geojson.type === 'FeatureCollection') {
      return format.readFeatures(this.resultGeometry.geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });
    }

    return [
      format.readFeature(this.resultGeometry.geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature<Geometry>,
    ];
  }

  private applyResultStyle(feature: Feature<Geometry>): void {
    if (this.resultGeometry.operation === 'intersection') {
      feature.setStyle(this.intersectionStyle);
    }

    if (this.resultGeometry.operation === 'union') {
      feature.setStyle(this.unionStyle);
    }
    this.vectorSource.addFeature(feature);
  }

  private fitMapToResult(): void {
    const extent = this.vectorSource.getExtent();
    const isValid = extent.every((v) => isFinite(v) && !isNaN(v));

    if (isValid && extent[0] !== Infinity) {
      this.map.getView().fit(extent, {
        padding: [120, 120, 120, 120],
        duration: 600,
      });
    }
  }

  private handleResultGeometry(changes: SimpleChanges): void {
    if (
      changes['resultGeometry'] &&
      this.resultGeometry &&
      this.resultGeometry.geojson
    ) {
      try {
        const features = this.readResultFeatures();

        if (!features.length) return;

        this.vectorSource.clear();
        features.forEach((feature) => this.applyResultStyle(feature));
        this.fitMapToResult();
      } catch (err) {
        alert("Harita çizim hatası");
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleExistingGeometry(changes);
    this.handleAllTasinmazlar(changes);
    this.handleReset(changes);
    this.handleDrawToggle(changes);
    this.handleResultGeometry(changes);
  }

  private drawAllTasinmazlar() {
    if (!this.map) return;
    this.vectorSource.clear(); // Önce hepsini temizle

    const geojsonFormat = new GeoJSON();

    this.allTasinmazlar.forEach((tasinmaz) => {
      const geoData = tasinmaz.geometry || tasinmaz.coordinate;
      if (geoData) {
        try {
          const features = geojsonFormat.readFeatures(geoData, {
            dataProjection: 'EPSG:4326',
            featureProjection: this.map.getView().getProjection(),
          });
          // Her bir şekle bilgi ekleyebiliriz (Tıklandığında göstermek için)
          features.forEach((f) => f.set('info', tasinmaz));

          this.vectorSource.addFeatures(features);
        } catch (e) {
          alert("Geometri okunamadı");
        }
      }
    });
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
      const label = this.manualLabels[this.manualDrawIndex];
      this.manualDrawIndex++;

      feature.setStyle(this.areaStyles[label]);

      const cloned = feature.clone();
      cloned.getGeometry()?.transform('EPSG:3857', 'EPSG:4326');

      this.geometryDrawn.emit({
        geojson: new GeoJSON().writeFeature(cloned),
        area: getArea(cloned.getGeometry()!, { projection: 'EPSG:4326' }),
      });
    });
  }
}