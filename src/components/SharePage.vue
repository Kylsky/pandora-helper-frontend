<template>
    <el-container id="sharePanel" class="panel">
        <el-header>
            <h2>分享管理</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱或用户名" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div class="pc-view">
                <el-table :data="tableData" style="width: 100%" :fit="true" v-loading="loading">
                    <el-table-column prop="uniqueName" label="用户名" min-width="150">
                    </el-table-column>
                    <el-table-column prop="gptCarName" label="ChatGPT账号" min-width="200">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.gptCarName" :count="scope.row.gptUserCount || 0" type="gpt"
                                :loading="scope.row.loading" @click="openChat(scope.row.gptConfigId, 1)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="claudeCarName" label="Claude账号" min-width="200">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.claudeCarName" :count="scope.row.claudeUserCount || 0"
                                type="claude" :loading="scope.row.loading"
                                @click="openChat(scope.row.claudeConfigId, 2)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="apiCarName" label="API账号" min-width="200">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.apiCarName" :count="scope.row.apiUserCount || 0" type="api"
                                :loading="scope.row.loading" @click="openChat(scope.row.apiConfigId, 3)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="expiresAt" label="过期时间" min-width="110">
                    </el-table-column>

                    <!-- <el-table-column prop="remark" label="备注" width="120">
                    </el-table-column> -->
                    <el-table-column label="操作" min-width="280" fixed="right">
                        <template slot-scope="scope">
                            <div class="action-row">
                                <el-button type="primary" size="mini"
                                    @click="showShareModal(scope.row.id)">激活</el-button>
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>
                                <el-button type="danger" size="mini"
                                    @click="showConfirmDialog(scope.row.id)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 移动端卡片视图 -->
            <div class="mobile-view">
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card" v-loading="item.loading">
                    <div class="mobile-card-header">
                        <div class="username-badge">
                            <i class="el-icon-user"></i>
                            {{ item.uniqueName }}
                        </div>
                        <div class="expires-badge">
                            {{ item.expiresAt }}
                        </div>
                    </div>

                    <div class="mobile-card-content">
                        <div class="account-item" v-if="item.gptCarName">
                            <div class="account-label">ChatGPT账号</div>
                            <div class="account-value">
                                <split-button :name="item.gptCarName" :count="item.gptUserCount || 0" type="gpt"
                                    :loading="item.loading" @click="openChat(item.gptConfigId, 1)" />
                            </div>
                        </div>

                        <div class="account-item" v-if="item.claudeCarName">
                            <div class="account-label">Claude账号</div>
                            <div class="account-value">
                                <split-button :name="item.claudeCarName" :count="item.claudeUserCount || 0"
                                    type="claude" :loading="item.loading" @click="openChat(item.claudeConfigId, 2)" />
                            </div>
                        </div>

                        <div class="account-item" v-if="item.apiCarName">
                            <div class="account-label">API账号</div>
                            <div class="account-value">
                                <split-button :name="item.apiCarName" :count="item.apiUserCount || 0" type="api"
                                    :loading="item.loading" @click="openChat(item.apiConfigId, 3)" />
                            </div>
                        </div>
                    </div>

                    <div class="mobile-card-divider"></div>

                    <div class="mobile-card-actions">
                        <div class="action-row">
                            <el-button type="primary" size="mini" :loading="item.actionLoading"
                                @click="showShareModal(item.id)">激活</el-button>
                            <el-button type="warning" size="mini" :loading="item.actionLoading"
                                @click="editItem(item.id)">编辑</el-button>
                            <el-button type="danger" size="mini" :loading="item.actionLoading"
                                @click="showConfirmDialog(item.id)">删除</el-button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pagination-container">
                <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage"
                    :page-size="pageSize" :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
                    :pager-count="isMobile ? 5 : 7" :total="total" class="pagination-wrapper">
                </el-pagination>
            </div>

            <!-- 弹窗组件 -->
            <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
                <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                    @updateValue="handleUpdateValue" @handleSelectChange="handleSelectChange" />
            </enhanced-dialog>

            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个共享账户吗？"
                @confirm="handleDelete" />
        </el-main>
    </el-container>
</template>

<script>
import ConfirmDialog from '../modules/ConfirmDialog.vue';
import EnhancedDialog from '../modules/EnhancedDialog.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
import FormInput from '../modules/FormInput'
import SplitButton from './SplitButton.vue'  // 确保路径正确
import message from '@/configs/message'
import { Loading } from 'element-ui';

export default {
    name: 'SharePage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput,
        SplitButton
    },
    data() {
        return {
            isMobile: false,
            email: '',
            tableData: [],
            currentPage: 1,
            total: 0,
            isDialogVisible: false,
            isAccDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null,
            activateFlag: false,
            accountOpts: [],
            loading: false,
            formData: {},
            shareFormData: {},
            formFields: [
                { id: 'uniqueName', label: '用户名', type: 'text', value: '', required: true, readonly: '1' },
                { id: 'comment', label: '备注', type: 'text', value: '', required: true, readonly: true },
                { id: 'expiresAt', label: '过期时间', type: 'date', value: '', required: true }
            ],
            accountFields: [
                { id: 'uniqueName', label: '用户名', type: 'text', value: '', required: true },
                { id: 'comment', label: '备注', type: 'text', value: '', required: true },
                { id: 'expiresAt', label: '过期时间', type: 'date', value: '', required: true }
            ],
            shareFields: [
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' }], required: true },
                { id: 'accountOptions', label: '选择账号', type: 'select', value: '', options: this.accountOpts }
            ]
        }
    },
    methods: {
        checkIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        async openChat(id, type) {
            if (id === null) {
                return
            }

            const loadingInstance = Loading.service({
                fullscreen: true,
                text: '加载中...',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            try {
                let response;
                const body = {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                };

                switch (type) {
                    case 1:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getGptShare?gptConfigId=${id}`, body);
                        break;
                    case 2:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getClaudeShare?claudeConfigId=${id}`, body);
                        break;
                    case 3:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getApiShare?apiConfigId=${id}`, body);
                        break;
                }

                if (response?.data?.status) {
                    window.open(response.data.data)
                }
            } catch (error) {
                console.error('请求失败:', error);
                this.$message.error('操作失败，请重试');
            } finally {
                loadingInstance.close();
            }
        },
        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },
        async fetchItems(email) {
            this.loading = true;
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/share/list?page=${this.currentPage}&size=10&emailAddr=${email}`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.tableData = response.data.data.data.map(item => ({
                        ...item,
                        loading: false,
                        actionLoading: false
                    }));
                    this.total = response.data.data.total;
                }
            } catch (error) {
                message.error(error)
            } finally {
                this.loading = false;
            }
        },
        handleUpdateValue(fieldId, newValue) {
            this.$set(this.formData, fieldId, newValue);
            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }
        },
        showModal() {
            this.modalTitle = '新增账号';
            this.currentIndex = null;
            this.formFields = this.accountFields;
            this.resetFormFields();
            this.modalVisible = true;
        },
        async showShareModal(id) {
            this.shareAddFlag = true;
            this.modalTitle = '激活';
            this.currentIndex = id;
            this.formFields = this.shareFields;
            this.resetFormFields();
            this.modalVisible = true;
            this.activateFlag = true;

            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=1`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                this.accountOpts = response.data.data;
                const newF = this.shareFields.find(f => f.id === "accountOptions");
                if (newF) {
                    newF.options = this.accountOpts;
                    this.formData = {
                        'accountId': parseInt(this.accountOpts[0]?.value),
                        'id': id
                    };
                }
            } catch (error) {
                message.error('获取账号选项失败');
            }
        },
        async editItem(index) {
            this.modalTitle = '编辑共享';
            this.formFields = this.accountFields;
            this.currentIndex = index;

            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/share/getById?id=${index}`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                let acc = response.data.data;
                this.formFields.forEach(field => {
                    field.value = acc[field.id];
                    this.formData[field.id] = acc[field.id];
                });
                this.modalVisible = true;
            } catch (error) {
                message.error('获取共享信息失败');
            }
        },
        closeModal() {
            this.modalVisible = false;
            this.shareAddFlag = false;
            this.activateFlag = false;
            this.formData = {};
        },
        async submitForm() {
            const itemData = { ...this.formData };
            const item = this.tableData.find(item => item.id === this.currentIndex);
            if (item) {
                item.actionLoading = true;
            }

            try {
                if (this.activateFlag) {
                    itemData.accountId = itemData.accountOptions ? parseInt(itemData.accountOptions) : itemData.accountId;
                    itemData.id = this.currentIndex;
                    itemData.accountType = parseInt(itemData.accountType);

                    const response = await apiClient.post(`${config.apiBaseUrl}/share/distribute`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (response.data.status) {
                        message.success('激活成功');
                    } else {
                        message.error(response.data.message);
                    }
                } else if (this.currentIndex !== null) {
                    itemData.id = this.currentIndex;
                    const response = await apiClient.patch(`${config.apiBaseUrl}/share/update`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (response.data.status) {
                        message.success("编辑成功");
                    }
                }
            } catch (error) {
                message.error('操作失败');
            } finally {
                if (item) {
                    item.actionLoading = false;
                }
                await this.fetchItems('');
                this.closeModal();
            }
        },
        resetFormFields() {
            this.shareAdd = false;
            this.formData = {};
            this.formFields.forEach(field => {
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.formData[field.id] = defaultValue;
            });
        },
        emailQuery() {
            this.fetchItems(this.email);
        },
        async handleDelete() {
            const item = this.tableData.find(item => item.id === this.currentIndex);
            if (item) {
                item.actionLoading = true;
            }

            try {
                const response = await apiClient.delete(`${config.apiBaseUrl}/share/delete?id=${this.currentIndex}`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                if (response.data.status) {
                    message.success('删除成功');
                } else {
                    message.error('删除失败，请稍后重试');
                }
            } catch (error) {
                message.error('删除失败');
            } finally {
                if (item) {
                    item.actionLoading = false;
                }
                await this.fetchItems('');
                this.isDialogVisible = false;
            }
        },
        handleCurrentChange() {
            this.fetchItems('');
        },
        async handleSelectChange({ type, field, value }) {
            if (type === 1 && field.id !== "accountOptions") {
                try {
                    const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=${value}`, {
                        withCredentials: true,
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    this.accountOpts = response.data.data;
                    field.value = value;
                    const newF = this.shareFields.find(f => f.id === "accountOptions");
                    if (newF) {
                        newF.options = this.accountOpts;
                    }
                } catch (error) {
                    message.error('获取账号选项失败');
                }
            }
        },
    },
    mounted() {
        this.fetchItems('');
        this.checkIsMobile();
        window.addEventListener('resize', this.checkIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkIsMobile);
    }
}
</script>
<style scoped>
/* 基础布局 */
.panel {
    background-color: #ffffff;
    border-radius: 16px;
    margin: 1.5% 20px;
    min-height: calc(100vh - 40px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
}

/* 搜索栏样式 */
.search-bar {
    margin-bottom: 28px;
}

/* PC端表格相关样式 */
.pc-view {
    display: none;
}

.action-row {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
}

/* 移动端卡片样式 */
.mobile-view {
    display: none;
}

.mobile-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid rgba(235, 238, 245, 0.2);
}

.mobile-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.username-badge {
    background: linear-gradient(145deg, #f0f7ff, #e6f1ff);
    color: #409eff;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.expires-badge {
    color: #909399;
    font-size: 13px;
    font-weight: 500;
}

.mobile-card-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.account-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.account-label {
    color: #909399;
    font-size: 13px;
    font-weight: 500;
}

.account-value {
    width: 100%;
}

.mobile-card-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #ebeef5, transparent);
    margin: 20px 0;
}

.mobile-card-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mobile-card-actions .action-row {
    justify-content: space-between;
}

.mobile-card-actions .el-button {
    flex: 1;
    transition: all 0.3s ease;
}

/* 分页器样式 */
.pagination-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px;
    backdrop-filter: blur(8px);
    border-radius: 8px;
    z-index: 1000;
}

.pagination-wrapper {
    text-align: center;
}

/* Element UI 按钮样式优化 */
.el-button--primary {
    background: linear-gradient(145deg, #0e8f6f, #0d8668);
    border: none;
    box-shadow: 0 4px 12px rgba(14, 143, 111, 0.2);
}

.el-button--primary:hover,
.el-button--primary:focus {
    background: linear-gradient(145deg, #0fa67f, #0e9272);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(14, 143, 111, 0.3);
}

/* 响应式布局优化 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 12px;
        padding: 16px;
        border-radius: 20px;
    }

    .pc-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }

    .search-bar {
        margin-bottom: 20px;
    }

    .pagination-wrapper {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        padding: 12px 0;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        z-index: 1000;
    }
}

@media screen and (min-width: 769px) {
    .pc-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }
}

.pagination-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px;
    backdrop-filter: blur(8px);
    border-radius: 8px;
    z-index: 1000;
}

.pagination-wrapper {
    text-align: center;
}

/* 移动端分页器样式优化 */
@media screen and (max-width: 768px) {
    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        padding: 6px 0;
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
        z-index: 1000;
        height: 44px;
    }

    :deep(.el-pagination) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        padding: 0 16px;
        height: 100%;
    }

    :deep(.el-pagination .btn-prev),
    :deep(.el-pagination .btn-next) {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 4px;
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
    }

    :deep(.el-pagination .number) {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        margin: 0 4px;
        border-radius: 16px;
        font-weight: 500;
    }

    .mobile-card:last-child {
        margin-bottom: 56px;
    }

    :deep(.el-pagination .active) {
        background: linear-gradient(145deg, #0e8f6f, #0d8668);
        color: white;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(14, 143, 111, 0.2);
    }

    .el-main {
        padding-bottom: calc(56px + env(safe-area-inset-bottom));
    }
}

/* 暗色主题优化 */
@media (prefers-color-scheme: dark) {
    @media screen and (max-width: 768px) {
        .pagination-container {
            background: rgba(30, 30, 30, 0.98);
            box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.2);
        }

        :deep(.el-pagination) {
            color: #e0e0e0;
        }

        :deep(.el-pagination .active) {
            background: linear-gradient(145deg, #0e8f6f, #0d8668);
            box-shadow: 0 2px 8px rgba(14, 143, 111, 0.3);
        }
    }
}
</style>
