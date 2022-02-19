<template lang="pug">
.container
  .row
    .col
      button(
        type="button"
        class="btn btn-warning"
        @click="prepareMetamask"
      ) Prepare Metamask
  .row
    .col
      .mb-3
        label.form-label(for='busd-amount') BUSD Amount
        input#busd-amount.form-control(type='text' v-model="busdAmount")
      button(
        type="button"
        class="btn btn-warning"
        @click="depositBUSD"
      ) Deposit BUSD
  .row(v-if="!!error")
    .col
      .alert.alert-danger(role="alert") {{ error }}
  .row
    .col
      pre {{ isOk }}
      pre {{ accounts }}
</template>

<script lang="ts">

export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    const isOk = ref(false)
    const busdAmount = ref(1)
    // const usdtAmount = ref(0)

    onMounted(async () => {
      isOk.value = false
      if ($SC.Web3) {
        isOk.value = true
      } else {
        error.value = 'Установите metamask!'
      }

      // not working yet
      $SC.Ethereum.on('connect', () => {
        console.info('CoNneCteD')
      })
    })

    const depositBUSD = async () => {
      console.info('1. depositBUSD')
      // const resp = await $SC.depositBUSD(busdAmount.value)
      // console.log(resp)
      await $SC.depositBUSD(busdAmount.value)
    }

    let accounts = ref()
    const prepareMetamask = async () => {
      accounts.value = await $SC.prepareMetamask()
    }

    $on('error', (msg: string) => {
      error.value = msg
    })

    return {
      isOk,
      error,
      depositBUSD,
      prepareMetamask,
      accounts,
      busdAmount,
    }
  },
})
</script>

<style lang="sass">
.container
  padding: 1em
.row
  margin-bottom: 2em
</style>
