<template lang="pug">
button(
  type="button"
  class="btn btn-warning"
  @click="checkMetamask"
) Check Metamask
</template>

<script lang="ts">
import { useMetamask } from "~/composables/useMetamask"

export default defineComponent({
  setup() {
    const { checkMetamask } = useMetamask()
    const { $on } = useNuxtApp()

    $on('error', error => {
      console.info(error)
    })

    return {
      checkMetamask,
    }
  },
})
</script>
