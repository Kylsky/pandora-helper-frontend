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
            <div class="pc-view">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="email" label="账号"></el-table-column>
                    <el-table-column prop="type" label="账号类型"></el-table-column>
                    <el-table-column prop="auto" label="自动上车">
                        <template slot-scope="scope">
                            <span :class="['status-tag', scope.row.auto === 1 ? 'status-yes' : 'status-no']">
                                {{ scope.row.auto === 1 ? 'yes!' : 'No' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="usernameDesc" label="车主"></el-table-column>
                    <el-table-column prop="countDesc" label="已上车人数 / 总人数"></el-table-column>
                    <el-table-column label="操作" width="300">
                        <template slot-scope="scope">
                            <div class="action-buttons">
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
            <div class="mobile-view">
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
                    <div class="mobile-card-header">
                        <div class="account-badge">
                            <i class="el-icon-user"></i>
                            {{ item.email }}
                        </div>
                        <div :class="['auto-badge', item.auto === 1 ? 'auto-yes' : 'auto-no']">
                            {{ item.auto === 1 ? '自动上车' : '手动上车' }}
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
                <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                    :layout="isMobile ? 'prev, pager, next' : 'prev, pager, next, jumper'"
                    :pager-count="isMobile ? 5 : 7" :total="total" class="pagination-wrapper">
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
            auditVisible: false,
            auditValues: [],
            auditOptions: [],
            auditCarId: null,

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
            // 实现提交审核的逻辑
            console.log('提交审核', this.auditCarId, this.auditValues);
            const response = await apiClient.post(`${config.apiBaseUrl}/car/audit`, { 'accountId': this.auditCarId, 'allowApply': flag, 'ids': this.auditValues }, {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            }).catch(function (error) {
                message.error(error)
            });
            if (response.data.status) {
                console.log("audit success");
                message.success("审核成功")
            } else {
                message.error(response.data.message);
            }
            this.auditVisible = false;
            this.auditValues = [];
            this.auditCarId = null;
            this.fetchItems('');
        },
        async applyCar(id) {
            const response = await apiClient.post(`${config.apiBaseUrl}/car/apply`, { 'accountId': id }, {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            }).catch(function (error) {
                message.error(error)
            });
            if (response.data.status) {
                message.success('申请成功');
            } else {
                message.error(response.data.message);
            }
            this.closeModal()
        },
        async fetchItems(email) {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/car/list?page=` + this.currentPage + `&size=` + 10 + `&owner=` + email, {
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
        async showModal(id) {
            console.log(this.auditVisible)
            this.auditVisible = true;
            this.auditCarId = id;
            const response = await apiClient.get(`${config.apiBaseUrl}/car/fetchApplies?accountId=` + this.auditCarId, {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            }).catch(function (error) {
                message.error(error)
            });
            this.auditOptions = response.data.data;
        },
        async contact(contact) {
            window.open("https://linux.do/u/" + contact + "/summary")
        },
        closeModal() {
            this.modalVisible = false;
            this.shareAddFlag = false;
            this.currentIndex = null;
        },
        async submitForm() {
            const itemData = { ...this.formData };
            if (!this.currentIndex) {
                console.log(itemData)
                itemData.accountId = parseInt(itemData.accountId)
                itemData.count = parseInt(itemData.count)
                itemData.duration = parseInt(itemData.duration)

                const response = await apiClient.post(`${config.apiBaseUrl}/redemption/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                });
                if (response.data.status) {
                    message.success('新增成功');
                } else {
                    message.error(response.data.message);
                }
                this.closeModal()
            }
            else {
                itemData.id = this.currentIndex;
                itemData.duration = parseInt(itemData.duration)
                apiClient.patch(`${config.apiBaseUrl}/redemption/update`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
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
        handleCurrentChange(val) {
            // 处理页码变化
            console.log(val)
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

/* PC端表格样式 */
.pc-view {
    display: none;
}

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
    margin-top: 20px;
    padding: 8px 0;  /* 减小上下内边距 */
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

    .pc-view {
        display: none;
    }

    .mobile-view {
        display: block;
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
    .pc-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }

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
        margin-bottom: 48px; /* 确保最后一张卡片不被分页器遮挡 */
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