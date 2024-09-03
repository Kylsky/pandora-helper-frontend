<template>
    <el-container id="accountPanel" class="panel">
        <el-header>
            <h2>账号管理</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :span="18">
                    <el-input id="email-query" placeholder="Email" v-model="emailQuery">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                    <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal"
                        @confirm="submitForm" @updateValue="handleUpdateValue">
                        <form-input v-for="(field, index) in formFields" :key="index" :field="field" />
                    </enhanced-dialog>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="type" label="账号类型"></el-table-column>
                <el-table-column prop="accessToken" label="Access Token">
                    <template slot-scope="scope">
                        <span class="ellipsis">{{ scope.row.accessToken }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="shared" label="共享"></el-table-column>
                <el-table-column prop="updateTime" label="更新时间"></el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="editItem(scope.row.id)">编辑</el-button>
                        <enhanced-dialog :visible.sync="isAccDialogVisible" title="编辑账号" message=""
                            @confirm="handleEdit(scope.row.id)" />
                        <el-button size="mini" type="danger" @click="showConfirmDialog()">删除</el-button>
                        <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                            @confirm="handleDelete(scope.row.id)" />

                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                layout="prev, pager, next, jumper" :total=tableData.length>
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
    name: 'AccountPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
    },
    data() {
        return {
            emailQuery: '',
            tableData: [], // 这里应该填充实际的表格数据
            currentPage: 1,
            isDialogVisible: false,
            isAccDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null, // 用于追踪当前编辑的项目索引

            formData: {},
            formFields: [
                { id: 'name', label: '账号名称', type: 'text', value: '' },
                { id: 'email', label: '邮箱地址', type: 'text', value: '' },
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }] },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '' },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '' },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '' },
                { id: 'shared', label: '是否共享', type: 'checkbox', value: false },
                { id: 'auto', label: '自动加入', type: 'checkbox', value: false },


            ]
        }
    },
    methods: {
        showAccountDialog() {
            this.isAccDialogVisible = true;
        },
        showConfirmDialog() {
            this.isDialogVisible = true;
        },
        async fetchAccounts() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/account/list?email=`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.tableData = response.data.data
                }
            } catch (error) {
                alert(error)
            }

        },
        handleUpdateValue(fieldId, newValue) {
            // 更新 formData 中对应字段的值
            // this.formData[fieldId] = newValue;
            console.log("handle update ")
            this.$set(this.formData,fieldId,newValue)

            // 更新 formFields 中对应字段的值
            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }
        },
        showModal() {
            this.modalTitle = '新增账号';
            this.currentIndex = null;
            this.resetFormFields();
            this.modalVisible = true;
        },
        async editItem(index) {
            this.modalTitle = '编辑账号';
            this.currentIndex = index;
            const response = await apiClient.get(`${config.apiBaseUrl}/account/getById?id=` + index, {
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
        },
        submitForm() {
            console.log(this.formData);
            const itemData = { ...this.formData };

            if (this.currentIndex !== null) {
                itemData.id = this.currentIndex;
                apiClient.patch(`${config.apiBaseUrl}/account/update`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                })
            } else {
                apiClient.post(`${config.apiBaseUrl}/account/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                })
            }

            this.closeModal();
        },
        resetFormFields() {
            this.formData = {};
            this.formFields.forEach(field => {
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.formData[field.id] = defaultValue;
            });
        },
        //   emailQuery() {
        //     // 实现邮箱查询逻辑
        //   },
        //   openModal(modalName) {
        //     // 实现打开模态框的逻辑
        //   },
        handleEdit(id) {
            // 实现编辑逻辑
            console.log(id)
        },
        handleAdd() {
            // 实现编辑逻辑
            console.log()
        },
        async handleDelete(id) {
            // 实现删除逻辑
            const response = await apiClient.delete(`${config.apiBaseUrl}/account/delete?id=` + id, {
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
            this.fetchAccounts()
            this.isDialogVisible = false
        },
        handleCurrentChange(val) {
            // 处理页码变化
            console.log(val)
        }
    },
    mounted() {
        // 组件挂载后的逻辑
        this.fetchAccounts();
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