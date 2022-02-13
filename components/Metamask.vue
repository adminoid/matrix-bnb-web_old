<template lang="pug">
pre {{ bc }}
</template>

<script lang="ts">
import { defineComponent } from "#imports"
import { useBlockchain, makeBlockchainProps } from "~/composables/useBlockchain"

export default defineComponent({
  props: {
    ...makeBlockchainProps(),
  },
  setup(props) {
    // Get color & size classes from composition definitions
    const bc = useBlockchain(props);

    console.info('setup()')
    console.log(bc)

    return {
      bc,
    }
  },
})
</script>
