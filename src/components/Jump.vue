<template>
  <el-container class="panel">
    <el-header>
      <div class="header-content">
        <h2>免费号池</h2>
        <el-switch active-color="#0e8f6f"
          v-model="showClaude"
          active-text="Claude"
          inactive-text="ChatGPT"
          @change="toggleAIType"
        ></el-switch>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col 
          style="padding-bottom: 15px;" 
          :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
          v-for="(account, index) in filteredAccounts" 
          :key="index"
        >
          <el-card :class="{ 'busy': account.sessionToken === '1' }">
            <div slot="header" class="clearfix">
              <span>{{ account.type }}账号 {{ index + 1 }}</span>
              <el-tag 
                :type="account.sessionToken === '' ? 'success' : 'danger'" 
                size="small" 
                style="float: right;"
              >
                {{ account.sessionToken != '' ? "繁忙" : "空闲" }}
              </el-tag>
            </div>
            <el-button 
              type="primary" 
              @click="useAccount(account.id)" 
              :disabled="account.sessionToken != ''"
            >
              使用账号
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message'

export default {
  name: 'App',
  data() {
    return {
      accounts: [],
      showClaude: true
    }
  },
  computed: {
    filteredAccounts() {
      return this.accounts.filter(account => 
        this.showClaude ? account.type === 'Claude' : account.type === 'ChatGPT'
      );
    }
  },
  created() {
    this.fetchAccounts();
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    async fetchAccounts() {
      try {
        const response = await apiClient.get(`${config.apiBaseUrl}/account/list?type=`+(this.showClaude ? 2:1), {
          withCredentials: true,
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        if (response.data.status) {
          this.accounts = response.data.data.data
        }
      } catch (error) {
        message.error(error)
      }
    },
    async useAccount(index) {
      try {
        const response = await apiClient.get(`${config.apiBaseUrl}/account/share?id=` + index, {
          withCredentials: true,
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        if (response.data.status) {
          // console.log(response.data.data)
          window.open(response.data.data)
        } else {
          message.error(response.data.message)
        }
      } catch (error) {
        message.error(error)
      }
    },
    toggleAIType() {
      this.fetchAccounts();
    },
    handleCheckboxChange(account, value) {
      console.log(`Account ${account.id} selection changed to ${value}`);
    }
  }
}
</script>
<style scoped>
/* 基础布局样式 */
.panel {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 10px;
    margin: 1.5% 20px;
    min-height: calc(100vh - 40px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.el-header {
    padding: 0;
    margin-bottom: 24px;
}

.header-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
}

.header-content h2 {
    margin: 0 24px 0 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
}

/* 搜索栏样式 */
.search-bar {
    margin-bottom: 28px;
}

/* 文本溢出处理 */
.ellipsis,
.share-ellipsis {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.share-ellipsis {
    max-width: 150px;
}

/* Element UI 组件样式覆盖 */
.el-button--primary {
    background: linear-gradient(145deg, #0e8f6f, #0d8668);
    border: none;
    box-shadow: 0 2px 8px rgba(14, 143, 111, 0.2);
    transition: all 0.3s ease;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background: linear-gradient(145deg, #0c7a5e, #0b7257);
    box-shadow: 0 4px 12px rgba(14, 143, 111, 0.3);
    transform: translateY(-1px);
}

.el-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.el-pagination {
    position: fixed;
    bottom: 24px;
    right: 44px;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

/* 对话框样式优化 */
.modern-audit-dialog {
    border-radius: 16px;
    overflow: hidden;
}

.modern-audit-dialog >>> .el-dialog__header {
    background-color: #f8f9fa;
    padding: 24px;
    border-bottom: 1px solid #ebeef5;
}

.modern-audit-dialog >>> .el-dialog__title {
    font-size: 20px;
    color: #303133;
    font-weight: 600;
}

.modern-audit-dialog >>> .el-dialog__body {
    padding: 32px 24px;
}

/* 审核内容样式 */
.audit-content {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    padding: 24px;
}

.audit-title {
    font-size: 18px;
    color: #303133;
    margin-bottom: 24px;
    font-weight: 500;
}

.audit-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.audit-checkbox-item {
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.audit-checkbox-item:hover {
    background-color: #f8f9fa;
}

/* Checkbox 样式优化 */
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background: linear-gradient(145deg, #0e8f6f, #0d8668);
    border-color: #0e8f6f;
}

.el-checkbox__input.is-checked + .el-checkbox__label {
    color: #0e8f6f;
}

/* Switch 开关样式 */
.el-switch.is-checked .el-switch__core {
    border-color: #0e8f6f;
    background-color: #0e8f6f;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .panel {
        background-color: #1e1e1e;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .header-content h2 {
        color: #e0e0e0;
    }
    
    .el-table th {
        background-color: #2c2c2c;
        color: #e0e0e0;
    }
    
    .el-pagination {
        background: rgba(30, 30, 30, 0.98);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }
}
</style>
