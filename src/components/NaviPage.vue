<template>
  <el-container id="navi">
    <el-aside width="240px" class="sidebar">
      <h2 class="site-title" style="text-align: center;">Pandora Helper</h2>
      <el-menu @select="handleMenuSelect" default-active="accountNav" class="el-menu-vertical-demo"
        background-color="#ffffff" text-color="#333" active-text-color="#fff">
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
          <el-avatar :size="44" :src="avatar" class="user-avatar"></el-avatar>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="showModal">兑换码激活</el-dropdown-item>
          <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>

      </el-dropdown>

      <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
        <form-input v-for="(field, index) in formFields" :key="index" :field="field" @updateValue="handleUpdateValue" />
      </enhanced-dialog>
      <!-- 主要内容区域 -->
      <!-- <router-view></router-view> -->
      <component :is="currentComponent"></component>

    </el-main>
  </el-container>
</template>

<script>
import FormInput from '../modules/FormInput'
import EnhancedDialog from '../modules/EnhancedDialog.vue';
import AccountPageVue from './AccountPage.vue';
import SharePageVue from './SharePage.vue';
import RedemptionPageVue from './RedemptionPage.vue'
import CarPageVue from './CarPage.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
export default {
  components: {
    EnhancedDialog,
    FormInput
  },
  name: 'NaviPage',
  data() {
    return {
      avatar: '/linuxdo.webp',
      activeMenu: 'accountNav',
      currentComponent: AccountPageVue,
      modalVisible: false,
      itemData: '',
      modalTitle: '',
      formFields: [
        { id: 'code', label: '兑换码', type: 'text', value: '', required: true },
      ]
    };
  },
  methods: {
    loadAvatar() {
      // 从 localStorage 中获取头像
      const storedAvatar = localStorage.getItem('img');
      
      // 如果 localStorage 中有头像数据，则替换默认头像
      if (storedAvatar) {
        this.avatar = storedAvatar;
      }
    },
    handleUpdateValue(fieldId, newValue) {
      // 更新 formData 中对应字段的值
      // this.formData[fieldId] = newValue;
      this.itemData = newValue;

      // 更新 formFields 中对应字段的值
      const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
      if (fieldIndex !== -1) {
        this.formFields[fieldIndex].value = newValue;
      }
    },
    showModal() {
      console.log(111)
      this.modalTitle = '兑换码激活';
      this.resetFormFields();
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    async submitForm() {
      console.log(this.itemData)
      const response = await apiClient.get(`${config.apiBaseUrl}/redemption/activate?code=` + this.itemData, {
        withCredentials: true,
        headers: {
          'Authorization': "Bearer " + localStorage.getItem('token')
        }
      });
      if (response.data.status) {
        alert('删除成功');
      } else {
        alert(response.data.message);
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
        default:
          this.currentComponent = SharePageVue;
      }
    },
    logout() {
      // 实现登出逻辑
      this.$router.replace({ name: 'home' });
      localStorage.removeItem('token')
      localStorage.removeItem('img')
    }
  },
  created() {
    this.loadAvatar();
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