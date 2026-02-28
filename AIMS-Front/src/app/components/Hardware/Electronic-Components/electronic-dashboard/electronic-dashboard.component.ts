import { Component, ViewChild, OnInit } from '@angular/core';
import { ChartComponent, ApexNonAxisChartSeries, ApexResponsive, ApexChart, ApexFill, ApexDataLabels, ApexLegend } from "ng-apexcharts";
import { ApexAxisChartSeries, ApexPlotOptions, ApexYAxis, ApexStroke, ApexXAxis, ApexTooltip } from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

@Component({
  selector: 'app-electronic-dashboard',
  templateUrl: './electronic-dashboard.component.html',
  styleUrls: ['./electronic-dashboard.component.css']
})
export class ElectronicDashboardComponent {

  @ViewChild("chart") chart!: ChartComponent;
  @ViewChild("barChart") barChart!: ChartComponent;

  chartOptions!: ChartOptions;
  barChartOptions!: BarChartOptions;

  constructor() { }

  ngOnInit(): void {

    this.chartOptions = {
      series: [44, 55, 41],
      chart: {
        type: "donut",
        height: 350
      },
      labels: ["A", "B", "C"],
      fill: {
        type: "gradient"
      },
      dataLabels: {
        enabled: true
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

    this.barChartOptions = {
      series: [
        {
          name: "Net Profit",
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
        },
        {
          name: "Revenue",
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
        },
        {
          name: "Free Cash Flow",
          data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
        }
      ] as ApexAxisChartSeries,
      chart: {
        type: "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]
      },
      yaxis: {
        title: {
          text: "$ (thousands)"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val) => "$ " + val + " thousands"
        }
      },
      legend: {
        show: true
      }
    };

  }

}
