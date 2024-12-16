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
.panel {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 15px;
    margin: 1% 15px;
    height: 97%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 搜索栏响应式样式 */
.search-bar {
    margin-bottom: 20px;
}

.btn-col {
    display: flex;
    justify-content: flex-end;
}

.create-new {
    margin-top: 0;
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

.email-badge {
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

.type-badge {
    background: #f0f9eb;
    color: #67c23a;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
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

.mobile-card-actions .action-row {
    justify-content: space-between;
}

.mobile-card-actions .el-button {
    flex: 1;
}

/* 分页器样式 */
.pagination-container {
    margin-top: 20px;
    padding: 10px 0;
}

.pagination-wrapper {
    text-align: center;
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

    .search-bar {
        margin-bottom: 16px;
    }

    .btn-col {
        margin-top: 10px;
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
        background-color: white;
        padding: 10px;
        box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
        z-index: 1000;
        margin: 0;
    }

    /* 为固定定位的分页器留出空间 */
    .panel {
        padding-bottom: 60px;
    }

    /* 优化移动端按钮触控区域 */
    .mobile-card-actions .el-button {
        padding: 10px 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
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