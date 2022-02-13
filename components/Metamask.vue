<template lang="pug">
pre {{ reactiveVar }}
</template>

<script lang="ts">
import useMetamask from "~/composables/useMetamask"

export default defineComponent({
  setup() {
    const { connectWallet, reactiveVar } = useMetamask()
    connectWallet()

    setTimeout(() => {
      reactiveVar.value = 'after all'
    }, 10000)

    return {
      reactiveVar,
    }
  },
})
</script>
