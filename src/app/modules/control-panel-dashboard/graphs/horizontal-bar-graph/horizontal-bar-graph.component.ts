import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
    Chart.plugins.register(ChartDataLabels);
    this.loadData();
    this.loadPlugins();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadConfig() {
    const data = this.chartData.map(item => item.quantity);
    const maxData = Math.max(...data);
    this.config = {
      onClick: (e, item) => this.graphClicked.next(item),
      plugins: {
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
            size: this.responsive ? 10 : 10
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
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
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
        }],
        yAxes: [{
          // barPercentage: 1,
          // categoryPercentage: 0.7,
          gridLines: {
            display: false
          },
          ticks: {
            callback: (label) => {
              const maxValue = this.responsive ? 15 : 20;
              if (/\s/.test(label) && label.length > maxValue) {
                const labelText = label.split(' ');
                if (labelText.length === 2) {
                  return labelText;
                } else if (labelText.length >= 2 && labelText.length <= 4) {
                  const middle = (labelText.length / 2).toFixed(0);
                  const labelTextPart1 = labelText.slice(0, Number(middle));
                  const labelTextPart2 = labelText.filter(item => !labelTextPart1.includes(item));
                  return [labelTextPart1.join(' '), labelTextPart2.join(' ')];
                } else if (labelText.length > 4) {
                  const middle = (labelText.length / 3).toFixed(0);
                  const labelTextPart1 = labelText.slice(0, (Number(middle)));
                  const labelTextPart2 = labelText.slice(Number(middle), Number(middle) * 2);
                  const labelTextPart3 = labelText.filter(item => !labelTextPart1.includes(item) && !labelTextPart2.includes(item));
                  return [labelTextPart1.join(' '), labelTextPart2.join(' '), labelTextPart3.join(' ')];
                }
              } else {
                return label;
              }
            },
            fontSize: this.responsive ? 10 : 10,
          },
          offset: true
        }],
      },
    };
    this.height = (data.length * 60) < 100 ? 100 : (data.length * 60);
  }

  realoadConfig() {
    this.loadConfig();
    return this.config;
  }

  async loadData() {
    this.labels = this.chartData.map(item => item.description.toUpperCase());
    this.data = {
      labels: this.labels,
      datasets: [{
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
      }],
    };
    // this.height = this.data.labels.length * 60;
  }

  async loadPlugins() {
    const gradientLenght = this.responsive ? 200 : 400;
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
          const meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            if (!bar._model) { return; }
            const valor = +dataset.data[index];
            bar._view.backgroundColor = gradient;
          });
        });
      }
    }];
  }

}
