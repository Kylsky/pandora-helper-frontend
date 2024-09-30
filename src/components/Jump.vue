<template>
  <el-container class="panel">
    <el-header>
      <h2>免费号池</h2>
    </el-header>
    <el-main>

      <el-row :gutter="20">
        <el-col style="padding-bottom: 15px;" :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
          v-for="(account, index) in accounts" :key="index">
          <el-card :class="{ 'busy': account.sessionToken === '1' }">
            <div slot="header" class="clearfix">
              <span>{{ account.type }}账号 {{ index + 1 }}</span>
              <el-tag :type="account.sessionToken === '' ? 'success' : 'danger'" size="small" style="float: right;">
                {{ account.sessionToken != '' ? "繁忙" : "空闲" }}
              </el-tag>
            </div>
            <el-button type="primary" @click="useAccount(account.id)" :disabled="account.sessionToken != ''">
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

export default {
  name: 'App',
  data() {
    return {
      accounts: []
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
        const response = await apiClient.get(`${config.apiBaseUrl}/account/list?type=2`, {
          withCredentials: true,
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        });
        if (response.data.status) {
          this.accounts = response.data.data.data
        }
      } catch (error) {
        alert(error)
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
          alert(response.data.message)
        }
      } catch (error) {
        alert(error)
      }
    }
  }
}
</script>

<style scoped>
/* 保留原有的自定义样式 */
.panel {
  background-color: #ffffff;
  border-radius: 5px;
  padding: 15px;
  margin: 1% 15px;
  height: 97%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 20px;
}

.create-new {
  float: right;
}

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

/* 覆盖一些 Element UI 的默认样式以匹配原设计 */
.el-button--primary {
  /* background-color: #43cea2; */
  background-color: #0e8f6f;
  /* border-color: #43cea2; */
  border-color: #0e8f6f;
}

.el-button--primary:hover,
.el-button--primary:focus {
  background-color: #2980b9;
  border-color: #2980b9;
}

.el-table th {
  background-color: #f2f2f2;
}

.el-pagination {
  /* text-align: right; */
  position: absolute;
  bottom: 5%;
  right: 3%;
}

.modern-audit-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.modern-audit-dialog>>>.el-dialog__header {
  background-color: #f5f7fa;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.modern-audit-dialog>>>.el-dialog__title {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.modern-audit-dialog>>>.el-dialog__body {
  padding: 30px 20px;
}

.audit-content {
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.audit-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
  font-weight: 500;
}

.audit-checkbox-group {
  display: flex;
  flex-direction: column;
}

.audit-checkbox-item {
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.audit-checkbox-item:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.audit-checkbox-item>>>.el-checkbox__label {
  font-size: 14px;
  color: #606266;
  padding: 10px;
  width: 100%;
  transition: all 0.3s ease;
}

.audit-checkbox-item>>>.el-checkbox__input.is-checked+.el-checkbox__label {
  color: #409EFF;
}

.audit-checkbox-item>>>.el-checkbox__inner {
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.audit-checkbox-item>>>.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409EFF;
  border-color: #409EFF;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.cancel-button {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.cancel-button:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.submit-button {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #ffffff;
}

.submit-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>