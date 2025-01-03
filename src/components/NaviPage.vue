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
        <el-menu-item index="drawNav" v-if="showDrawModule">
          <i class="el-icon-picture-outline"></i>
          <span slot="title">AI绘图</span>
        </el-menu-item>
        <el-menu-item index="freeNav">
          <i class="el-icon-medal"></i>
          <span slot="title">免费号池</span>
        </el-menu-item>
      </el-menu>
      <!-- 头像放回左下角 -->
      <el-dropdown class="user-menu" trigger="click" placement="top-start">
        <div class="avatar-wrapper">
          <el-avatar :size="40" :src="avatar" class="user-avatar"></el-avatar>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="showModal" class="dropdown-item">
            <i class="el-icon-key"></i>
            <span>兑换码激活</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="showResetModal" class="dropdown-item">
            <i class="el-icon-refresh"></i>
            <span>重置密码</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout" class="dropdown-item">
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

      <!-- 重置密码弹窗 -->
      <enhanced-dialog :isVisible="resetModalVisible" :title="'重置密码'" @close="closeResetModal"
        @confirm="submitResetForm">
        <form-input v-for="(field, index) in resetFormFields" :key="index" :field="field"
          @updateValue="handleResetUpdateValue" />
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
import DrawPageVue from './DrawPage.vue';
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
      mjApiSecret: null,
      isMenuVisible: false,
      touchStartX: 0,
      touchStartY: 0,
      swipeWidth: 30,
      isMobile: false,
      avatar: 'img/linuxdo.webp',
      activeMenu: 'accountNav',
      currentComponent: AccountPageVue,
      modalVisible: false,
      resetModalVisible: false,
      itemData: '',
      modalTitle: '',
      isCollapse: true,
      showDrawModule: false,
      formFields: [
        { id: 'code', label: '兑换码', type: 'text', value: '', required: true },
      ],
      resetFormFields: [
        { id: 'oldPassword', label: '旧密码', type: 'password', value: '', required: true },
        { id: 'newPassword', label: '新密码', type: 'password', value: '', required: true },
        { id: 'confirmPassword', label: '确认新密码', type: 'password', value: '', required: true }
      ],
      resetFormData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
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
    async getUserInfo() {
      try {
        const response = await apiClient.get(`${config.apiBaseUrl}/user/info`, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        console.log(response.data.data.apiKey)
        if (response.data.status) {
          this.mjApiSecret = response.data.data.apiKey;
        } else {
          message.error('获取用户信息失败');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        message.handleError(error);
      }
    },
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
    handleResetUpdateValue(fieldId, newValue) {
      this.resetFormData[fieldId] = newValue;
      const fieldIndex = this.resetFormFields.findIndex(field => field.id === fieldId);
      if (fieldIndex !== -1) {
        this.resetFormFields[fieldIndex].value = newValue;
      }
    },
    showModal() {
      this.modalTitle = '兑换码激活';
      this.resetFormField();
      this.modalVisible = true;
    },
    showResetModal() {
      this.resetModalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    closeResetModal() {
      this.resetModalVisible = false;
      this.resetFormData = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
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
    async submitResetForm() {
      try {
        if (this.resetFormData.newPassword !== this.resetFormData.confirmPassword) {
          message.error('两次输入的新密码不一致');
          return;
        }
        const response = await apiClient.post(`${config.apiBaseUrl}/user/reset`, {
          oldPassword: this.resetFormData.oldPassword,
          newPassword: this.resetFormData.newPassword,
          confirmPassword: this.resetFormData.confirmPassword
        }, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        if (response.data.status) {
          message.success('密码重置成功');
          this.closeResetModal();
        } else {
          message.error(response.data.message);
        }
        // 重置密码
        this.resetFormData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        message.error('密码重置失败');
      }
    },
    resetFormField() {
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
        this.isCollapse = true;
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
        case 'drawNav':
          if (this.showDrawModule) {
            this.currentComponent = DrawPageVue;
          } else {
            message.error('您没有AI绘图模块的访问权限');
          }
          break;
        default:
          this.currentComponent = SharePageVue;
      }
    },
    logout() {
      this.$router.replace({ name: 'home' });
      localStorage.removeItem('token')
      localStorage.removeItem('img')
    },
    async checkUserPermission() {
      try {
        // 获取用户信息和apiKey
        const response = await apiClient.get(`${config.apiBaseUrl}/user/info`, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        
        if (!response.data.status) {
          message.error('获取用户信息失败');
          this.$router.replace({ name: 'home' });
          return;
        }

        // 存储apiKey
        this.mjApiSecret = response.data.data.apiKey;

        // 验证用户权限
        try {
          const adminResponse = await apiClient.get(`${config.apiBaseUrl}/mj/users`, {
            headers: {
              'Authorization': "Bearer " + localStorage.getItem('token')
            }
          });
          // 获取当前用户名
          const currentUsername = response.data.data.username;
          console.log(currentUsername)
          // 检查用户列表是否为空或是否包含当前用户
          const userList = adminResponse.data.data.list || [];
          // 查询用户名相同的用户
          const hasPermission = userList.find(user => user.name === currentUsername);
          // 获取具体的权限
          console.log(hasPermission)

          const permission = hasPermission.status;
          if (permission === 'DISABLED') {
            this.showDrawModule = false;
            return;
          }
          // 只有当接口返回200时才显示AI绘图模块
          this.showDrawModule = adminResponse.status === 200;
        } catch (error) {
          // 如果/current接口调用失败,不显示AI绘图模块
          console.log('AI绘图模块权限验证失败:', error);
          this.showDrawModule = false;
        }

      } catch (error) {
        console.error('获取用户信息失败:', error);
        message.error('获取用户信息失败');
        // this.$router.replace({ name: 'home' });
      }
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
    this.checkUserPermission();
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
  z-index: 1000;
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
  transition: all 0.3s ease;
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
  padding: 16px;
  margin-top: auto;
}

.avatar-wrapper {
  cursor: pointer;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 只保留最基本的下拉菜单样式 */
.el-dropdown-menu {
  min-width: 120px !important;
  padding: 4px 0 !important;
  margin: 0 !important;
  border-radius: 8px !important;
}

.dropdown-item {
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 12px !important;
  font-size: 13px !important;
}

.dropdown-item i {
  margin-right: 8px !important;
  font-size: 14px !important;
}

@media (prefers-color-scheme: dark) {
  .el-dropdown-menu {
    background: #1a1a1a !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }

  .dropdown-item {
    color: #e5eaf3 !important;
  }

  .dropdown-item:hover {
    background: rgba(110, 231, 183, 0.1) !important;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .el-dropdown-menu.user-dropdown-menu {
    position: fixed !important;
    bottom: 80px !important;
    left: 16px !important;
    width: 140px !important;
    max-width: 140px !important;
  }
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

/* 深色主题优化 */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background-color: #1a1a1a;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .site-title {
    color: #6ee7b7;
    text-shadow: 0 0 10px rgba(110, 231, 183, 0.3);
  }

  .collapse-btn {
    color: #6ee7b7;
    transition: all 0.3s ease;
  }

  .collapse-btn:hover {
    background: rgba(110, 231, 183, 0.15);
    transform: translateY(-1px);
  }

  .el-menu {
    background-color: #1a1a1a !important;
  }

  .el-menu-item {
    color: #f3f4f6 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .el-menu-item:hover,
  .el-menu-item.is-active {
    background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%) !important;
    box-shadow: 0 4px 15px rgba(110, 231, 183, 0.3) !important;
    transform: translateY(-1px);
  }

  .el-menu-item i {
    color: #6ee7b7 !important;
    transition: all 0.3s ease;
  }

  .el-menu-item:hover i,
  .el-menu-item.is-active i {
    transform: scale(1.1);
    color: #ffffff !important;
  }

  .user-avatar {
    border: 2px solid #2d3748;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .user-avatar:hover {
    border-color: #6ee7b7;
    box-shadow: 0 6px 20px rgba(110, 231, 183, 0.25);
    transform: translateY(-2px) scale(1.05);
  }

  .main-content {
    background-color: #111827;
  }

  .menu-trigger {
    background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
    box-shadow: 0 4px 15px rgba(110, 231, 183, 0.25);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-trigger:hover {
    box-shadow: 0 6px 20px rgba(110, 231, 183, 0.3);
    transform: translateY(-50%) scale(1.05);
  }

  .mobile-overlay {
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }
}
</style>