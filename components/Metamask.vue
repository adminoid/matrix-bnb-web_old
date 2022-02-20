<template lang="pug">
.container
  .row(v-if="disabled.disabled")
    .col
      .d-flex.align-items-center
        strong Awaiting {{ disabled.cause }}...
        .spinner-border.ms-auto.text-primary(role="status")

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      button.mb-3(
        type="button"
        class="btn btn-warning"
        @click="prepareMetamask"
        :disabled="disabled.disabled"
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
        :disabled="disabled.disabled"
      ) Add BUSD to Metamask
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      button(
        type="button"
        class="btn btn-secondary"
        @click="addUSDTToken"
        :disabled="disabled.disabled"
      ) Add USDT to Metamask

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='busd-amount') BUSD Amount
        .col-sm-8
          input#busd-amount.form-control(
            type='text'
            v-model="busdAmount"
            :disabled="disabled.disabled"
          )

      button(
        type="button"
        class="btn btn-warning"
        @click="depositBUSD"
        :disabled="disabled.disabled"
      ) Deposit BUSD

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='usdt-amount') USDT Amount
        .col-sm-8
          input#usdt-amount.form-control(
            type='text'
            v-model="usdtAmount"
            :disabled="disabled.disabled"
          )
      button(
        type="button"
        class="btn btn-warning"
        @click="depositUSDT"
        :disabled="disabled.disabled"
      ) Deposit USDT

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='withdraw-amount') Withdraw amount
        .col-sm-7
          .input-group
            input#withdraw-amount.form-control.col-4(
              type='text'
              v-model="withdrawAmount"
              :disabled="disabled.disabled"
            )
            select#select-currency.form-select.col-2(v-model="currency")
              option(value="BUSD") BUSD
              option(value='USDT') USDT
      button(
        type="button"
        class="btn btn-warning"
        @click="withdraw"
        :disabled="disabled.disabled"
      ) Withdraw
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    const busdAmount = ref(0.1)
    const usdtAmount = ref(0.1)
    let disabled = ref({})
    const currency = ref('USDT')
    const withdrawAmount = ref(0.1)

    onMounted(async () => {
      if (!$SC.Web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), 5000)
      }

      // not working yet
      // $SC.Ethereum.on('connect', () => {
      //   console.info('CoNneCteD')
      // })
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
    const withdraw = async () =>
        ($SC.withdraw(withdrawAmount.value, currency.value))

    $on('error', (msg: string) => {
      error.value = msg
      setTimeout(() => (error.value = ''), 5000)
    })

    $on('disabled', (payload: { cause: string, disabled: boolean }) => {
      console.info('on disabled', payload)
      disabled.value = payload
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
      disabled,
      withdrawAmount,
      withdraw,
      currency,
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
#select-currency
  width: 43px
</style>
