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

    .mb-3.row(v-if="connectedWallet")
      .debug-panel Connected wallet: {{ connectedWallet }}

    .row
      .col
        button.mb-3.w-100(
          type="button"
          class="btn btn-outline-success"
          @click="prepareMetamask"
          :disabled="disabled.disabled"
        ) Prepare Metamask
      .col
        button.mb-3.w-100(
          type="button"
          class="btn btn-outline-success"
          @click="reconnectWallet"
          :disabled="disabled.disabled"
        ) Reconnect wallet

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
    .row
      .col.col-sm-3.mb-3
        label.col-form-label(for='user-matrix') User
      .col-sm-9.mb-3
        .input-group
          input#user-matrix.form-control.col-4(
            type='text'
            v-model="userMatrixAddress"
            :disabled="disabled.disabled"
          )
    .mb-3.row
      .col.col-sm-3.mb-3
        label.col-form-label(for='matrix-level') Matrix level
      .col-sm-9.mb-3
        .input-group
          input#matrix-level.form-control.col-4(
            type='text'
            v-model="userMatrixLevel"
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

.end-space

</template>

<script lang="ts">

const errorTimeout = 5000
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

    const userMatrixLevel = ref('')
    const userMatrixAddress = ref('')
    const getMatrixUser = async () => {
      console.log(typeof userMatrixAddress.value, userMatrixAddress.value)
      console.log(typeof userMatrixLevel.value, userMatrixLevel.value)
      await $SC.getMatrixUser(userMatrixLevel.value, userMatrixAddress.value)
    }

    const connectedWallet = ref('')

    onMounted(async () => {
      console.info("onMounted:")
      console.log($SC)

      await $SC.MSI.connectWallet()

      console.info("WALLET:")
      console.log($SC.MSI.wallet)
      connectedWallet.value = $SC.MSI.wallet

      if (!$SC.MSI.web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), errorTimeout)
      }

      $SC.MSI.Eth.on("accountsChanged", async (accountsPassed) => {
        console.info("...accountsChanged")
        console.info(accountsPassed)
        // Time to reload your interface with accounts[0]!
        const accounts = await $SC.MSI.web3.eth.getAccounts();
        // accounts = await web3.eth.getAccounts();
        console.info("account has changed")
        connectedWallet.value = accounts[0]
        console.log(connectedWallet.value)
      })
    })

    const prepareMetamask = async () =>
        (await $SC.prepareMetamask())

    const reconnectWallet = async () =>
        (await $SC.MSI.reconnectWallet())

    // const reconnectWallet = async () => {
    //   console.info("reconnectWallet()")
    //   await $SC.MSI.reconnectWallet()
    // }

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
      connectedWallet,
      reconnectWallet,
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
      userMatrixLevel,
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
.end-space
  height: 800px
</style>
