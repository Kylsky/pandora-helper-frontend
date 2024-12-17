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
/* 面板基础样式优化 */
.panel {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 24px;
    margin: 20px;
    height: calc(100vh - 40px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
}

/* 页面标题样式 */
.el-header {
    padding: 0 0 20px 0;
    border-bottom: 1px solid #eef2f6;
    margin-bottom: 24px;
}

.el-header h2 {
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
    font-weight: 600;
}

/* 搜索栏样式优化 */
.search-bar {
    margin-bottom: 24px;
    align-items: center;
}

@media screen and (min-width: 769px) {
    .search-bar .el-input {
        max-width: 460px;
    }

    .btn-col {
        padding-left: 16px;
    }

    .create-new {
        padding: 12px 24px;
        font-size: 14px;
        height: 40px;
        transition: all 0.3s ease;
    }

    .create-new:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 143, 111, 0.2);
    }
    
    /* PC端表格样式优化 */
    .pc-view {
        flex: 1;
        overflow: auto;
    }

    .pc-view .el-table {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }

    .pc-view .el-table::before {
        display: none;
    }

    .pc-view .el-table th {
        background-color: #f8fafc;
        padding: 16px 12px;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 1px solid #eef2f6;
    }

    .pc-view .el-table td {
        padding: 16px 12px;
        border-bottom: 1px solid #eef2f6;
    }

    .pc-view .el-table--striped .el-table__body tr.el-table__row--striped td {
        background-color: #f9fafb;
    }

    .pc-view .el-table__body tr:hover > td {
        background-color: #f5f7fa !important;
    }

    /* 表格内操作按钮样式 */
    .action-row {
        display: flex;
        gap: 12px;
    }

    .action-row .el-button {
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .action-row .el-button--warning {
        background-color: #ff9f43;
        border-color: #ff9f43;
        color: white;
    }

    .action-row .el-button--warning:hover {
        background-color: #ff8f2c;
        border-color: #ff8f2c;
        transform: translateY(-1px);
    }

    .action-row .el-button--danger {
        background-color: #ee5253;
        border-color: #ee5253;
    }

    .action-row .el-button--danger:hover {
        background-color: #e84142;
        border-color: #e84142;
        transform: translateY(-1px);
    }
}

/* 分页器样式优化 */
.pagination-container {
    margin-top: 24px;
    padding: 16px 0;
    border-top: 1px solid #eef2f6;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
}

/* Element UI 分页器组件样式 */
.el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #0e8f6f;
    color: white;
}

.el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: #0e8f6f;
}

/* 弹窗样式优化 */
.el-dialog {
    border-radius: 12px;
    overflow: hidden;
}

.el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #eef2f6;
}

.el-dialog__body {
    padding: 24px;
}

.el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eef2f6;
}
</style>