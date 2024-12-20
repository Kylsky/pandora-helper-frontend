<template>
    <el-container id="redemptionPanel" class="panel">
        <el-header>
            <h2>兑换码管理</h2>
        </el-header>
        <el-main>
            <!-- 响应式搜索栏 -->
            <el-row class="search-bar">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email" @keyup.enter.native="emailQuery">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :xs="24" :sm="6" :md="6" class="btn-col">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-if="!isMobile" class="pc-view">
                <el-table :data="tableData" style="width: 100%" v-loading="loading" :cell-style="{padding: '12px 0'}">
                    <el-table-column prop="email" label="名称" min-width="200" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i class="el-icon-user" style="color: #909399; font-size: 14px;"></i>
                                <span>{{ scope.row.email }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="accountType" label="账号类型" width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <el-tag size="mini" effect="plain" :type="scope.row.accountType === 'ChatGPT' ? 'success' : scope.row.accountType === 'Claude' ? 'warning' : 'info'">
                                {{ scope.row.accountType }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="code" label="兑换码" min-width="180" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.code" placement="top" effect="light">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <i class="el-icon-key" style="color: #909399; font-size: 14px;"></i>
                                    <span>{{ scope.row.code }}</span>
                                </div>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="duration" label="兑换时长" width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i class="el-icon-time" style="color: #909399; font-size: 14px;"></i>
                                <span>{{ scope.row.duration }} 天</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" fixed="right">
                        <template slot-scope="scope">
                            <div class="action-row" style="display: flex; gap: 8px;">
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)">
                                    <i class="el-icon-edit"></i> 编辑
                                </el-button>
                                <el-button type="danger" size="mini" @click="showConfirmDialog(scope.row.id)">
                                    <i class="el-icon-delete"></i> 删除
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-else class="mobile-view">
                <div v-loading="loading">
                    <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
                        <div class="mobile-card-header">
                            <div class="email-badge">
                                <i class="el-icon-message"></i>
                                <el-tooltip :content="item.email" placement="top" effect="light">
                                    <span>{{ item.email }}</span>
                                </el-tooltip>
                            </div>
                            <div class="type-badge">
                                {{ item.accountType }}
                            </div>
                        </div>

                        <div class="mobile-card-content">
                            <div class="info-row">
                                <div class="info-item">
                                    <div class="info-label">
                                        <i class="el-icon-key"></i>
                                        兑换码
                                    </div>
                                    <div class="info-value">
                                        <el-tooltip :content="item.code" placement="top" effect="light">
                                            <span>{{ item.code }}</span>
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">
                                        <i class="el-icon-time"></i>
                                        兑换时长
                                    </div>
                                    <div class="info-value">{{ item.duration }} 天</div>
                                </div>
                            </div>
                        </div>

                        <div class="mobile-card-divider"></div>

                        <div class="mobile-card-actions">
                            <div class="action-row">
                                <el-button type="warning" size="mini" @click="editItem(item.id)">
                                    <i class="el-icon-edit"></i> 编辑
                                </el-button>
                                <el-button type="danger" size="mini" @click="showConfirmDialog(item.id)">
                                    <i class="el-icon-delete"></i> 删除
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 响应式分页器 -->
            <div class="pagination-container">
                <el-pagination 
                    @current-change="handleCurrentChange" 
                    :current-page.sync="currentPage" 
                    :page-size="pageSize"
                    :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
                    :pager-count="isMobile ? 5 : 7"
                    :total="total"
                    class="pagination-wrapper">
                </el-pagination>
            </div>

            <!-- 弹窗组件 -->
            <enhanced-dialog 
                :isVisible="modalVisible" 
                :title="modalTitle" 
                @close="closeModal"
                @confirm="submitForm">
                <form-input 
                    v-for="(field, index) in formFields" 
                    :key="index" 
                    :field="field"
                    @updateValue="handleUpdateValue" 
                    @handleSelectChange="handleSelectChange" />
            </enhanced-dialog>

            <confirm-dialog 
                :visible.sync="isDialogVisible" 
                title="确认删除" 
                message="你确定要删除这个兑换码吗？"
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
import message from '@/configs/message'
import { debounce } from 'lodash'

export default {
    name: 'RedemptionPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
    },
    data() {
        return {
            isMobile: false,
            email: '',
            tableData: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            isDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null,
            formData: {},
            formFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options:[] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            accountFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options:[] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            shareFields: [
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
            ]
        }
    },
    methods: {
        checkIsMobile: debounce(function() {
            this.isMobile = window.innerWidth <= 768;
        }, 200),

        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },

        async fetchItems(email) {
            try {
                this.loading = true;
                const response = await apiClient.get(`${config.apiBaseUrl}/redemption/list`, {
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        emailAddr: email
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    this.tableData = response.data.data.data;
                    this.total = response.data.data.total;
                }
            } catch (error) {
                message.error(error.message || '获取数据失败');
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

        async showModal() {
            try {
                this.modalTitle = '新增兑换码';
                this.currentIndex = null;
                this.formFields = this.accountFields;
                this.resetFormFields();
                this.modalVisible = true;

                const response = await apiClient.get(`${config.apiBaseUrl}/account/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const accountField = this.accountFields.find(f => f.id === "accountId");
                if (accountField && response.data.status) {
                    accountField.options = response.data.data.data.map(item => ({
                        text: `${item.name}(${item.accountType === 1 ? 'ChatGPT' : item.accountType === 2 ? 'Claude' : 'API'})`,
                        value: item.id
                    }));
                }
            } catch (error) {
                message.error(error.message || '获取账号列表失败');
            }
        },

        async editItem(index) {
            try {
                this.modalTitle = '编辑兑换码';
                this.formFields = this.shareFields;
                this.currentIndex = index;

                const response = await apiClient.get(`${config.apiBaseUrl}/redemption/getById`, {
                    params: { id: index },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    const acc = response.data.data;
                    this.formFields.forEach(field => {
                        field.value = acc[field.id];
                        this.$set(this.formData, field.id, acc[field.id]);
                    });
                    this.modalVisible = true;
                }
            } catch (error) {
                message.error(error.message || '获取兑换码详情失败');
            }
        },

        closeModal() {
            this.modalVisible = false;
            this.currentIndex = null;
            this.formData = {};
        },

        async submitForm() {
            try {
                const itemData = { ...this.formData };
                
                if (!this.currentIndex) {
                    // 新增
                    itemData.accountId = parseInt(itemData.accountId);
                    itemData.count = parseInt(itemData.count);
                    itemData.duration = parseInt(itemData.duration);

                    const response = await apiClient.post(`${config.apiBaseUrl}/redemption/add`, itemData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data.status) {
                        message.success('新增成功');
                    } else {
                        throw new Error(response.data.message);
                    }
                } else {
                    // 编辑
                    itemData.id = this.currentIndex;
                    itemData.duration = parseInt(itemData.duration);

                    const response = await apiClient.patch(`${config.apiBaseUrl}/redemption/update`, itemData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data.status) {
                        message.success('更新成功');
                    } else {
                        throw new Error('更新失败');
                    }
                }

                this.closeModal();
                this.fetchItems('');
            } catch (error) {
                message.error(error.message || '操作失败');
            }
        },

        resetFormFields() {
            this.formData = {};
            this.formFields.forEach(field => {
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.$set(this.formData, field.id, defaultValue);
            });
        },

        emailQuery: debounce(function() {
            this.currentPage = 1;
            this.fetchItems(this.email);
        }, 300),

        async handleDelete() {
            try {
                const response = await apiClient.delete(`${config.apiBaseUrl}/redemption/delete`, {
                    params: { id: this.currentIndex },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    message.success('删除成功');
                    this.fetchItems('');
                } else {
                    throw new Error('删除失败');
                }
            } catch (error) {
                message.error(error.message || '删除失败');
            } finally {
                this.isDialogVisible = false;
            }
        },

        handleCurrentChange(val) {
            this.currentPage = val;
            this.fetchItems(this.email);
        },

        handleSelectChange({ type, field, value }) {
            console.log('Select changed:', { type, field, value });
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

/* 搜索栏 */
.search-bar {
    margin-bottom: 28px;
}

.btn-col {
    display: flex;
    justify-content: flex-end;
}

.create-new {
    margin-top: 0;
    transition: all 0.3s ease;
}

.create-new:hover {
    transform: translateY(-2px);
}

/* PC端表格样式 */
.action-row {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
}

/* 移动端卡片样式 */
.mobile-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(235, 238, 245, 0.6);
}

.mobile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.email-badge {
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

.type-badge {
    background: linear-gradient(145deg, #f0f9eb, #e7f6e1);
    color: #67c23a;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
}

.info-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-label {
    color: #909399;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.85;
}

.info-value {
    color: #303133;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-card-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #ebeef5, transparent);
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

.mobile-card-actions .el-button:hover {
    transform: translateY(-2px);
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
    transition: all 0.3s ease;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background: linear-gradient(145deg, #2980b9, #2574ab);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(41, 128, 185, 0.2);
}

/* 响应式布局优化 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 12px;
        padding: 16px;
        border-radius: 24px;
    }

    .search-bar {
        margin-bottom: 20px;
    }

    .btn-col {
        margin-top: 12px;
    }

    .create-new {
        width: 100%;
    }

    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        padding: 12px;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
        z-index: 1000;
        margin: 0;
    }

    .panel {
        padding-bottom: 72px;
    }

    .mobile-card-actions .el-button {
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 12px;
    }
}

@media screen and (min-width: 769px) {
    .btn-col {
        justify-content: flex-end;
    }

    .create-new {
        width: auto;
    }
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
