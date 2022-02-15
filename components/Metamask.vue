<template lang="pug">
.container
  .row
    .col
      button(
        type="button"
        class="btn btn-warning"
        @click="prepare"
      ) Check Metamask
  .row(v-if="!!error")
    .col
      .alert.alert-danger(role="alert") {{ error }}
  .row
    .col
      pre {{ isOk }}
</template>

<script lang="ts">
import { useMetamask } from "~/composables/useMetamask"

export default defineComponent({
  emits: ['error'],

  setup() {
    const { isOk, checkMetamask, setBSCNetwork } = useMetamask()
    const { $on } = useNuxtApp()
    const error = ref('')

    $on('error', (msg: string) => {
      error.value = msg
    })

    const prepare = async () => {
      await setBSCNetwork()
    }

    return {
      isOk,
      error,
      prepare,
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
