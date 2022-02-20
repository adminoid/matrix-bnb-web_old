<template lang="pug">
.container
  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      button.mb-3(
        type="button"
        class="btn btn-warning"
        @click="prepareMetamask"
      ) Prepare Metamask
      .form-text Add bsc network (if not exist)
        br
        | and set that active
  .row
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      button(
        type="button"
        class="btn btn-secondary"
        @click="addBUSDToken"
      ) Add BUSD to Metamask
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      button(
        type="button"
        class="btn btn-secondary"
        @click="addUSDTToken"
      ) Add USDT to Metamask
  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='busd-amount') BUSD Amount
        .col-sm-8
          input#busd-amount.form-control(type='text' v-model="busdAmount")

      button(
        type="button"
        class="btn btn-warning"
        @click="depositBUSD"
      ) Deposit BUSD
  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='usdt-amount') USDT Amount
        .col-sm-8
          input#usdt-amount.form-control(type='text' v-model="usdtAmount")
      button(
        type="button"
        class="btn btn-warning"
        @click="depositUSDT"
      ) Deposit USDT
  .row(v-if="!!error")
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .alert.alert-danger(role="alert") {{ error }}
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    const busdAmount = ref(1)
    const usdtAmount = ref(1)

    onMounted(async () => {
      if (!$SC.Web3) {
        error.value = 'Установите metamask!'
      }

      // not working yet
      $SC.Ethereum.on('connect', () => {
        console.info('CoNneCteD')
      })
    })

    const prepareMetamask = async () =>
        (await $SC.prepareMetamask())
    const addBUSDToken = async () =>
        (await $SC.addBUSDToken())
    const addUSDTToken = async () =>
        (await $SC.addUSDTToken())
    const depositBUSD = async () =>
        (await $SC.depositBUSD(busdAmount.value))
    const depositUSDT = async () =>
        (await $SC.depositUSDT(usdtAmount.value))

    $on('error', (msg: string) => {
      error.value = msg
    })

    return {
      error,
      busdAmount,
      usdtAmount,
      prepareMetamask,
      addBUSDToken,
      addUSDTToken,
      depositBUSD,
      depositUSDT,
    }
  },
})
</script>

<style lang="sass" scoped>
.container
  padding: 1em
.row
  margin-bottom: 2em
.frame
  border: 2px solid lightgrey
  border-radius: 1em
  padding: 1em
</style>
