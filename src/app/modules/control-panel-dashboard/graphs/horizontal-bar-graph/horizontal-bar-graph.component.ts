import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges, input } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { IHorizontalBarChartItem } from '@app/shared/interface/IControlPanelDashboardData';
import { ResponsiveService } from '@app/shared/services/responsive.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-horizontal-bar-graph',
  templateUrl: './horizontal-bar-graph.component.html',
  styleUrls: ['./horizontal-bar-graph.component.scss']
})
export class HorizontalBarGraphComponent implements OnInit, OnDestroy, OnChanges {

  @Input() chartData: IHorizontalBarChartItem[];
  @Input() typeBar: 'region' | 'strategic';

  height: number;
  labels: string[];
  data;
  config: any;
  color = 'rgb(245, 134, 52)';
  plugins;
  responsive: boolean;
  $destroy = new Subject();
  align: string;
  anchor: string;
  labelColor: string;

  @Output() graphRegionClicked = new EventEmitter();
  @Output() graphStrategicClicked = new EventEmitter();
  @Output() graphClicked = new EventEmitter();

  @ViewChild('graphBar', { static: true }) graphBar: UIChart;

  constructor(
    private responsiveSrv: ResponsiveService,
  ) {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.chartData && changes.chartData.currentValue) {
      this.data = undefined;
      this.config = undefined;
      this.plugins = undefined;
      this.height = undefined;
      await this.loadData();
      await this.loadConfig();
      await this.loadPlugins();
    }
  }

  async ngOnInit() {
    this.responsiveSrv.observable.pipe(takeUntil(this.$destroy)).subscribe(async (value) => {
      this.responsive = value;
      this.align = this.responsive ? 'end' : 'end';
      this.anchor = this.responsive ? 'center' : 'end';
      this.labelColor = this.responsive ? '#000000' : '#797979';
      this.data = undefined;
      this.config = undefined;
      this.plugins = undefined;
      this.height = undefined;
      await this.loadData();
      await this.loadConfig();
      await this.loadPlugins();
    });
    Chart.defaults.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0)';
    Chart.register(ChartDataLabels);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadConfig() {
    const data = this.chartData.map(item => item.quantity);
    const maxData = Math.max(...data);
    this.config = {
      maintainAspectRatio: false,
      events: ['click'],
      indexAxis: 'y',
      onClick: (e, item) => this.registerEvent(item),
      plugins: {
        legend: false,
        datalabels: {
          align: this.align,
          anchor: this.anchor,
          clamp: 'true',
          barThickness: 'flex',
          color: this.labelColor,
          display(context) {
            return context.dataset.data[context.dataIndex] > 0;
          },
          font: {
            size: 10
          },
          formatter: Math.round
        }
      },
      title: {
        display: false,
      },
      tooltips: {
        enabled: false
      },
      scales: {
        x: {
          offset: true,
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            beginAtZero: true,
            display: false,
            max: maxData * 1.15,
          }
        },
        y:{
          gridLines: {
            display: false
          },
          ticks: {
            callback: (label) => {
              label = this.chartData[label].description
              const maxValue = this.responsive ? 15 : 20;
              if (/\s/.test(label) && label.length > maxValue) {
                return label.substring(0, maxValue) + '...';
              } else {
                return label;
              }
            },
            fontSize: this.responsive ? 10 : 10,
          },
          offset: true
        },
      },
      datasets: {
        bar: {
          barThickness: 15
        }
      }
    };
    this.height = Math.max(100, (data.length * 500));
  }

  get chartHeight() {
    const barCount = this.chartData.length || 1;
    const heightPerBar = 25;
    return `${barCount * heightPerBar}px`;
  }

  realoadConfig() {
    this.loadConfig();
    return this.config;
  }

  async loadData() {
    this.labels = this.chartData.map(item => item.description.toUpperCase());
    this.data = {
      labels: this.labels,
      datasets: [
        {
          data: this.chartData.map(item => item.quantity),
          onClick: (e, item) => this.graphClicked.next(item),
          datalabels: {
            align: this.align,
            anchor: this.anchor,
            clamp: 'true',
            barThickness: 'flex',
            color: this.labelColor,
            display(context) {
              return context.dataset.data[context.dataIndex] > 0;
            },
            font: {
              size: this.responsive ? 12 : 12
            },
            formatter: Math.round,
          },
        }
    ],
    };
  }

  async loadPlugins() {
    const gradientLenght = this.responsive ? 200 : 400;
    Chart.defaults.plugins.tooltip.enabled = false;
    this.plugins = [{
      beforeDatasetDraw: (chart) => {
        const chartInstance = chart;
        const ctx = chartInstance.ctx;
        const chartArea = chartInstance.chartArea;
        const data = chart.config.data;
        const gradient = ctx.createLinearGradient(0, 0, gradientLenght, 0);
        gradient.addColorStop(0, 'rgb(219, 75, 31)');
        gradient.addColorStop(1, 'rgb(245, 134, 52)');
        data.datasets.forEach((dataset, i) => {
          const meta = chartInstance.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            bar.options.backgroundColor = gradient;
            bar.options.borderColor = gradient;
          });
        });
      }
    }];
  }

  registerEvent(item){
    switch (this.typeBar) {
      case 'region':
        this.graphRegionClicked.next(item);
        break;
      case 'strategic':
        this.graphStrategicClicked.next(item);
        break;
      default:
        this.graphClicked.next(item);
        break;
    }
  }

}
