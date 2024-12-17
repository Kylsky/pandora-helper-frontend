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
                <el-table :data="tableData" style="width: 100%" :fit="true">
                    <el-table-column prop="uniqueName" label="用户名"></el-table-column>
                    <el-table-column prop="gptCarName" label="ChatGPT账号" width="180">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.gptCarName" :count="scope.row.gptUserCount || 0" type="gpt"
                                :loading="scope.row.loading" @click="openChat(scope.row.gptConfigId, 1, scope)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="claudeCarName" label="Claude账号" width="180">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.claudeCarName" :count="scope.row.claudeUserCount || 0"
                                type="claude" :loading="scope.row.loading"
                                @click="openChat(scope.row.claudeConfigId, 2, scope)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="apiCarName" label="API账号" width="180">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.apiCarName" :count="scope.row.apiUserCount || 0" type="api"
                                :loading="scope.row.loading" @click="openChat(scope.row.apiConfigId, 3, scope)" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="expiresAt" label="过期时间"></el-table-column>
                    <el-table-column label="操作" width="250">
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
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
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
                                    :loading="item.loading" @click="openChat(item.gptConfigId, 1, item)" />
                            </div>
                        </div>

                        <div class="account-item" v-if="item.claudeCarName">
                            <div class="account-label">Claude账号</div>
                            <div class="account-value">
                                <split-button :name="item.claudeCarName" :count="item.claudeUserCount || 0"
                                    type="claude" :loading="item.loading"
                                    @click="openChat(item.claudeConfigId, 2, item)" />
                            </div>
                        </div>

                        <div class="account-item" v-if="item.apiCarName">
                            <div class="account-label">API账号</div>
                            <div class="account-value">
                                <split-button :name="item.apiCarName" :count="item.apiUserCount || 0" type="api"
                                    :loading="item.loading" @click="openChat(item.apiConfigId, 3, item)" />
                            </div>
                        </div>
                    </div>

                    <div class="mobile-card-divider"></div>

                    <div class="mobile-card-actions">
                        <div class="action-row">
                            <el-button type="primary" size="mini" @click="showShareModal(item.id)">激活</el-button>
                            <el-button type="warning" size="mini" @click="editItem(item.id)">编辑</el-button>
                            <el-button type="danger" size="mini" @click="showConfirmDialog(item.id)">删除</el-button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pagination-container">
                <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                    :layout="isMobile ? 'prev, pager, next' : 'prev, pager, next, jumper'"
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
            tableData: [], // 这里应该填充实际的表格数据
            currentPage: 1,
            total: 0,
            isDialogVisible: false,
            isAccDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null, // 用于追踪当前编辑的项目索引
            activateFlag: false,
            accountOpts: [],

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
        async openChat(id, type, scope) {
            if (id === null) {
                return
            }

            const loading = Loading.service({
                target: scope ? scope.el : document.body,
                text: '加载中...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.7)'
            });
            try {
                if (type === 1) {
                    const response = await apiClient.get(`${config.apiBaseUrl}/share/getGptShare?gptConfigId=` + id, {
                        withCredentials: true,
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    if (response.data.status) {
                        window.open(response.data.data)
                    }
                }
                else if (type === 2) {
                    const response = await apiClient.get(`${config.apiBaseUrl}/share/getClaudeShare?claudeConfigId=` + id, {
                        withCredentials: true,
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    if (response.data.status) {
                        window.open(response.data.data)
                    }
                }
                else if (type === 3) {
                    const response = await apiClient.get(`${config.apiBaseUrl}/share/getApiShare?apiConfigId=` + id, {
                        withCredentials: true,
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    if (response.data.status) {
                        window.open(response.data.data)
                    }
                }
            } catch (error) {
                console.error('请求失败:', error);
                // 可以在这里添加错误提示
                this.$message.error('操作失败，请重试');
            } finally {
                // 无论成功失败都关闭 loading
                loading.close();
            }


        },
        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },
        async fetchItems(email) {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/share/list?page=` + this.currentPage + `&size=` + 10 + `&emailAddr=` + email, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.tableData = response.data.data.data
                    this.total = response.data.data.total
                }
            } catch (error) {
                message.error(error)
            }

        },
        handleUpdateValue(fieldId, newValue) {
            // 更新 formData 中对应字段的值
            // this.formData[fieldId] = newValue;
            this.$set(this.formData, fieldId, newValue)

            // 更新 formFields 中对应字段的值
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
            this.formFields = this.shareFields
            this.resetFormFields();
            this.modalVisible = true;
            this.activateFlag = true;
            const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=1`, {
                withCredentials: true,
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            });
            this.accountOpts = response.data.data;
            const newF = this.shareFields.find(f => f.id === "accountOptions");
            if (newF) {
                // console.log(newF)
                newF.options = this.accountOpts;  // 更新 id 对应的字段
                // newF.value = this.accountOpts[0].value
                this.formData = { 'accountId': parseInt(this.accountOpts[0].value), 'id': id }
                // console.log(this.formData)
            }
        },
        async editItem(index) {
            this.modalTitle = '编辑共享';
            this.formFields = this.accountFields;
            this.currentIndex = index;
            const response = await apiClient.get(`${config.apiBaseUrl}/share/getById?id=` + index, {
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
        },
        closeModal() {
            this.modalVisible = false;
            this.shareAddFlag = false;
        },
        async submitForm() {
            const itemData = { ...this.formData };
            if (this.activateFlag) {
                console.log(itemData)
                itemData.accountId = itemData.accountOptions ? parseInt(itemData.accountOptions) : itemData.accountId
                itemData.id = this.currentIndex
                itemData.accountType = parseInt(itemData.accountType)

                const response = await apiClient.post(`${config.apiBaseUrl}/share/distribute`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                });
                if (response.data.status) {
                    message.success('激活成功');
                } else {
                    message.error(response.data.message);
                }
                this.fetchItems('')
                this.currentIndex = null;
                this.activateFlag = false;
            }
            else if (this.currentIndex !== null) {
                itemData.id = this.currentIndex;
                const response = await apiClient.patch(`${config.apiBaseUrl}/share/update`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
                if (response.data.status) {
                    message.success("编辑成功")
                }
            }
            this.fetchItems('')
            this.closeModal();

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
            // 实现邮箱查询逻辑
            this.fetchItems(this.email)
        },
        async handleDelete() {
            // 实现删除逻辑
            const response = await apiClient.delete(`${config.apiBaseUrl}/share/delete?id=` + this.currentIndex, {
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
            this.fetchItems('')
            this.isDialogVisible = false
        },
        handleCurrentChange(val) {
            // 处理页码变化
            console.log(val)
            this.fetchItems('')
        },
        async handleSelectChange({ type, field, value }) {
            if (type == 1 && field.id != "accountOptions") {
                const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=` + value, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                this.accountOpts = response.data.data;
                field.value = value
                const newF = this.shareFields.find(f => f.id === "accountOptions");
                if (newF) {
                    // console.log(newF)
                    newF.options = this.accountOpts;  // 更新 id 对应的字段
                }
            } else {
                console.log(field)
            }

        },
    },
    mounted() {
        this.fetchItems('');
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
.panel {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 15px;
    margin: 1% 15px;
    height: 97%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 搜索栏样式 */
.search-bar {
    margin-bottom: 20px;
}

/* PC端表格相关样式 */
.pc-view {
    display: none;
}

.action-row {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
}

/* 移动端卡片样式 */
.mobile-view {
    display: none;
}

.mobile-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
}

.mobile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.username-badge {
    background: #f0f7ff;
    color: #409eff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.expires-badge {
    color: #909399;
    font-size: 13px;
}

.mobile-card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.account-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.account-label {
    color: #909399;
    font-size: 13px;
}

.account-value {
    width: 100%;
}

.mobile-card-divider {
    height: 1px;
    background: #ebeef5;
    margin: 16px 0;
}

.mobile-card-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mobile-card-actions .action-row {
    justify-content: space-between;
}

.mobile-card-actions .el-button {
    flex: 1;
}

/* 分页器样式 */
.pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

/* Element UI 按钮样式 */
.el-button--primary {
    background-color: #0e8f6f;
    border-color: #0e8f6f;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background-color: #2980b9;
    border-color: #2980b9;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 10px;
        padding: 10px;
    }

    .pc-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }

    .search-bar {
        margin-bottom: 16px;
    }

    .pagination-wrapper {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        padding: 10px 0;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
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
    position: relative;
    width: 100%;
    margin-top: 20px;
    padding: 10px 0;
}

.pagination-wrapper {
    text-align: center;
}

/* 移动端样式优化 */



/* 移动端分页器样式 */
@media screen and (max-width: 768px) {
    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 4px 0;
        box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        height: 36px;
    }

    /* Element UI 分页器组件样式 */
    :deep(.el-pagination) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        padding: 0 12px;
        height: 100%;
    }

    :deep(.el-pagination .btn-prev),
    :deep(.el-pagination .btn-next) {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 2px;
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        border-radius: 14px;
    }

    :deep(.el-pagination .number) {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        margin: 0 2px;
        border-radius: 14px;
    }

    /* 移动端卡片布局调整 */
    .mobile-card:last-child {
        margin-bottom: 48px; /* 确保最后一张卡片不被分页器遮挡 */
    }


    /* 当前页码突出显示 */
    :deep(.el-pagination .active) {
        background-color: #0e8f6f;
        color: white;
        border-radius: 4px;
    }

    /* 调整内容区域的下边距 */
    .el-main {
        padding-bottom: calc(48px + env(safe-area-inset-bottom)); /* 适配全面屏 */
    }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
    @media screen and (max-width: 768px) {
        .pagination-container {
            background: rgba(30, 30, 30, 0.95);
            box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.15);
        }

        :deep(.el-pagination) {
            color: #e0e0e0;
        }
    }
}
</style>