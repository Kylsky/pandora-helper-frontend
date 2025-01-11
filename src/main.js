import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import config, { loadConfig } from './configs/config';
import './assets/main.css'

Vue.use(ElementUI)

Vue.config.productionTip = false;

// 创建一个简单的插件来提供全局配置
const ConfigPlugin = {
  install(Vue) {
    Vue.prototype.$config = config;
  }
};

Vue.use(ConfigPlugin);

async function initApp() {
  await loadConfig();
  
  new Vue({
    render: h => h(App),
    router
  }).$mount('#app');
}

initApp();
