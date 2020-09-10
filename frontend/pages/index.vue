<template lang="pug">
section.section
  .columns.is-mobile
    card(title='BTC/USD')
    card(title='ETH/USD')
    card(title='XRP/USD')
</template>
<script>
import Card from '~/components/Card'
export default {
  name: 'HomePage',
  components: {
    Card,
  },
}
</script>
