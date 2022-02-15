<script setup>
import Metamask from '../components/Metamask'
// const counter = useCookie('counter')
// counter.value = counter.value || Math.round(Math.random() * 1000)

const pErr = (e) => {
  console.log(e)
}
</script>

<template lang="pug">
.container
  .row
    .col
    .col
      .btn-group(role="group" aria-label="Basic mixed styles example")
        metamask(@error="pErr($event)")
    .col
</template>
