<template>
  <div id="app">
    <!--<mainHeader/>-->
    <foodFinder/>
  </div>
</template>

<script>
import foodFinder from './components/foodFinder.vue'

export default {
  name: 'App',
  components: {
    foodFinder,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
