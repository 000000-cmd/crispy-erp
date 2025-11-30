import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// Registrar los componentes que vamos a usar
echarts.use([GridComponent, BarChart, CanvasRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

@Component({
  selector: 'chart-bar',
  template: `<div #chartContainer style="width: 100%; height: 400px;"></div>`,
})
export class ChartBarComponent implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  private myChart!: echarts.ECharts;
  private option!: EChartsOption;

  ngAfterViewInit(): void {
    this.computeOption();
    this.buildChart();

    window.addEventListener('resize', () => this.myChart?.resize());

    // 🔥 Detecta cambios en la clase "dark"
    const observer = new MutationObserver(() => {
      this.computeOption();
      this.buildChart();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }


  /** 🔥 Calcula colores según modo claro/oscuro */
  private computeOption() {
    const isDark = document.documentElement.classList.contains('dark');

    const guideLineColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

    this.option = {
      backgroundColor: 'transparent',

      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        splitLine: {
          show: true,
          lineStyle: { color: guideLineColor }
        },
        axisLabel: { color: isDark ? '#fff' : '#000' }
      },

      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: { color: guideLineColor }
        },
        axisLabel: { color: isDark ? '#fff' : '#000' }
      },

      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'bar',
          itemStyle: {
            color: isDark ? '#3b82f6' : '#2563eb'   // puedes cambiar si quieres
          }
        }
      ]
    };
  }


  /** 🔥 Reconstruye completamente el gráfico */
  private buildChart() {
    const chartDom = this.chartContainer.nativeElement;

    if (this.myChart) {
      this.myChart.dispose();
    }

    const isDark = document.documentElement.classList.contains('dark');

    this.myChart = echarts.init(chartDom, isDark ? 'dark' : undefined);
    this.myChart.setOption(this.option);
  }
}