<template lang="pug">
.container

  .row.frame.frame_info(v-if="testAlerts.length > 0")
    .row
      .alert(
        v-for="(alert, index) in testAlerts"
        :class="'alert-'+alert.type+' d-flex'"
        role="alert"
      )
        svg(
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"
          viewBox="0 0 16 16"
          role="img"
          aria-label="Warning:"
        )
          path(
            :d="getPathByAlertType(alert.type)"
          )
        span {{ alert.message }}
        button(
          style="margin-left: auto"
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          @click="closeAlert(index)"
        )

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

import {reactive} from "#imports";

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
      // console.log(typeof userCoreAddress.value, userCoreAddress.value)
      await $SC.getCoreUser(userCoreAddress.value)
    }

    const userMatrixLevel = ref('')
    const userMatrixAddress = ref('')
    const getMatrixUser = async () => {
      // console.log(typeof userMatrixAddress.value, userMatrixAddress.value)
      // console.log(typeof userMatrixLevel.value, userMatrixLevel.value)
      await $SC.getMatrixUser(userMatrixLevel.value, userMatrixAddress.value)
    }

    const connectedWallet = ref('')

    onMounted(async () => {
      // console.info("onMounted:")
      // console.log($SC)

      await $SC.MSI.connectWallet()

      // console.info("WALLET:")
      // console.log($SC.MSI.wallet)
      connectedWallet.value = $SC.MSI.wallet

      if (!$SC.MSI.web3) {
        error.value = 'Установите metamask!'
        setTimeout(() => (error.value = ''), errorTimeout)
      }

      $SC.MSI.Eth.on("accountsChanged", async (accountsPassed) => {
        // console.info("...accountsChanged")
        // console.info(accountsPassed)
        // Time to reload your interface with accounts[0]!
        const accounts = await $SC.MSI.web3.eth.getAccounts();
        // accounts = await web3.eth.getAccounts();
        // console.info("account has changed")
        connectedWallet.value = accounts[0]
        // console.log(connectedWallet.value)
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
      // console.info('on disabled', payload)
      disabled.value = payload
    })

    const getPathByAlertType = (type) => {
      switch (type) {
        case 'success':
          return "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
        case 'primary':
          return "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
        case 'warning':
          return "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
        case 'danger':
          return "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
      }
    }

    const testAlerts = reactive(
        [
          {
            type: "success",
            message: "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=80 node .output/server/index.mjs",
          },
          {
            type: "primary",
            message: "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=80 node .output/server/index.mjs",
          },
          {
            type: "warning",
            message: "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=80 node .output/server/index.mjs",
          },
          {
            type: "danger",
            message: "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=80 node .output/server/index.mjs",
          },
        ]
    )

    const closeAlert = (index) => {
      testAlerts.splice(index, 1);
    }

    return {
      testAlerts,
      getPathByAlertType,
      closeAlert,
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
.frame
  border: 2px solid lightgrey
  border-radius: 1em
  padding: 1em
  margin-top: 2em !important
  &_info
    border-color: #0a53be
    padding-bottom: 0
.row
  margin: 0
.debug-panel
  font-size: 11px
  border: 1px dashed rgba(231, 66, 140, 0.51)
  border-radius: 2px
.end-space
  height: 800px
</style>
