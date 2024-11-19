<template>
    <el-container id="sharePanel" class="panel">
        <el-header>
            <h2>分享管理</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :span="18">
                    <el-input id="email-query" placeholder="请输入邮箱或用户名" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <!-- <el-button class="create-new" type="primary" @click="showModal()">新增</el-button> -->
                    <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal"
                        @confirm="submitForm">
                        <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                            @updateValue="handleUpdateValue" @handleSelectChange="handleSelectChange" />
                    </enhanced-dialog>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%" :fit="true">
                <el-table-column prop="uniqueName" label="用户名"></el-table-column>
                <el-table-column prop="gptCarName" label="ChatGPT账号" width="180">
                    <template slot-scope="scope">
                        <split-button :name="scope.row.gptCarName" :count="scope.row.gptUserCount || 0" type="gpt"
                            @click="openChat(scope.row.gptConfigId, 1)" />
                    </template>
                </el-table-column>

                <el-table-column prop="claudeCarName" label="Claude账号" width="180">
                    <template slot-scope="scope">
                        <split-button :name="scope.row.claudeCarName" :count="scope.row.claudeUserCount || 0"
                            type="claude" @click="openChat(scope.row.claudeConfigId, 2)" />
                    </template>
                </el-table-column>

                <el-table-column prop="apiCarName" label="API账号" width="180">
                    <template slot-scope="scope">
                        <split-button :name="scope.row.apiCarName" :count="scope.row.apiUserCount || 0" type="api"
                            @click="openChat(scope.row.apiConfigId, 3)" />
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="gptCarName" label="ChatGPT账号" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="ellipsis clickable-span underlined-span"
                            @click="openChat(scope.row.gptConfigId, 1)" :title="'点击跳转'">{{ scope.row.gptCarName
                            }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="claudeCarName" label="Claude账号" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="ellipsis clickable-span underlined-span"
                            @click="openChat(scope.row.claudeConfigId, 2)" :title="'点击跳转'">{{
                                scope.row.claudeCarName }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="apiCarName" label="API账号" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="ellipsis clickable-span underlined-span"
                            @click="openChat(scope.row.apiConfigId, 3)" :title="'点击跳转'">{{
                                scope.row.apiCarName }}</span>
                    </template>
                </el-table-column> -->
                <!-- <el-table-column prop="comment" label="备注"></el-table-column> -->
                <el-table-column prop="expiresAt" label="过期时间"></el-table-column>

                <el-table-column label="操作" width="250">
                    <template slot-scope="scope">
                        <div class="action-buttons" style="display: flex; gap: 2px;">

                            <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)">激活</el-button>
                            <enhanced-dialog :visible.sync="modalVisible" title="新增共享" message=""
                                @confirm="submitForm()" />

                            <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>

                            <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                                @confirm="handleDelete()" />
                        </div>

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
import SplitButton from './SplitButton.vue'  // 确保路径正确
import message from '@/configs/message'


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
        async openChat(id, type) {
            if (id === null) {
                return
            }
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

.clickable-span {
    cursor: pointer;
}

.underlined-span {
    text-decoration: underline;
}

.clickable-span:hover {
    color: #409EFF;
    /* 使用 Element UI 的主题蓝色，您可以根据需要调整 */
}
</style>