<template lang="pug">
.container

  .row.frame
    .mb-3.row
      .col.col-sm-6 Add bsc network (if not exist) and set that active

      .col.col-sm-6.mb-3(v-if="disabled.disabled")
        strong Awaiting {{ disabled.cause }}... &nbsp;
        .spinner-border.ms-auto.text-primary(role="status")

    .row(v-if="!!error")
      .alert.alert-danger {{ error }}

    .row
      button.mb-3(
        type="button"
        class="btn btn-outline-success"
        @click="prepareMetamask"
        :disabled="disabled.disabled"
      ) Prepare Metamask

  .row.frame
    .mb-3.row(v-if="registerWhoseAddr")
      .debug-panel {{ registerWhoseAddr }}
    .mb-3.row
      .col.col-sm-3.mb-3
        label.col-form-label(for='register-whose') Register whose
      .col-sm-9.mb-3
        .input-group
          input#register-whose.form-control.col-4(
            type='text'
            v-model="registerWhoseAddr"
            :disabled="disabled.disabled"
          )
    .row
      button(
        type="button"
        class="btn btn-outline-success"
        @click="registerWhose"
        :disabled="disabled.disabled"
      ) Register

  .row.frame
    .mb-3.row
      .col.col-sm-3.mb-3
        label.col-form-label(for='user-core') Get Core user
      .col-sm-9.mb-3
        .input-group
          input#user-core.form-control.col-4(
            type='text'
            v-model="userCoreAddress"
            :disabled="disabled.disabled"
          )
    .row
      button(
        type="button"
        class="btn btn-outline-warning"
        @click="getCoreUser"
        :disabled="disabled.disabled"
      ) Get Core user

  .row.frame
    .mb-3.row
      .col.col-sm-3.mb-3
        label.col-form-label(for='user-matrix') Get Matrix user
      .col-sm-9.mb-3
        .input-group
          input#user-matrix.form-control.col-4(
            type='text'
            v-model="userCoreAddress"
            :disabled="disabled.disabled"
          )
    .row
      button(
        type="button"
        class="btn btn-outline-warning"
        @click="getMatrixUser"
        :disabled="disabled.disabled"
      ) Get Matrix user

  .row.frame
    .mb-3.row
      .col.col-sm-3.mb-3
        label.col-form-label(for='send-bnb') Send BNB
      .col-sm-9.mb-3
        .input-group
          input#send-bnb.form-control.col-4(
            type='text'
            v-model="sendBnbAmount"
            :disabled="disabled.disabled"
          )
    .row
      button(
        type="button"
        class="btn btn-outline-danger"
        @click="sendBnb"
        :disabled="disabled.disabled"
      ) Send BNB
</template>

<script lang="ts">

const errorTimeout = 3000
export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    let disabled = ref({})
    const registerWhoseAddr = ref('')
    const sendBnbAmount = ref('')

    const userCoreAddress = ref('')
    const getCoreUser = async () => {
      console.log(typeof userCoreAddress.value, userCoreAddress.value)
      await $SC.getCoreUser(userCoreAddress.value)
    }

    const userMatrixAddress = ref('')
    const getMatrixUser = async () => {
      console.log(typeof userMatrixAddress.value, userMatrixAddress.value)
      await $SC.getMatrixUser(userMatrixAddress.value)
    }

    onMounted(async () => {
      if (!$SC.Web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), errorTimeout)
      }

      $SC.MSI.Eth.on("accountsChanged", async function() {
        // Time to reload your interface with accounts[0]!
        const accounts = await $SC.MSI.web3.eth.getAccounts();
        // accounts = await web3.eth.getAccounts();
        console.info("account has changed")
        console.log(accounts[0])
        console.log(accounts)
      });

      // $SC.MSI.Eth.on('accountsChanged', function (accounts) {
      //   // Time to reload your interface with accounts[0]!
      // })
    })

    const prepareMetamask = async () =>
        (await $SC.prepareMetamask())
    const registerWhose = async () =>
        (await $SC.registerWhose(registerWhoseAddr.value))
    const sendBnb = async () =>
        (await $SC.sendBnb(sendBnbAmount.value))

    $on('error', (msg: string) => {
      error.value = msg
      setTimeout(() => (error.value = ''), errorTimeout)
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
      userCoreAddress,
      getCoreUser,
      userMatrixAddress,
      getMatrixUser,
    }
  },
})
</script>

<style lang="sass" scoped>
.container
  padding: 1em
//.row
//  margin-bottom: 2em
.frame
  border: 2px solid lightgrey
  border-radius: 1em
  padding: 1em
  margin-top: 2em !important
.row
  margin: 0
.debug-panel
  font-size: 11px
  border: 1px dashed rgba(231, 66, 140, 0.51)
  border-radius: 2px
</style>
