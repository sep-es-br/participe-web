import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap';
import 'heatmap.js';
import 'heatmap.js/plugins/leaflet-heatmap';
import { IHeatMapLocation } from '@app/shared/interface/IControlPanelDashboardData';
import { ResponsiveService } from '@app/shared/services/responsive.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.scss']
})
export class HeatMapComponent implements OnInit, OnDestroy, OnChanges {

  @Input() locations: IHeatMapLocation[];
  @Input() center: {lat: number; lng: number};
  @Input() zoom: number;

  responsive: boolean;
  $destroy = new Subject();
  heatmapLayer: HeatmapOverlay;

  constructor(
    private responsiveSrv: ResponsiveService,
  ) {
    console.log("Locations", this.locations);
    console.log("center",this.center);
    console.log("zoom",this.zoom);
    this.responsiveSrv.observable.pipe(takeUntil(this.$destroy)).subscribe(value => {
      this.responsive = value;
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.locations && changes.locations.currentValue) {
      if (this.locations && this.heatmapLayer) {
        await this.calculateCounts();
        const mapData = {
          max: 1,
          data: this.locations.filter( local => local.count > 0)
        };
        this.heatmapLayer.setData(mapData);
      }
    }
    console.log("Locations", this.locations);
    console.log("center",this.center);
    console.log("zoom",this.zoom);
  }

  async ngOnInit() {
    await this.loadHeatMap();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadHeatMap() {
    if (this.locations === undefined) {
      return;
    }
    await this.calculateCounts();
    const mapData = {
      max: 1,
      data: this.locations.filter( local => local.count > 0)
    };
    const mapLink =
      '<a href="http://openstreetmap.org">OpenStreetMap</a>';


    const baseLayer = L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 20,

    });

    const cfg = {
      radius: 30,
      minOpacity: 0.15,
      maxOpacity: 0.95,
      scaleRadius: false,
      useLocalExtrema: true,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count',
      blur: .95,
      gradient: {
        '.15': 'rgb(0, 116, 248)',
        '.3': 'rgb(120, 248, 0)',
        '.5': 'yellow',
        '.7': 'orange',
        '1': 'rgb(177, 1, 59)'
      },
    };
    this.heatmapLayer = new HeatmapOverlay(cfg);
    console.log("LAYER", this.heatmapLayer);
    const map = new L.Map('map', {
      center: new L.LatLng(this.center.lat, this.center.lng),
      boxZoom: true,
      zoom: this.zoom,
      layers: [baseLayer, this.heatmapLayer]
    });
    this.heatmapLayer.setData(mapData);
  }

  async calculateCounts() {
    const counts = this.locations.map( local => local.count);
    const maxCount = Math.max(...counts);
    if (maxCount > 0) {
      this.locations.forEach( local => local.count = (local.count / maxCount));
    }
  }

}
