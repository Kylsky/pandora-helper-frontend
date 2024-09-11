<template>
    <el-container id="redemptionPanel" class="panel">
        <el-header>
            <h2>兑换码管理</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :span="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                    <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal"
                        @confirm="submitForm">
                        <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                            @updateValue="handleUpdateValue" @handleSelectChange="handleSelectChange" />
                    </enhanced-dialog>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="accountType" label="账号类型"></el-table-column>
                <el-table-column prop="code" label="兑换码"></el-table-column>
                <el-table-column prop="duration" label="兑换时长(天)"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>

                        <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                        <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                            @confirm="handleDelete()" />

                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                layout="prev, pager, next, jumper" :total=total>
            </el-pagination>
        </el-main>
    </el-container>
</template>

<script>
import ConfirmDialog from '../modules/ConfirmDialog.vue';
import EnhancedDialog from '../modules/EnhancedDialog.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
import FormInput from '../modules/FormInput'

export default {
    name: 'SharePage',
    components: {
        ConfirmDialog,
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
                alert(error)
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
                    alert(error)
                });
                if (response.data.status) {
                    alert('新增成功');
                } else {
                    alert(response.data.message);
                }
                this.closeModal()
            }
            else{
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
        async handleDelete() {
            // 实现删除逻辑
            const response = await apiClient.delete(`${config.apiBaseUrl}/redemption/delete?id=` + this.currentIndex, {
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
            console.log(type,field,value)
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
}
</style>