<template>
  <div class="min-h-[calc(100vh-40px)] mx-5 my-[1.5%] bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
    <header class="mb-6">
      <div class="flex items-center">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mr-6">免费号池</h2>
        <el-switch active-color="#0e8f6f"
          v-model="showClaude"
          active-text="Claude"
          inactive-text="ChatGPT"
          @change="toggleAIType"
        ></el-switch>
      </div>
    </header>

    <main class="relative" v-loading="pageLoading" element-loading-text="加载中..." element-loading-spinner="el-icon-loading">
      <el-skeleton :loading="pageLoading" animated :count="4" v-if="pageLoading">
        <template slot="template">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div class="pb-4">
              <div class="h-[150px] rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </template>
      </el-skeleton>

      <!-- PC端视图 -->
      <div v-if="!isMobile" class="pc-view">
        <div v-if="!pageLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-2.5">
          <div 
            v-for="(account, index) in filteredAccounts" 
            :key="account.id"
            class="min-w-0"
          >
            <el-card 
              :class="[
                'transition-all duration-300 hover:-translate-y-0.5 border-none shadow-md dark:!bg-gray-700/50 dark:hover:!bg-gray-700/70',
                { 'opacity-80 bg-gray-50 dark:bg-gray-800/70': account.sessionToken === '1' }
              ]"
              shadow="hover"
            >
              <div slot="header" class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ account.type }}账号 {{ index + 1 }}</span>
                <el-tag 
                  :type="account.sessionToken === '' ? 'success' : 'danger'" 
                  size="small" 
                  effect="dark"
                  class="font-medium"
                >
                  {{ account.sessionToken != '' ? "繁忙" : "空闲" }}
                </el-tag>
              </div>
              <el-button 
                type="primary" 
                @click="useAccount(account.id)" 
                :disabled="account.sessionToken != ''"
                :loading="loadingAccounts[account.id]"
                element-loading-spinner="el-icon-loading"
                class="!w-full mt-2.5 font-medium !bg-gradient-to-r !from-emerald-600 !to-emerald-500 hover:!from-emerald-500 hover:!to-emerald-400 disabled:!opacity-70 disabled:!from-gray-600 disabled:!to-gray-500 dark:!from-emerald-500 dark:!to-emerald-400 dark:hover:!from-emerald-400 dark:hover:!to-emerald-300 !transition-all !duration-300 hover:!-translate-y-0.5 !shadow-emerald-200/20 dark:!shadow-emerald-900/30"
              >
                {{ account.sessionToken != '' ? '暂不可用' : (loadingAccounts[account.id] ? '跳转中...' : '立即使用') }}
              </el-button>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 移动端视图 -->
      <div v-else class="mobile-view">
        <div v-if="!pageLoading" class="space-y-4 px-2.5">
          <div v-for="(account, index) in filteredAccounts" 
            :key="account.id"
            :class="[
              'p-4 bg-white dark:bg-gray-700/50 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-700/70',
              { 'opacity-80 bg-gray-50 dark:bg-gray-800/70': account.sessionToken === '1' }
            ]"
          >
            <div class="mb-4">
              <div class="flex justify-between items-center">
                <span class="text-base font-medium text-gray-700 dark:text-gray-200">{{ account.type }}账号 {{ index + 1 }}</span>
                <el-tag 
                  :type="account.sessionToken === '' ? 'success' : 'danger'" 
                  size="mini"
                  effect="dark"
                >
                  {{ account.sessionToken != '' ? "繁忙" : "空闲" }}
                </el-tag>
              </div>
            </div>
            <el-button 
              type="success" 
              @click="useAccount(account.id)" 
              :disabled="account.sessionToken != ''"
              :loading="loadingAccounts[account.id]"
              size="medium"
              class="!w-full !h-10 !text-base !font-medium"
            >
              {{ account.sessionToken != '' ? '暂不可用' : (loadingAccounts[account.id] ? '跳转中...' : '立即使用') }}
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="!pageLoading && filteredAccounts.length === 0" class="text-center py-10 text-gray-400">
        <i class="el-icon-warning-outline text-4xl mb-4"></i>
        <p class="text-base m-0">暂无可用账号</p>
      </div>
    </main>
  </div>
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
      pageLoading: true,
      refreshInterval: null,
      retryCount: 0,
      maxRetries: 3,
      isMobile: false,
      loadingAccounts: {}
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
    this.checkDeviceType();
    window.addEventListener('resize', this.checkDeviceType);
    await this.initializeData();
    this.startAutoRefresh();
  },
  beforeDestroy() {
    this.stopAutoRefresh();
    window.removeEventListener('resize', this.checkDeviceType);
  },
  methods: {
    checkDeviceType() {
      this.isMobile = window.innerWidth <= 768;
    },
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
            timeout: 10000
          }
        );
        if (response.data.status) {
          const newAccounts = response.data.data.data;
          // 保持账号顺序不变
          this.accounts = this.accounts.map(account => {
            const newAccount = newAccounts.find(a => a.id === account.id);
            return newAccount || account;
          });
          // 添加新账号
          newAccounts.forEach(newAccount => {
            if (!this.accounts.find(a => a.id === newAccount.id)) {
              this.accounts.push(newAccount);
            }
          });
          this.retryCount = 0;
        }
      } catch (error) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.fetchAccounts();
          }, 2000 * this.retryCount);
        } else {
          message.error('获取账号列表失败，请刷新页面重试');
        }
      }
    },
    async useAccount(index) {
      if (this.loadingAccounts[index]) return;
      this.loadingAccounts[index] = true;
      try {
        const response = await apiClient.get(
          `${config.apiBaseUrl}/account/share?id=` + index, 
          {
            withCredentials: true,
            headers: {
              'Authorization': "Bearer " + localStorage.getItem('token')
            },
            timeout: 15000
          }
        );
        if (response.data.status) {
          window.open(response.data.data);
          this.loadingAccounts[index] = false;
          await this.fetchAccounts();
        } else {
          this.loadingAccounts[index] = false;
          message.error(response.data.message || '使用账号失败');
        }
      } catch (error) {
        this.loadingAccounts[index] = false;
        message.error('系统错误,请稍后重试');
      }
    },
    async toggleAIType() {
      this.pageLoading = true;
      this.accounts = []; // 切换类型时清空账号列表
      await this.fetchAccounts();
      this.pageLoading = false;
    }
  }
}
</script>
