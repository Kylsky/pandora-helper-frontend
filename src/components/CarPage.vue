<template>
    <el-container id="carPanel" class="panel">
        <el-header>
            <h2>停车场</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="输入车主名称查询" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-show="!isMobile" class="pc-view">
                <el-table :data="tableData" style="width: 100%" v-loading="loading" :cell-style="{padding: '12px 0'}">
                    <el-table-column prop="email" label="账号" min-width="180" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i class="el-icon-message" style="color: #909399; font-size: 14px;"></i>
                                <span>{{ scope.row.email }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="账号类型" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span>{{ scope.row.type }}</span>
                            <template v-if="scope.row.type === 'ChatGPT'">
                                <el-tag v-if="scope.row.planType === 'plus'" type="warning" effect="plain" size="mini" style="margin-left: 5px; color: #DAA520; border-color: #DAA520">Plus</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'free'" type="success" effect="plain" size="mini" style="margin-left: 5px; color: #67C23A; border-color: #67C23A">Free</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'team'" type="info" effect="plain" size="mini" style="margin-left: 5px; color: #87CEEB; border-color: #87CEEB">Team</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'pro'" type="info" effect="plain" size="mini" style="margin-left: 5px; color: #000000; border-color: #FFD700">Pro</el-tag>
                                <el-tag v-else type="info" effect="plain" size="mini" style="margin-left: 5px; color: #808080; border-color: #808080">无效</el-tag>
                            </template>
                        </template>
                    </el-table-column>
                    <el-table-column prop="auto" label="自动上车" width="120" align="center">
                        <template slot-scope="scope">
                            <span :class="['status-tag', scope.row.auto === 1 ? 'status-yes' : 'status-no']">
                                {{ scope.row.auto === 1 ? 'yes!' : 'No' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="usernameDesc" label="车主" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i class="el-icon-user" style="color: #909399; font-size: 14px;"></i>
                                <span>{{ scope.row.usernameDesc }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="countDesc" label="已上车人数 / 总人数" min-width="160" align="center">
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <span style="color: #67C23A; font-weight: 600">{{ scope.row.countDesc.split('/')[0] }}</span>
                                <span style="color: #909399">/</span>
                                <span style="color: #409EFF; font-weight: 600">{{ scope.row.countDesc.split('/')[1] }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="280" fixed="right">
                        <template slot-scope="scope">
                            <div class="action-buttons" style="display: flex; gap: 8px;">
                                <el-button v-if="scope.row.authorized === true" type="primary" size="mini"
                                    @click="showModal(scope.row.id)">审核</el-button>
                                <el-button type="warning" size="mini"
                                    @click="contact(scope.row.username)">联系车主</el-button>
                                <el-button type="success" size="mini" @click="applyCar(scope.row.id)">我要上车</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-show="isMobile" class="mobile-view">
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
                    <div class="mobile-card-header">
                        <div class="account-badge">
                            <i class="el-icon-user"></i>
                            {{ item.email }}
                        </div>
                        <div :class="['auto-badge', item.auto === 1 ? 'auto-yes' : 'auto-no']">
                            {{ item.auto === 1 ? '自动上车' : '审核上车' }}
                        </div>
                    </div>

                    <div class="mobile-card-content">
                        <div class="info-row">
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="el-icon-key"></i>
                                    账号类型
                                </div>
                                <div class="info-value">{{ item.type }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="el-icon-user"></i>
                                    车主
                                </div>
                                <div class="info-value">{{ item.usernameDesc }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="el-icon-s-data"></i>
                                    上车情况
                                </div>
                                <div class="info-value">{{ item.countDesc }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mobile-card-divider"></div>

                    <div class="mobile-card-actions">
                        <div class="action-row">
                            <el-button v-if="item.authorized === true" type="primary" size="mini"
                                @click="showModal(item.id)">
                                <i class="el-icon-check"></i> 审核
                            </el-button>
                            <el-button type="warning" size="mini" @click="contact(item.username)">
                                <i class="el-icon-message"></i> 联系车主
                            </el-button>
                            <el-button type="success" size="mini" @click="applyCar(item.id)">
                                <i class="el-icon-plus"></i> 上车
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页器 -->
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

            <el-dialog :visible.sync="auditVisible" title="审核申请" :width="isMobile ? '95%' : '360px'" :fullscreen="false"
                custom-class="modern-audit-dialog">
                <div class="audit-content">
                    <el-checkbox-group v-model="auditValues" class="audit-checkbox-group">
                        <el-checkbox v-for="item in auditOptions" :key="item.value" :label="item.value"
                            class="audit-checkbox-item">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
                <div slot="footer" class="dialog-footer">
                    <el-button size="small" type="danger" @click="submitAudit(0)">拒绝</el-button>
                    <el-button size="small" type="primary" @click="submitAudit(1)">通过</el-button>
                </div>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import { EventBus } from '../configs/eventBus';
import message from '@/configs/message'

export default {
    name: 'SharePage',

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
            auditVisible: false,
            auditValues: [],
            auditOptions: [],
            auditCarId: null,
            loading: false,

            formData: {},
            shareFormData: {},
            formFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options: [] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            accountFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options: [] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            shareFields: [
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
            ]
        }
    },
    methods: {
        checkIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        async jump() {
            EventBus.$emit('envVariableChanged', 'jump');
        },
        async submitAudit(flag) {
            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/car/audit`, { 
                    'accountId': this.auditCarId, 
                    'allowApply': flag, 
                    'ids': this.auditValues 
                }, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                
                if (response.data.status) {
                    message.success("审核成功")
                } else {
                    message.error(response.data.message);
                }
                
                this.auditVisible = false;
                this.auditValues = [];
                this.auditCarId = null;
                this.fetchItems('');
            } catch (error) {
                message.error(error)
            }
        },
        async applyCar(id) {
            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/car/apply`, { 'accountId': id }, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                
                if (response.data.status) {
                    message.success('申请成功');
                } else {
                    message.error(response.data.message);
                }
                this.closeModal()
            } catch (error) {
                message.error(error)
            }
        },
        async fetchItems(email) {
            this.loading = true;
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/car/list?page=${this.currentPage}&size=10&owner=${email}`, {
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
            } finally {
                this.loading = false;
            }
        },
        handleUpdateValue(fieldId, newValue) {
            this.$set(this.formData, fieldId, newValue)
            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }
        },
        async showModal(id) {
            try {
                this.auditVisible = true;
                this.auditCarId = id;
                const response = await apiClient.get(`${config.apiBaseUrl}/car/fetchApplies?accountId=${this.auditCarId}`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                this.auditOptions = response.data.data;
            } catch (error) {
                message.error(error)
            }
        },
        contact(contact) {
            window.open("https://linux.do/u/" + contact + "/summary")
        },
        closeModal() {
            this.modalVisible = false;
            this.shareAddFlag = false;
            this.currentIndex = null;
        },
        async submitForm() {
            const itemData = { ...this.formData };
            try {
                if (!this.currentIndex) {
                    itemData.accountId = parseInt(itemData.accountId)
                    itemData.count = parseInt(itemData.count)
                    itemData.duration = parseInt(itemData.duration)

                    const response = await apiClient.post(`${config.apiBaseUrl}/redemption/add`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    
                    if (response.data.status) {
                        message.success('新增成功');
                    } else {
                        message.error(response.data.message);
                    }
                    this.closeModal()
                } else {
                    itemData.id = this.currentIndex;
                    itemData.duration = parseInt(itemData.duration)
                    await apiClient.patch(`${config.apiBaseUrl}/redemption/update`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                }
                this.fetchItems('')
                this.closeModal();
            } catch (error) {
                message.error(error)
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
            this.fetchItems(this.email)
        },
        handleCurrentChange() {
            this.fetchItems('')
        },
        async handleSelectChange({ type, field, value }) {
            console.log(type, field, value)
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
    /* padding: 10px; */
    margin: 1.5% 20px;
    min-height: calc(100vh - 40px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
}

/* 搜索栏 */
.search-bar {
    margin-bottom: 28px;
    transition: all 0.3s ease;
}

.search-input {
    width: 100%;
}

/* 视图切换 */
.pc-view, .mobile-view {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 状态标签 */
.status-tag {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
}

.status-yes {
    background: linear-gradient(135deg, #f0f9eb 0%, #e7f6e1 100%);
    color: #67c23a;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.15);
}

.status-no {
    background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
    color: #909399;
    box-shadow: 0 2px 8px rgba(144, 147, 153, 0.15);
}

/* 移动端卡片 */
.mobile-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(235, 238, 245, 0.6);
    backdrop-filter: blur(12px);
}

.mobile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

/* 操作按钮 */
.action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.action-buttons .el-button {
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(4px);
}

.action-buttons .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 12px;
        padding: 16px;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-buttons .el-button {
        width: 100%;
    }
}

/* 暗色主题优化 */
@media (prefers-color-scheme: dark) {
    /* 基础布局 */
    .panel {
        background: rgba(30, 30, 30, 0.95);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    h2 {
        color: #e0e0e0;
    }

    /* 搜索栏 */
    .search-bar {
        background: transparent;
    }

    .el-input__inner {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: #e0e0e0;
    }

    .el-input__inner:hover {
        border-color: rgba(14, 143, 111, 0.5);
    }

    .el-input__inner:focus {
        border-color: #0e8f6f;
    }

    .el-input-group__append {
        background: rgba(14, 143, 111, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-left: none;
        color: #e0e0e0;
    }

    /* 表格样式 */
    .el-table {
        background-color: transparent;
    }

    .el-table th,
    .el-table tr {
        background-color: transparent;
        color: #e0e0e0;
    }

    .el-table td,
    .el-table th.is-leaf {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background-color: transparent;
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .el-table--border::after, 
    .el-table--group::after, 
    .el-table::before {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .el-table--border, 
    .el-table--group {
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* 状态标签 */
    .status-tag {
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.05);
    }

    .status-yes {
        background: linear-gradient(145deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
        color: #95d475;
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
    }

    .status-no {
        background: linear-gradient(145deg, rgba(144, 147, 153, 0.1), rgba(144, 147, 153, 0.05));
        color: #a6a9ad;
        box-shadow: 0 2px 8px rgba(144, 147, 153, 0.1);
    }

    /* 移动端卡片样式 */
    .mobile-card {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .mobile-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 账号徽章 */
    .account-badge {
        background: linear-gradient(145deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
        color: #7eb6ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(64, 158, 255, 0.1);
    }

    /* 自动上车徽章 */
    .auto-badge {
        background: rgba(255, 255, 255, 0.05);
        color: #909399;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .auto-yes {
        background: linear-gradient(145deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
        color: #95d475;
        border: 1px solid rgba(103, 194, 58, 0.1);
    }

    .auto-no {
        background: linear-gradient(145deg, rgba(144, 147, 153, 0.1), rgba(144, 147, 153, 0.05));
        color: #a6a9ad;
        border: 1px solid rgba(144, 147, 153, 0.1);
    }

    /* 信息文本 */
    .info-label {
        color: #909399;
    }

    .info-value {
        color: #e0e0e0;
    }

    /* 分割线 */
    .mobile-card-divider {
        background: linear-gradient(90deg, 
            transparent,
            rgba(255, 255, 255, 0.05) 20%,
            rgba(255, 255, 255, 0.05) 80%,
            transparent
        );
    }

    /* 按钮样式 */
    .el-button {
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.05);
        color: #e0e0e0;
    }

    .el-button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .el-button--primary {
        background: linear-gradient(145deg, #0e8f6f, #0d8668);
        border: none;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(14, 143, 111, 0.1);
    }

    .el-button--primary:hover {
        background: linear-gradient(145deg, #10a37f, #0f9973);
        box-shadow: 0 6px 16px rgba(14, 143, 111, 0.2);
    }

    .el-button--warning {
        background: linear-gradient(145deg, #946c00, #855f00);
        border: none;
        color: #ffffff;
    }

    .el-button--warning:hover {
        background: linear-gradient(145deg, #a37800, #946c00);
    }

    .el-button--danger {
        background: linear-gradient(145deg, #c53030, #b52b2b);
        border: none;
        color: #ffffff;
    }

    .el-button--danger:hover {
        background: linear-gradient(145deg, #d13b3b, #c53030);
    }

    /* 弹窗样式 */
    .el-dialog {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .el-dialog__title {
        color: #e0e0e0;
    }

    .el-dialog__body {
        color: #e0e0e0;
    }

    /* 表单样式 */
    .el-form-item__label {
        color: #909399;
    }

    .el-checkbox__label {
        color: #e0e0e0;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #0e8f6f;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #0e8f6f;
        border-color: #0e8f6f;
    }

    /* 下拉菜单 */
    .el-select-dropdown {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .el-select-dropdown__item {
        color: #e0e0e0;
    }

    .el-select-dropdown__item.hover,
    .el-select-dropdown__item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .el-select-dropdown__item.selected {
        color: #0e8f6f;
        background: rgba(14, 143, 111, 0.1);
    }

    /* 日期选择器 */
    .el-date-picker {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .el-date-picker__header-label {
        color: #e0e0e0;
    }

    .el-date-table th {
        color: #909399;
    }

    .el-date-table td {
        color: #e0e0e0;
    }

    .el-date-table td.available:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .el-date-table td.current:not(.disabled) {
        background: #0e8f6f;
        color: #ffffff;
    }

    /* 移动端分页器 */
    @media screen and (max-width: 768px) {
        .pagination-container {
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(20px);
            box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination) {
            color: #909399;
        }

        :deep(.el-pagination .btn-prev),
        :deep(.el-pagination .btn-next) {
            background: transparent;
            color: #909399;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination .btn-prev:hover),
        :deep(.el-pagination .btn-next:hover) {
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
        }

        :deep(.el-pagination .number) {
            color: #909399;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination .number:hover) {
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
        }

        :deep(.el-pagination .active) {
            background: linear-gradient(145deg, #0e8f6f, #0d8668);
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(14, 143, 111, 0.3);
        }

        :deep(.el-pagination .active:hover) {
            background: linear-gradient(145deg, #10a37f, #0f9973);
        }
    }

    /* Loading 遮罩 */
    .el-loading-mask {
        background-color: rgba(0, 0, 0, 0.7);
    }

    .el-loading-spinner .path {
        stroke: #0e8f6f;
    }

    .el-loading-spinner .el-loading-text {
        color: #e0e0e0;
    }

    /* 图标颜色 */
    .el-icon-time,
    .el-icon-message,
    .el-icon-user {
        color: #909399;
    }

    .el-icon-circle-check {
        color: #95d475 !important;
    }

    .el-icon-circle-close {
        color: #f56c6c !important;
    }

    /* 提示框 */
    .el-tooltip__popper {
        background: rgba(40, 40, 40, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        color: #e0e0e0 !important;
    }

    .el-tooltip__popper[x-placement^=top] .popper__arrow::after {
        border-top-color: rgba(40, 40, 40, 0.95);
    }

    .el-tooltip__popper[x-placement^=bottom] .popper__arrow::after {
        border-bottom-color: rgba(40, 40, 40, 0.95);
    }
}

/* 搜索栏样式 */
.search-bar {
    margin-bottom: 20px;
}

/* PC端表格样式 */
.status-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-yes {
    background-color: #f0f9eb;
    color: #67c23a;
}

.status-no {
    background-color: #f4f4f5;
    color: #909399;
}

/* 移动端卡片样式 */
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

.account-badge {
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

.auto-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.auto-yes {
    background: #f0f9eb;
    color: #67c23a;
}

.auto-no {
    background: #f4f4f5;
    color: #909399;
}

.info-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    color: #909399;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.info-value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
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

.action-row {
    display: flex;
    gap: 8px;
    justify-content: space-between;
}

.action-row .el-button {
    flex: 1;
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

/* 审核弹窗样式优化 */
.modern-audit-dialog {
    border-radius: 8px;
    overflow: hidden;
}

.audit-content {
    padding: 20px;
}

.audit-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.audit-checkbox-item {
    background: #f5f7fa;
    border-radius: 6px;
    padding: 12px;
    transition: all 0.3s ease;
}

.audit-checkbox-item:hover {
    background: #ecf5ff;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 10px;
        padding: 10px;
    }

    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        padding: 10px;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        margin: 0;
    }

    /* 为固定定位的分页器留出空间 */
    .panel {
        padding-bottom: 60px;
    }

    /* 移动端弹窗样式优化 */
    .modern-audit-dialog {
        margin: 0;
    }

    .audit-checkbox-item {
        padding: 16px;
    }
}

@media screen and (min-width: 769px) {
    .modern-audit-dialog {
        width: 500px !important;
    }
}

.modern-audit-dialog {
    border-radius: 8px;
}

.modern-audit-dialog>>>.el-dialog__header {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
}

.modern-audit-dialog>>>.el-dialog__body {
    padding: 15px;
}

.modern-audit-dialog>>>.el-dialog__footer {
    padding: 10px 15px;
    border-top: 1px solid #ebeef5;
}

.audit-content {
    max-height: 300px;
    overflow-y: auto;
}

.audit-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.audit-checkbox-item {
    margin: 0;
    padding: 8px 10px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.audit-checkbox-item:hover {
    background-color: #f5f7fa;
}

.audit-checkbox-item>>>.el-checkbox__label {
    font-size: 13px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
    .modern-audit-dialog>>>.el-dialog {
        margin-top: 20vh !important;
    }

    .audit-checkbox-item {
        padding: 10px;
    }
}

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
        margin-bottom: 48px;
    }

    /* 调整内区域的下边距 */
    .el-main {
        padding-bottom: calc(48px + env(safe-area-inset-bottom));
    }
}

</style>
