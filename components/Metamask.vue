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

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='register-whose') Register whose
        pre {{ registerWhoseAddr }}
        .col-sm-7
          .input-group
            input#register-whose.form-control.col-4(
              type='text'
              v-model="registerWhoseAddr"
              :disabled="disabled.disabled"
            )
      button(
        type="button"
        class="btn btn-warning"
        @click="registerWhose"
        :disabled="disabled.disabled"
      ) Register

  .row.frame
    .col(
      class="d-flex flex-column"
      +" justify-content-center align-items-center"
    )
      .mb-3.row
        label.col-sm-4.col-form-label(for='send-bnb') Send BNB
        .col-sm-7
          .input-group
            input#send-bnb.form-control.col-4(
              type='text'
              v-model="sendBnbAmount"
              :disabled="disabled.disabled"
            )
      button(
        type="button"
        class="btn btn-warning"
        @click="sendBnb"
        :disabled="disabled.disabled"
      ) Send BNB
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    let disabled = ref({})
    const registerWhoseAddr = ref('')
    const sendBnbAmount = ref('')

    onMounted(async () => {
      if (!$SC.Web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), 10000)
      }
    })

    const prepareMetamask = async () =>
        (await $SC.prepareMetamask())
    const registerWhose = async () =>
        (await $SC.registerWhose(registerWhoseAddr.value))
    const sendBnb = async () =>
        (await $SC.sendBnb(sendBnbAmount.value))

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
      disabled,
      registerWhoseAddr,
      registerWhose,
      sendBnbAmount,
      sendBnb,
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
