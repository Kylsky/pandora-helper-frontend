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
    <el-main v-loading="pageLoading" element-loading-text="加载中...">
      <el-skeleton :loading="pageLoading" animated :count="4" v-if="pageLoading">
        <template slot="template">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" style="padding-bottom: 15px;">
              <el-skeleton-item variant="rect" style="height: 150px; border-radius: 8px;"/>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>

      <el-row :gutter="20" v-else>
        <el-col 
          style="padding-bottom: 15px;" 
          :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
          v-for="(account, index) in filteredAccounts" 
          :key="index"
        >
          <el-card :class="{ 'busy': account.sessionToken === '1' }" shadow="hover">
            <div slot="header" class="clearfix">
              <span class="account-title">{{ account.type }}账号 {{ index + 1 }}</span>
              <el-tag 
                :type="account.sessionToken === '' ? 'success' : 'danger'" 
                size="small" 
                effect="dark"
                class="status-tag"
              >
                {{ account.sessionToken != '' ? "繁忙" : "空闲" }}
              </el-tag>
            </div>
            <el-button 
              type="primary" 
              @click="useAccount(account.id)" 
              :disabled="account.sessionToken != ''"
              class="use-button"
              :loading="loadingId === account.id"
            >
              {{ account.sessionToken != '' ? '暂不可用' : '立即使用' }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
      <div v-if="!pageLoading && filteredAccounts.length === 0" class="empty-state">
        <i class="el-icon-warning-outline"></i>
        <p>暂无可用账号</p>
      </div>
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
      showClaude: true,
      loadingId: null,
      pageLoading: true,
      refreshInterval: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    filteredAccounts() {
      return this.accounts.filter(account => 
        this.showClaude ? account.type === 'Claude' : account.type === 'ChatGPT'
      );
    }
  },
  async created() {
    await this.initializeData();
    this.startAutoRefresh();
  },
  beforeDestroy() {
    this.stopAutoRefresh();
  },
  methods: {
    async initializeData() {
      await this.fetchAccounts();
      this.pageLoading = false;
    },
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.fetchAccounts();
      }, 30000);
    },
    stopAutoRefresh() {
      if(this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    },
    async fetchAccounts() {
      try {
        const response = await apiClient.get(
          `${config.apiBaseUrl}/account/list?type=`+(this.showClaude ? 2:1), 
          {
            withCredentials: true,
            headers: {
              'Authorization': "Bearer " + localStorage.getItem('token')
            },
            timeout: 10000 // 10秒超时
          }
        );
        if (response.data.status) {
          this.accounts = response.data.data.data;
          this.retryCount = 0; // 重置重试计数
        }
      } catch (error) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.fetchAccounts();
          }, 2000 * this.retryCount); // 递增重试延迟
        } else {
          message.error('获取账号列表失败，请刷新页面重试');
        }
      }
    },
    async useAccount(index) {
      this.loadingId = index;
      try {
        const response = await apiClient.get(
          `${config.apiBaseUrl}/account/share?id=` + index, 
          {
            withCredentials: true,
            headers: {
              'Authorization': "Bearer " + localStorage.getItem('token')
            },
            timeout: 15000 // 15秒超时
          }
        );
        if (response.data.status) {
          window.open(response.data.data);
          await this.fetchAccounts();
        } else {
          message.error(response.data.message || '使用账号失败');
        }
      } catch (error) {
        message.error('系统错误,请稍后重试');
      } finally {
        this.loadingId = null;
      }
    },
    async toggleAIType() {
      this.pageLoading = true;
      await this.fetchAccounts();
      this.pageLoading = false;
    }
  }
}
</script>
<style scoped>
/* 基础布局样式 */
.panel {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
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

/* 卡片样式优化 */
.el-card {
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    will-change: transform;
}

.el-card:hover {
    transform: translateY(-2px);
}

.el-card.busy {
    opacity: 0.8;
    background: #f5f7fa;
}

.account-title {
    font-weight: 500;
    color: #606266;
}

.status-tag {
    float: right;
    font-weight: 500;
}

.use-button {
    width: 100%;
    margin-top: 10px;
    font-weight: 500;
}

/* 空状态样式 */
.empty-state {
    text-align: center;
    padding: 40px 0;
    color: #909399;
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
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

.el-button--primary:disabled {
    background: #a0cfbe;
    opacity: 0.7;
}

/* Switch 开关样式 */
.el-switch.is-checked .el-switch__core {
    border-color: #0e8f6f;
    background-color: #0e8f6f;
}

/* 骨架屏样式 */
.el-skeleton {
    padding: 20px;
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
    
    .el-card {
        background-color: #2c2c2c;
        border: 1px solid #3c3c3c;
    }
    
    .el-card.busy {
        background-color: #262626;
    }
    
    .account-title {
        color: #d0d0d0;
    }
    
    .empty-state {
        color: #909399;
    }
}
</style>
