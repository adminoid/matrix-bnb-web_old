<script setup>
import Metamask from '../components/Metamask'
const counter = useCookie('counter')
counter.value = counter.value || Math.round(Math.random() * 1000)
</script>

<template lang="pug">
.container
  .row
    .col
      metamask
    .col
      h1 Counter: {{ counter || '-' }}
      .btn-group(role="group" aria-label="Basic mixed styles example")
        button(type="button" class="btn btn-danger" @click="counter = null") Reset
        button(type="button" class="btn btn-warning" @click="counter--") -
        button(type="button" class="btn btn-success" @click="counter++") +
    .col
</template>
