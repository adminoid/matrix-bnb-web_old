<template lang="pug">
.container
  .row
    .col
      button(
        type="button"
        class="btn btn-warning"
        @click="prepareMetamask"
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
    const { isOk, prepareMetamask } = useMetamask()
    const { $on } = useNuxtApp()
    const error = ref('')

    $on('error', (msg: string) => {
      error.value = msg
    })

    return {
      isOk,
      error,
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
