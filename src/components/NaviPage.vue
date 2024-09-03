<template>
  <el-container id="navi">
    <el-aside width="240px" class="sidebar">
      <h2 class="site-title" style="text-align: center;">Pandora Helper</h2>
      <el-menu default-active="accountNav" class="el-menu-vertical-demo" background-color="#ffffff" text-color="#333"
        active-text-color="#fff">
        <el-menu-item index="accountNav">
          <span>账号管理</span>
        </el-menu-item>
        <el-menu-item index="shareNav">
          <span>分享管理</span>
        </el-menu-item>
        <el-menu-item index="redemptionNav">
          <span>兑换码</span>
        </el-menu-item>
        <el-menu-item index="carNav">
          <span>停车场</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main class="main-content">
      <el-dropdown class="user-menu" trigger="click">
        <span class="el-dropdown-link">
          <el-avatar :size="44" src="/linuxdo.webp" class="user-avatar"></el-avatar>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="openActivateRedemptionModal">兑换码激活</el-dropdown-item>
          <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 主要内容区域 -->
      <!-- <router-view></router-view> -->
      <component :is="currentComponent"></component>

    </el-main>
  </el-container>
</template>

<script>

import AccountPageVue from './AccountPage.vue';
export default {
  name: 'NaviPage',
  data(){
    return {
      activeMenu: 'accountNav',
      currentComponent: AccountPageVue
    };
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
      switch (index) {
        case 'accountNav':
          this.currentComponent = AccountPageVue;
          break;
        case 'shareNav':
          this.currentComponent = AccountPageVue;
          break;
        case 'redemptionNav':
          this.currentComponent = AccountPageVue;
          break;
        case 'carNav':
          this.currentComponent = AccountPageVue;
          break;
        default:
          this.currentComponent = AccountPageVue;
      }
    },
    openActivateRedemptionModal() {
      // 实现兑换码激活逻辑
    },
    logout() {
      // 实现登出逻辑
      this.$router.replace({ name: 'home' });
      localStorage.removeItem('token')
      localStorage.removeItem('img')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');


#navi {
  height: 100vh;
  font-family: 'Roboto', Arial, sans-serif;
}

.sidebar {
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 24px 16px;
}

.site-title {
  color: #0e8f6f;
  margin-bottom: 28px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  font-size: 16px;
  font-weight: 500;
  height: 56px;
  line-height: 56px;
  margin-bottom: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.el-menu-item:hover,
.el-menu-item.is-active {
  background-color: #0e8f6f !important;
  color: #fff !important;
}

.main-content {
  background-color: #f5f5f5;
  position: relative;
  padding: 0%;

}

.user-menu {
  position: fixed;
  bottom: 24px;
  left: 24px;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.el-dropdown-menu__item {
  font-size: 14px;
  font-weight: 400;
  padding: 10px 20px;
}

/* 全局样式优化 */
body {
  margin: 0;
  padding: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

* {
  box-sizing: border-box;
}
</style>