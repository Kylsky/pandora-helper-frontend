<template>
  <div id="app">
    <router-view></router-view>
    <!-- <IndexPage/> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

// import IndexPage from './components/IndexPage.vue'

export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0; /* 去除默认的外边距 */
  padding: 0; /* 去除默认的内边距，防止有内边距 */
  height: 100%;
}

fill-current {
  outline-color: hsl(var(--accent-main-100))
}
</style>
