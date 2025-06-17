<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { Chart } from 'chart.js/auto';

interface ChartDataItem {
  type: string;
  count: number;
}

export default defineComponent({
  name: 'FileTypeChart',
  
  props: {
    data: {
      type: Array as () => ChartDataItem[],
      required: true
    }
  },

  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    const createChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      const labels = props.data.map(item => item.type);
      const values = props.data.map(item => item.count);

      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#4CAF50',
              '#2196F3',
              '#FFC107',
              '#E91E63',
              '#9C27B0',
              '#FF5722',
              '#795548',
              '#607D8B'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right' as const,
              labels: {
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            title: {
              display: false
            }
          }
        }
      });
    };

    const updateChart = () => {
      if (!chart?.data?.datasets?.[0]) return;

      const labels = props.data.map(item => item.type);
      const values = props.data.map(item => item.count);

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update();
    };

    watch(() => props.data, () => {
      if (chart) {
        updateChart();
      } else {
        createChart();
      }
    }, { deep: true });

    onMounted(() => {
      createChart();
    });

    return {
      chartCanvas
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}
</style> 