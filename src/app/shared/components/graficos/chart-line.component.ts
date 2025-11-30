import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<GridComponentOption | LineSeriesOption>;

@Component({
  selector: 'chart-line',
  template: `<div #chartContainer  style="width: 100%; height: 400px;"></div>`,
})

export class ChartLineComponent implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  private myChart!: echarts.ECharts;
  private option!: EChartsOption;
    
  ngAfterViewInit(): void {
    const isDark = document.documentElement.classList.contains('dark');

    const guideLineColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
    
    this.option = {
    backgroundColor: 'transparent',
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        splitLine: {
            show: true,
            lineStyle: {
                color: guideLineColor
            }
        },
        axisLabel: {
        color: isDark ? '#fff' : '#000'
        }
        
      },
    yAxis: {
        type: 'value',
        splitLine: {
            show: true,
            lineStyle: {
                color: guideLineColor
            }
        },
        axisLabel: {
        color: isDark ? '#fff' : '#000'
        }
    },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true
        }
      ]
    };

    this.buildChart();

    window.addEventListener('resize', () => this.myChart?.resize());

    // Observa cuando cambie la clase 'dark' en el html
    const observer = new MutationObserver(() => {
      this.buildChart();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private buildChart() {
    const chartDom = this.chartContainer.nativeElement;

    if (this.myChart) {
      this.myChart.dispose();
    }

    // 🔥 Detecta dark mode según Tailwind (html.dark)
    const isDark = document.documentElement.classList.contains('dark');

    this.myChart = echarts.init(chartDom, isDark ? 'dark' : undefined);

    this.myChart.setOption(this.option);
  }
}
