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
/* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap'); */

body {
  margin: 0; /* 去除默认的外边距 */
  padding: 0; /* 去除默认的内边距，防止有内边距 */
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
}

fill-current {
  outline-color: hsl(var(--accent-main-100))
}

.custom-message {
  z-index: 9999 !important;
}
</style>
