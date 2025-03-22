<template>
  <el-container id="navi" class="h-screen font-sans relative">
    <!-- 遮罩层 -->
    <div v-if="isMobile && !isCollapse" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1999] transition-opacity duration-300"
      @click="toggleCollapse">
    </div>

    <!-- 侧边栏 -->
    <el-aside :width="getSidebarWidth" class="sidebar">
      <div class="sidebar-header">
        <h2 class="site-title" v-show="!isCollapse">Pandora Helper</h2>
        <el-button v-if="!isMobile" 
          class="collapse-btn" 
          :icon="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="toggleCollapse">
        </el-button>
      </div>

      <el-menu 
        @select="handleMenuSelect" 
        default-active="accountNav" 
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        :collapse-transition="false">
        <el-menu-item v-for="(item, index) in filteredMenuItems" 
          :key="index" 
          :index="item.index">
          <i :class="item.icon"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <!-- 用户菜单 -->
      <el-dropdown class="user-menu" trigger="click" placement="top-start">
        <div class="avatar-wrapper">
          <el-avatar :size="40" :src="avatar" class="user-avatar"></el-avatar>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, index) in dropdownItems"
            :key="index"
            @click.native="item.action"
            class="dropdown-item">
            <i :class="[item.icon]"></i>
            <span>{{ item.title }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-aside>

    <el-main :class="['main-content', { 'mobile-main': isMobile }]">
      <!-- 移动端菜单触发器 -->
      <div v-if="isMobile && isCollapse" class="menu-trigger" @click="toggleCollapse">
        <i class="el-icon-s-operation"></i>
      </div>

      <!-- 对话框组件 -->
      <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" 
        @close="closeModal" @confirm="submitForm">
        <form-input v-for="(field, index) in formFields" 
          :key="index" 
          :field="field" 
          @updateValue="handleUpdateValue" />
      </enhanced-dialog>

      <!-- 重置密码对话框 -->
      <enhanced-dialog :isVisible="resetModalVisible" :title="'重置密码'"
        @close="closeResetModal" @confirm="submitResetForm">
        <form-input v-for="(field, index) in resetFormFields"
          :key="index"
          :field="field"
          @updateValue="handleResetUpdateValue" />
      </enhanced-dialog>

      <!-- 用户设置对话框 -->
      <enhanced-dialog :isVisible="settingsModalVisible" :title="'用户设置'"
        @close="closeSettingsModal" @confirm="submitSettingsForm">
        <form-input v-for="(field, index) in settingsFormFields"
          :key="index"
          :field="field"
          @updateValue="handleSettingsUpdateValue" />
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
      },
      settingsModalVisible: false,
      settingsFormFields: [
        { id: 'mjProxyUrl', label: 'Midjourney Proxy 地址', type: 'text', value: '', required: true },
        { id: 'mjProxyKey', label: 'Midjourney Proxy 密钥', type: 'text', value: '', required: true },
        { id: 'chatGptUrl', label: 'ChatGPT 镜像地址', type: 'text', value: '', required: true },
        { id: 'chatGptPassword', label: 'ChatGPT 镜像密码', type: 'password', value: '', required: true },
        { id: 'proxyUrl', label: '镜像代理', type: 'text', value: '', required: true }
      ],
      settingsFormData: {
        mjProxyUrl: '',
        mjProxyKey: '',
        chatGptUrl: '',
        chatGptPassword: '',
        proxyUrl: ''
      },
      menuItems: [
        { index: 'accountNav', icon: 'el-icon-s-custom', title: '账号管理' },
        { index: 'shareNav', icon: 'el-icon-share', title: '分享管理' },
        { index: 'redemptionNav', icon: 'el-icon-shopping-cart-full', title: '兑换码' },
        { index: 'carNav', icon: 'el-icon-truck', title: '停车场' },
        { index: 'drawNav', icon: 'el-icon-picture-outline', title: '图像生成', condition: 'showDrawModule' },
        { index: 'freeNav', icon: 'el-icon-medal', title: '免费号池' }
      ],
      dropdownItems: [
        { icon: 'el-icon-key', title: '兑换码激活', action: this.showModal },
        { icon: 'el-icon-refresh', title: '重置密码', action: this.showResetModal },
        { icon: 'el-icon-setting', title: '用户设置', action: this.showSettingsModal },
        { icon: 'el-icon-switch-button', title: '退出登录', action: this.logout }
      ]
    };
  },
  computed: {
    getSidebarWidth() {
      if (this.isMobile) {
        return this.isCollapse ? '0' : '240px';
      }
      return this.isCollapse ? '66px' : '240px';
    },
    filteredMenuItems() {
      return this.menuItems.filter(item => !item.condition || this[item.condition]);
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
            message.error('您没有图像生成模块的访问权限');
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
          const customMjConfig = adminResponse.data.data.customMjConfig ? adminResponse.data.data.customMjConfig : false;
          console.log(customMjConfig)

          const permission = hasPermission?.status;
          if (permission === 'DISABLED' &&  customMjConfig ) {
            this.showDrawModule = false;
            return;
          }
          // 只有当接口返回200时才显示图像生成模块
          this.showDrawModule = adminResponse.status === 200;
        } catch (error) {
          // 如果/current接口调用失败,不显示图像生成模块
          console.log('图像生成模块权限验证失败:', error);
          this.showDrawModule = false;
        }

      } catch (error) {
        console.error('获取用户信息失败:', error);
        message.error('获取用户信息失败');
        // this.$router.replace({ name: 'home' });
      }
    },
    handleSettingsUpdateValue(fieldId, newValue) {
      this.settingsFormData[fieldId] = newValue;
      const fieldIndex = this.settingsFormFields.findIndex(field => field.id === fieldId);
      if (fieldIndex !== -1) {
        this.settingsFormFields[fieldIndex].value = newValue;
      }
    },
    showSettingsModal() {
      this.getUserSettings();
      this.settingsModalVisible = true;
    },
    closeSettingsModal() {
      this.settingsModalVisible = false;
      // 清空表单数据
      this.settingsFormData = {
        mjProxyUrl: '',
        mjProxyKey: '',
        chatGptUrl: '',
        chatGptPassword: '',
        proxyUrl: ''
      };
    },
    async getUserSettings() {
      try {
        const response = await apiClient.get(`${config.apiBaseUrl}/share/getUserConfig`, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        
        if (response.status === 200 && response.data.status) {
          const settings = response.data.data;
          // 更新表单字段值
          this.settingsFormFields.forEach(field => {
            if (settings[field.id]) {
              field.value = settings[field.id];
              this.settingsFormData[field.id] = settings[field.id];
            }
          });
        } else {
          message.error('获取用户配置失败');
        }
      } catch (error) {
        console.error('获取用户配置失败:', error);
        message.error('获取用户配置失败');
      }
    },
    async submitSettingsForm() {
      try {
        const response = await apiClient.post(`${config.apiBaseUrl}/share/updateUserConfig`, this.settingsFormData, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        
        if (response.status === 200) {
          message.success('设置保存成功');
          this.closeSettingsModal();
        } else {
          message.error('保存设置失败');
        }
      } catch (error) {
        console.error('保存设置失败:', error);
        message.error('保存设置失败');
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  @apply bg-white dark:bg-gray-800 shadow-md dark:shadow-none py-5;
  @apply transition-all duration-300 ease-in-out relative flex flex-col;
  @apply dark:border-r dark:border-gray-700/50;
  @apply z-[2000];
}

.sidebar-header {
  @apply px-4 mb-6 flex items-center justify-between;
}

.site-title {
  @apply text-emerald-600 dark:text-emerald-300 text-xl font-semibold tracking-wide m-0 truncate;
  @apply dark:drop-shadow-[0_0_12px_rgba(110,231,183,0.2)];
}

.collapse-btn {
  @apply p-2 text-emerald-600 dark:text-emerald-300;
  @apply hover:bg-emerald-50 dark:hover:bg-emerald-400/10;
  @apply rounded-lg transition-all duration-200 hover:-translate-y-0.5;
  @apply border-none bg-transparent cursor-pointer;
}

/* 菜单样式 */
.el-menu {
  @apply border-none flex-1 dark:bg-gray-800;
}

.el-menu-item {
  @apply mx-3 h-12 rounded-lg font-medium text-sm;
  @apply transition-all duration-300;
  @apply hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700;
  @apply dark:hover:from-emerald-500 dark:hover:to-emerald-600;
  @apply hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/20 hover:shadow-lg;
  @apply hover:-translate-y-0.5 hover:text-white dark:text-gray-300;
  @apply flex items-center;
  line-height: 3rem !important;
  padding: 0 1rem !important;
}

.el-menu--collapse .el-menu-item {
  @apply mx-0.5;
  padding: 0 0.75rem !important;
}

.el-menu-item i {
  @apply text-lg text-center dark:text-gray-400;
  margin-right: 0.75rem !important;
}

.el-menu-item span {
  @apply inline-flex items-center;
  line-height: inherit;
}

/* 用户菜单 */
.user-menu {
  @apply px-4 mt-auto;
}

.avatar-wrapper {
  @apply cursor-pointer;
}

.user-avatar {
  @apply border-2 border-white dark:border-gray-700 shadow-lg dark:shadow-black/40;
  @apply transition-all duration-300;
  @apply hover:border-emerald-500 dark:hover:border-emerald-400;
  @apply hover:shadow-xl hover:-translate-y-0.5 hover:scale-105;
}

/* 下拉菜单 */
.el-dropdown-menu {
  @apply min-w-[120px] rounded-lg overflow-hidden;
  @apply dark:bg-gray-800 dark:border dark:border-gray-700/50;
  @apply dark:shadow-lg dark:shadow-black/20;
}

.dropdown-item {
  @apply h-9 leading-9 px-3 text-sm;
  @apply hover:bg-emerald-50 dark:hover:bg-emerald-500/10;
  @apply dark:text-gray-300;
}

.dropdown-item i {
  @apply mr-2 text-sm dark:text-gray-400;
}

/* 主内容区域 */
.main-content {
  @apply bg-gray-50 dark:bg-gray-900 min-h-screen;
  @apply transition-all duration-300 p-0 relative;
}

/* 移动端触发器 */
.menu-trigger {
  @apply fixed left-0 top-1/2 -translate-y-1/2 w-8 h-12;
  @apply bg-gradient-to-r from-emerald-600 to-emerald-700;
  @apply dark:from-emerald-500 dark:to-emerald-600;
  @apply rounded-r-lg shadow-lg dark:shadow-emerald-400/20;
  @apply flex items-center justify-center cursor-pointer;
  @apply transition-all duration-300 hover:w-9 hover:shadow-xl z-[1000];
}

.menu-trigger i {
  @apply text-white text-lg;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .sidebar {
    @apply fixed inset-y-0 left-0 transform;
  }

  .sidebar.collapsed {
    @apply -translate-x-full;
  }

  .mobile-overlay {
    @apply fixed inset-0 bg-black/40 backdrop-blur-sm;
    @apply z-[2000] opacity-100 transition-all duration-300;
  }
}
</style>