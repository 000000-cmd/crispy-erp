import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// Registrar los componentes que vamos a usar
echarts.use([GridComponent, BarChart,  CanvasRenderer, UniversalTransition]);
type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;
@Component({
  selector: 'chart-bar',
  template: `<div #chartContainer style="width: 100%; height: 400px;"></div>`,
})
export class ChartBarComponent implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

    ngAfterViewInit(): void {
        const chartDom = this.chartContainer.nativeElement;
        const myChart = echarts.init(chartDom);

        const option: EChartsOption = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'bar'
            }
        ]
        };

        myChart.setOption(option);

        // Para que se ajuste si se redimensiona la ventana
        window.addEventListener('resize', () => myChart.resize());
    }
}
