<template>
  <el-container id="navi">
    <!-- 遮罩层 -->
    <div v-if="isMobile && !isCollapse" class="mobile-overlay" @click="toggleCollapse">
    </div>

    <!-- 侧边栏 -->
    <!-- 侧边栏 -->
    <el-aside :width="getSidebarWidth" :class="['sidebar', { 'mobile-sidebar': isMobile, 'collapsed': isCollapse }]">
      <div class="sidebar-header">
        <h2 class="site-title" v-show="!isCollapse">Pandora Helper</h2>
        <el-button v-if="!isMobile" class="collapse-btn" :icon="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="toggleCollapse">
        </el-button>
      </div>
      <el-menu @select="handleMenuSelect" default-active="accountNav" class="el-menu-vertical-demo"
        background-color="#ffffff" text-color="#333" active-text-color="#fff" :collapse="isCollapse"
        :collapse-transition="false">
        <!-- 菜单项保持不变 -->
        <el-menu-item index="accountNav">
          <i class="el-icon-s-custom"></i>
          <span slot="title">账号管理</span>
        </el-menu-item>
        <el-menu-item index="shareNav">
          <i class="el-icon-share"></i>
          <span slot="title">分享管理</span>
        </el-menu-item>
        <el-menu-item index="redemptionNav">
          <i class="el-icon-shopping-cart-full"></i>
          <span slot="title">兑换码</span>
        </el-menu-item>
        <el-menu-item index="carNav">
          <i class="el-icon-truck"></i>
          <span slot="title">停车场</span>
        </el-menu-item>
        <el-menu-item index="freeNav">
          <i class="el-icon-medal"></i>
          <span slot="title">免费号池</span>
        </el-menu-item>
      </el-menu>
      <!-- 头像放回左下角 -->
      <el-dropdown class="user-menu" trigger="click" popper-class="user-dropdown">
        <span class="el-dropdown-link">
          <el-avatar :size="40" :src="avatar" class="user-avatar"></el-avatar>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="showModal">
            <i class="el-icon-key"></i>
            <span>兑换码激活</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <i class="el-icon-switch-button"></i>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-aside>


    <el-main :class="['main-content', { 'mobile-main': isMobile }]">
      <!-- 点击提示条，只在移动端显示 -->
      <div v-if="isMobile && isCollapse" class="menu-trigger" @click="toggleCollapse">
        <i class="el-icon-s-operation"></i>
      </div>

      <!-- 主要内容 -->
      <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
        <form-input v-for="(field, index) in formFields" :key="index" :field="field" @updateValue="handleUpdateValue" />
      </enhanced-dialog>
      <component :is="currentComponent"></component>
    </el-main>

  </el-container>

</template>

<script>
import FormInput from '../modules/FormInput'
import EnhancedDialog from '../modules/EnhancedDialog.vue';
import AccountPageVue from './AccountPage.vue';
import SharePageVue from './SharePage.vue';
import JumpPageVue from './Jump.vue';
import RedemptionPageVue from './RedemptionPage.vue'
import CarPageVue from './CarPage.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
import { EventBus } from '../configs/eventBus';
import message from '@/configs/message'

export default {
  components: {
    EnhancedDialog,
    FormInput
  },
  name: 'NaviPage',
  data() {
    return {
      isMenuVisible: false,
      touchStartX: 0,
      touchStartY: 0,
      swipeWidth: 30,
      isMobile: false,
      avatar: 'img/linuxdo.webp',
      activeMenu: 'accountNav',
      currentComponent: AccountPageVue,
      modalVisible: false,
      itemData: '',
      modalTitle: '',
      isCollapse: false,
      formFields: [
        { id: 'code', label: '兑换码', type: 'text', value: '', required: true },
      ]
    };
  },
  computed: {
    getSidebarWidth() {
      if (this.isMobile) {
        return this.isCollapse ? '0' : '240px';
      }
      return this.isCollapse ? '66px' : '240px';
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },
    // 点击其他地方关闭菜单
    handleClickOutside(event) {
      const container = document.querySelector('.user-menu-container');
      if (container && !container.contains(event.target)) {
        this.isMenuVisible = false;
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.isCollapse = true; // 移动端默认收起
      }
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    loadAvatar() {
      const storedAvatar = localStorage.getItem('img');
      if (storedAvatar) {
        this.avatar = storedAvatar;
      }
    },
    handleUpdateValue(fieldId, newValue) {
      this.itemData = newValue;
      const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
      if (fieldIndex !== -1) {
        this.formFields[fieldIndex].value = newValue;
      }
    },
    showModal() {
      this.modalTitle = '兑换码激活';
      this.resetFormFields();
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    async submitForm() {
      const response = await apiClient.get(`${config.apiBaseUrl}/redemption/activate?code=` + this.itemData, {
        withCredentials: true,
        headers: {
          'Authorization': "Bearer " + localStorage.getItem('token')
        }
      });
      if (response.data.status) {
        this.modalVisible = false;
        message.success('兑换成功');
      } else {
        message.error(response.data.message);
      }
    },
    resetFormFields() {
      this.formData = {};
      this.formFields.forEach(field => {
        const defaultValue = field.type === 'checkbox' ? false : '';
        field.value = defaultValue;
        this.formData[field.id] = defaultValue;
      });
    },
    handleMenuSelect(index) {
      this.activeMenu = index;
      if (this.isMobile) {
        this.isCollapse = true; // 选择菜单项后自动收起
      }
      this.activeMenu = index;
      switch (index) {
        case 'accountNav':
          this.currentComponent = AccountPageVue;
          break;
        case 'shareNav':
          this.currentComponent = SharePageVue;
          break;
        case 'redemptionNav':
          this.currentComponent = RedemptionPageVue;
          break;
        case 'carNav':
          this.currentComponent = CarPageVue;
          break;
        case 'freeNav':
          this.currentComponent = JumpPageVue;
          break;
        default:
          this.currentComponent = SharePageVue;
      }
    },
    logout() {
      this.$router.replace({ name: 'home' });
      localStorage.removeItem('token')
      localStorage.removeItem('img')
    }
  },
  created() {
    this.loadAvatar();
    EventBus.$on('envVariableChanged', (newValue) => {
      switch (newValue) {
        case 'jump':
          this.currentComponent = JumpPageVue;
          break;
        case 'car':
          this.currentComponent = CarPageVue;
          break;
      }
    });
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);

    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', this.handleTouchStart);
      document.addEventListener('touchend', this.handleTouchEnd);
    }
  },
  destroyed() {
    window.removeEventListener('resize', this.checkMobile);
    if (typeof document !== 'undefined') {
      document.removeEventListener('touchstart', this.handleTouchStart);
      document.removeEventListener('touchend', this.handleTouchEnd);
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
/* 基础样式 */
#navi {
  height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1000; /* 确保侧边栏在下拉菜单之上 */
}

.sidebar-header {
  padding: 0 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-title {
  color: #0e8f6f;
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
}

.collapse-btn {
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #0e8f6f;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(14, 143, 111, 0.1);
}

/* 菜单样式优化 */
.el-menu {
  border: none;
  flex: 1;
}

.el-menu-item {
  margin: 4px 12px;
  height: 48px;
  line-height: 48px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.el-menu--collapse .el-menu-item {
  margin: 4px 2px;
}

.el-menu-item:hover,
.el-menu-item.is-active {
  background: linear-gradient(135deg, #0e8f6f 0%, #0d8668 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(14, 143, 111, 0.25);
}

.el-menu-item i {
  font-size: 18px;
  margin-right: 8px;
  width: 24px;
  text-align: center;
}

/* 用户菜单样式 */
.user-menu {
  padding: 15px;
  padding-left: 12px;
  margin-top: auto;
  position: relative; /* 添加相对定位 */
}

.user-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 主内容区域 */
.main-content {
  background-color: #f8f9fa;
  padding: 0;
  min-height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* 移动端触发器 */
.menu-trigger {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 48px;
  background: linear-gradient(135deg, #0e8f6f 0%, #0d8668 100%);
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
}

.menu-trigger:hover {
  width: 36px;
  box-shadow: 3px 0 16px rgba(0, 0, 0, 0.2);
}

.menu-trigger i {
  color: #fff;
  font-size: 18px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .mobile-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 2001;
    transform: translateX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-sidebar.collapsed {
    transform: translateX(-100%);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 2000;
    opacity: 1;
    transition: all 0.3s ease;
  }

  .main-content {
    padding: 0;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background-color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .site-title {
    color: #2ecc71;
  }

  .el-menu-item:hover,
  .el-menu-item.is-active {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%) !important;
  }

  .main-content {
    background-color: #121212;
  }
}

.user-menu {
  display: block;
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


body div[role="tooltip"].el-dropdown-menu {
  transform-origin: unset !important;
  position: fixed !important;
  top: unset !important;
  left: unset !important;
  transform: none !important;
  margin-top: 5px;
  left: 16px !important;
  z-index: 9999;
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>

<style>
/* 注意：这里不使用 scoped，确保样式可以作用到 popper */
.user-dropdown {
  left: 16px !important;
  transform: none !important;
  transform-origin: unset !important;
  position: absolute !important;
  top: unset !important;
  margin-top: -100px !important;
}

.user-dropdown .el-dropdown-menu__item {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

.user-dropdown .el-dropdown-menu__item i {
  margin-right: 8px !important;
}

.el-popper[x-placement^="bottom"] {
  margin-top: 12px !important;
  left: 16px !important;
  position: absolute !important;
  transform: translate(0, 0) !important;
}

/* 用更强的选择器覆盖默认样式 */
body > .el-dropdown-menu,
.el-dropdown-menu[x-placement^="bottom"] {
  left: 16px !important;
  margin-top: 10px !important;
  transform: translate(0, 0) !important;
  transform-origin: center top !important;
}

/* 确保菜单项左对齐 */
.el-dropdown-menu__item {
  justify-content: flex-start !important;
  padding-right: 20px !important;
}
</style>