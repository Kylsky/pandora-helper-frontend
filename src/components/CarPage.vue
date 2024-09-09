<template>
    <el-container id="redemptionPanel" class="panel">
        <el-header>
            <h2>停车场</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :span="18">
                    <el-input id="email-query" placeholder="输入车主名称查询" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal"
                        @confirm="submitForm">
                        <form-input v-for="(field, index) in formFields" :key="index" :field="field" />
                    </enhanced-dialog>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="email" label="账号"></el-table-column>
                <el-table-column prop="type" label="账号类型"></el-table-column>
                <el-table-column prop="auto" label="自动上车">
                    <template slot-scope="scope">
                        <span class="ellipsis">{{ scope.row.auto === 1 ? 'yes!' : 'No' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="usernameDesc" label="车主"></el-table-column>
                <el-table-column prop="countDesc" label="已上车人数 / 总人数"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.applyNum" type="primary" size="mini"
                            @click="showModal(scope.row.id)">审核</el-button>
                        <el-button type="warning" size="mini" @click="contact(scope.row.username)">联系车主</el-button>

                        <el-button size="mini" type="success" @click="applyCar(scope.row.id)">我要上车</el-button>

                    </template>
                </el-table-column>
            </el-table>
            <el-dialog :visible.sync="auditVisible" title="审核申请" width="400px" custom-class="modern-audit-dialog">
                <div class="audit-content">
                    <!-- <h3 class="audit-title">请选择审核选项</h3> -->
                    <el-checkbox-group v-model="auditValues" class="audit-checkbox-group">
                        <el-checkbox v-for="item in auditOptions" :key="item.value" :label="item.value"
                            class="audit-checkbox-item">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="auditVisible = false" class="cancel-button">取消</el-button>
                    <el-button type="primary" @click="submitAudit" class="submit-button">确认</el-button>
                </span>
            </el-dialog>

            <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                layout="prev, pager, next, jumper" :total=total>
            </el-pagination>
        </el-main>
    </el-container>
</template>

<script>

import EnhancedDialog from '../modules/EnhancedDialog.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
import FormInput from '../modules/FormInput'

export default {
    name: 'SharePage',
    components: {
        EnhancedDialog,
        FormInput
    },
    data() {
        return {
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
        async submitAudit() {
            // 实现提交审核的逻辑
            console.log('提交审核', this.auditCarId, this.auditValues);
            const response = await apiClient.post(`${config.apiBaseUrl}/car/audit`, { 'accountId': this.auditCarId, 'allowApply': 1, 'ids': this.auditValues }, {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            }).catch(function (error) {
                alert(error)
            });
            if (response.data.status) {
                console.log("audit success");
            } else {
                alert(response.data.message);
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
                alert(error)
            });
            if (response.data.status) {
                alert('申请成功');
            } else {
                alert(response.data.message);
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
                alert(error)
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
                alert(error)
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
                    alert(error)
                });
                if (response.data.status) {
                    alert('新增成功');
                } else {
                    alert(response.data.message);
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
                    alert(error)
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
        async handleDelete(id) {
            // 实现删除逻辑
            const response = await apiClient.delete(`${config.apiBaseUrl}/redemption/delete?id=` + id, {
                withCredentials: true,
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            });
            if (response.data.status) {
                alert('删除成功');
            } else {
                alert('删除失败，请稍后重试');
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
            console.log(type, field, value)
        },
    },
    mounted() {
        // 组件挂载后的逻辑
        this.fetchItems('');
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
}.modern-audit-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.modern-audit-dialog >>> .el-dialog__header {
  background-color: #f5f7fa;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.modern-audit-dialog >>> .el-dialog__title {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.modern-audit-dialog >>> .el-dialog__body {
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

.audit-checkbox-item >>> .el-checkbox__label {
  font-size: 14px;
  color: #606266;
  padding: 10px;
  width: 100%;
  transition: all 0.3s ease;
}

.audit-checkbox-item >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #409EFF;
}

.audit-checkbox-item >>> .el-checkbox__inner {
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.audit-checkbox-item >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409EFF;
  border-color: #409EFF;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.cancel-button, .submit-button {
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