<template>
    <el-container id="redemptionPanel" class="panel">
        <el-header>
            <h2>兑换码管理</h2>
        </el-header>
        <el-main>
            <!-- 响应式搜索栏 -->
            <el-row class="search-bar">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :xs="24" :sm="6" :md="6" class="btn-col">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div class="pc-view">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="email" label="邮箱"></el-table-column>
                    <el-table-column prop="accountType" label="账号类型"></el-table-column>
                    <el-table-column prop="code" label="兑换码"></el-table-column>
                    <el-table-column prop="duration" label="兑换时长(天)"></el-table-column>
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <div class="action-row">
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>
                                <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 移动端卡片视图 -->
            <div class="mobile-view">
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
                    <div class="mobile-card-header">
                        <div class="email-badge">
                            <i class="el-icon-message"></i>
                            {{ item.email }}
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
                                <div class="info-value">{{ item.code }}</div>
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

            <!-- 响应式分页器 -->
            <div class="pagination-container">
                <el-pagination 
                    @current-change="handleCurrentChange" 
                    :current-page.sync="currentPage" 
                    :page-size="10"
                    :layout="isMobile ? 'prev, pager, next' : 'prev, pager, next, jumper'"
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

export default {
    name: 'SharePage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
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
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1' ,options:[]},
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            accountFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1' ,options:[]},
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
        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },
        async fetchItems(email) {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/redemption/list?page=` + this.currentPage + `&size=` + 10 + `&emailAddr=` + email, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                console.log(response.data.data)
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
        async showModal() {
            this.modalTitle = '新增兑换码';
            this.currentIndex = null;
            this.formFields = this.accountFields;
            this.resetFormFields();
            this.modalVisible = true;
            const response = await apiClient.get(`${config.apiBaseUrl}/account/list`, {
                withCredentials: true,
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            }).catch(function (error) {
                message.error(error)
            });
            const newF = this.accountFields.find(f => f.id === "accountId");
            if (newF) {
                let arr = []
                console.log(response.data.data.data)
                for (const item of response.data.data.data) {
                    let optLabel = item.name + '(' + (item.accountType===1?'ChatGPT':'Claude') + ')'
                    let optId = item.id
                    let optItem = {'text':optLabel,'value':optId}
                    arr.push(optItem)
                }
                newF.options = arr;
                console.log(newF)
            }
            response.data.data

        },
        async editItem(index) {
            this.modalTitle = '编辑兑换码';
            this.formFields = this.shareFields;
            this.currentIndex = index;
            const response = await apiClient.get(`${config.apiBaseUrl}/redemption/getById?id=` + index, {
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
            else{
                itemData.id = this.currentIndex;
                itemData.duration = parseInt(itemData.duration)
                const response = await apiClient.patch(`${config.apiBaseUrl}/redemption/update`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
                if(!response.data.status) {
                    message.error("更新异常，请稍后重试")
                }else {
                    message.success("更新成功")
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
            const response = await apiClient.delete(`${config.apiBaseUrl}/redemption/delete?id=` + this.currentIndex, {
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
            console.log(type,field,value)
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
    /* background: rgba(255, 255, 255, 0.95); */
    backdrop-filter: blur(8px);
    border-radius: 8px;
    /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); */
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
    .pc-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }

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
