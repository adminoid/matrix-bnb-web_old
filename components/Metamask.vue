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
      button(
        type="button"
        class="btn btn-warning"
        @click="runContract"
      ) Deposit 1 BUSD
  .row(v-if="!!error")
    .col
      .alert.alert-danger(role="alert") {{ error }}
  .row
    .col
      pre {{ isOk }}
</template>

<script lang="ts">

export default defineComponent({
  setup() {
    const { $on, $SC } = useNuxtApp()
    const error = ref('')
    const isOk = ref(false)

    onMounted(async () => {
      isOk.value = false
      if ($SC.Web3) {
        isOk.value = true
      } else {
        error.value = 'Установите metamask!'
      }
    })

    const runContract = () => {
      const config = useRuntimeConfig()
      const Contract = $SC.getContract(config)
      console.log(Contract)
      $SC.depositBUSD()
    }

    const prepareMetamask = async () => {
      await $SC.prepareMetamask()
    }

    $on('error', (msg: string) => {
      error.value = msg
    })

    return {
      isOk,
      error,
      runContract,
      prepareMetamask,
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
