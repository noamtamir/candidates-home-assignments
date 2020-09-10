<template>
  <div class="column">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title has-text-grey">{{ title }}</p>
      </header>
      <div class="card-content">
        <div class="content has-text-centered">
          <client-only placeholder="Loading...">
            <highchart :options="chartOptions" />
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      chartOptions: {
        title: {
          text: undefined,
        },
        yAxis: {
          title: {
            text: 'USD',
          },
        },

        xAxis: {
          type: 'datetime',
          title: {
            text: 'Date',
          },
        },

        legend: {
          enabled: false,
        },

        series: [
          {
            name: this.title,
            data: [],
          },
        ],
        credits: {
          enabled: false,
        },
      },
    }
  },
  async created() {
    const now = Date.now()
    const [fsym, tsym] = this.$props.title.split('/')
    const response = await this.$axios.$get(
      `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${fsym}&tsym=${tsym}&toTs=${now}&limit=30`
    )
    this.chartOptions.series[0].data = response.Data.Data.map((x) => {
      return [x.time * 1000, x.close]
    })
  },
}
</script>
