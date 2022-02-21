<template lang="pug">
.container
  .row(v-if="disabled.disabled")
    .col
      .d-flex.align-items-center
        strong Awaiting {{ disabled.cause }}...
        .spinner-border.ms-auto.text-primary(role="status")

  .row(v-if="!!error")
    .col
      .alert.alert-danger {{ error }}

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
        label.col-sm-4.col-form-label(for='deposit-amount') Deposit amount
        .col-sm-7
          .input-group
            input#deposit-amount.form-control.col-4(
              type='text'
              v-model="depositAmount"
              :disabled="disabled.disabled"
            )
            select#select-currency.form-select.col-2(v-model="depositCurrency")
              option(value="BUSD") BUSD
              option(value='USDT') USDT
      button(
        type="button"
        class="btn btn-warning"
        @click="deposit"
        :disabled="disabled.disabled"
      ) Deposit

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
            select#select-currency.form-select.col-2(v-model="withdrawCurrency")
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
    let disabled = ref({})
    const depositCurrency = ref('BUSD')
    const depositAmount = ref(0.1)
    const withdrawCurrency = ref('USDT')
    const withdrawAmount = ref(0.1)

    onMounted(async () => {
      if (!$SC.Web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), 10000)
      }
    })

    const prepareMetamask = async () =>
        (await $SC.prepareMetamask())
    const addBUSDToken = async () =>
        (await $SC.addBUSDToken())
    const addUSDTToken = async () =>
        (await $SC.addUSDTToken())
    const deposit = async () =>
        (await $SC.deposit(depositAmount.value, depositCurrency.value))
    const withdraw = async () =>
        (await $SC.withdraw(withdrawAmount.value, withdrawCurrency.value))

    $on('error', (msg: string) => {
      error.value = msg
      setTimeout(() => (error.value = ''), 10000)
    })

    $on('disabled', (payload: { cause: string, disabled: boolean }) => {
      console.info('on disabled', payload)
      disabled.value = payload
    })

    return {
      error,
      prepareMetamask,
      addBUSDToken,
      addUSDTToken,
      disabled,
      withdrawAmount,
      withdrawCurrency,
      depositAmount,
      depositCurrency,
      deposit,
      withdraw,
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
