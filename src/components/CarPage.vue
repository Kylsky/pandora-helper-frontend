<template>
    <el-container id="carPanel" class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-5 min-h-[calc(100vh-40px)] flex flex-col border dark:border-gray-800">
        <header class="px-4 py-3">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">停车场</h2>
        </header>
        <el-main class="flex-1">
            <el-row class="mb-7">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="输入车主名称查询" v-model="email" class="w-full dark-input">
                        <template v-slot:input>
                            <input class="el-input__inner dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-500" :value="email" @input="e => email = e.target.value" placeholder="输入车主名称查询">
                        </template>
                        <el-button slot="append" @click="emailQuery" class="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">查询</el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-show="!isMobile" class="hidden md:block">
                <el-table :data="tableData" style="width: 100%" 
                    v-loading="loading" 
                    element-loading-text="加载中..."
                    element-loading-spinner="el-icon-loading"
                    class="adaptive-table">
                    <el-table-column prop="email" label="账号" min-width="180" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <el-popover placement="right" width="220" trigger="hover">
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">账号类型：</span>
                                        <span class="text-gray-700 dark:text-gray-300">{{ scope.row.type }}</span>
                                    </div>
                                    <div v-if="scope.row.type === 'ChatGPT'" class="flex items-center justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">计划类型：</span>
                                        <span class="text-gray-700 dark:text-gray-300">{{ scope.row.planType }}</span>
                                    </div>
                                </div>
                                <div slot="reference" class="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                                    <i class="el-icon-message text-gray-400 text-sm"></i>
                                    <span class="text-gray-700 dark:text-gray-300">{{ scope.row.email }}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="账号类型" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div class="flex items-center space-x-2 px-2">
                                <span class="text-gray-700 dark:text-gray-300">{{ scope.row.type }}</span>
                                <template v-if="scope.row.type === 'ChatGPT'">
                                    <el-tag v-if="scope.row.planType === 'plus'" class="bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" effect="plain" size="mini">Plus</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'free'" class="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" effect="plain" size="mini">Free</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'team'" class="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" effect="plain" size="mini">Team</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'pro'" class="bg-black text-yellow-400 border-yellow-500 dark:bg-black/40 dark:text-yellow-300 dark:border-yellow-600" effect="plain" size="mini">Pro</el-tag>
                                    <el-tag v-else class="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800" effect="plain" size="mini">无效</el-tag>
                                </template>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="auto" label="自动上车" width="120" align="center">
                        <template slot-scope="scope">
                            <span :class="[
                                'px-3 py-1 rounded-full text-sm font-medium',
                                scope.row.auto === 1 
                                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                            ]">
                                {{ scope.row.auto === 1 ? 'yes!' : 'No' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="usernameDesc" label="车主" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div class="flex items-center space-x-2 px-2">
                                <i class="el-icon-user text-gray-400 text-sm"></i>
                                <span class="text-gray-700 dark:text-gray-300">{{ scope.row.usernameDesc }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="countDesc" label="已上车人数 / 总人数" min-width="160" align="center">
                        <template slot-scope="scope">
                            <div class="flex items-center justify-center space-x-1">
                                <span class="text-green-500 font-semibold">{{ scope.row.countDesc.split('/')[0] }}</span>
                                <span class="text-gray-400">/</span>
                                <span class="text-blue-500 font-semibold">{{ scope.row.countDesc.split('/')[1] }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="280" fixed="right">
                        <template slot-scope="scope">
                            <div class="flex space-x-2">
                                <el-button v-if="scope.row.authorized === true" type="primary" size="mini"
                                    @click="showModal(scope.row.id)" 
                                    class="hover:-translate-y-0.5 transition-transform duration-200">审核</el-button>
                                <el-button type="warning" size="mini"
                                    @click="contact(scope.row.username)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">联系车主</el-button>
                                <el-button type="success" size="mini" @click="applyCar(scope.row.id)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">我要上车</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-if="isMobile" class="space-y-4 md:hidden" v-loading="loading" 
                element-loading-text="加载中..."
                element-loading-spinner="el-icon-loading">
                <div v-for="(item, index) in tableData" :key="index" 
                    class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between items-center mb-4">
                        <div class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full flex items-center space-x-2 max-w-[70%] overflow-hidden">
                            <i class="el-icon-user"></i>
                            <span class="truncate">{{ item.email }}</span>
                        </div>
                        <div class="px-3 py-1 rounded-full text-sm font-medium"
                            :class="{
                                'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400': item.auto === 1,
                                'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400': item.auto !== 1
                            }">
                            {{ item.auto === 1 ? '自动上车' : '审核上车' }}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="space-y-1">
                                <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                    <i class="el-icon-key"></i>
                                    <span>账号类型</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.type }}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                    <i class="el-icon-user"></i>
                                    <span>车主</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.usernameDesc }}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                    <i class="el-icon-s-data"></i>
                                    <span>上车情况</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.countDesc }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

                    <div class="space-y-3">
                        <div class="flex space-x-2">
                            <el-button v-if="item.authorized === true" type="primary" size="mini"
                                @click="showModal(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-check mr-1"></i> 审核
                            </el-button>
                            <el-button type="warning" size="mini" @click="contact(item.username)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-message mr-1"></i> 联系车主
                            </el-button>
                            <el-button type="success" size="mini" @click="applyCar(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-plus mr-1"></i> 上车
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页器 -->
            <el-pagination 
                @current-change="handleCurrentChange" 
                :current-page.sync="currentPage" 
                :page-size="pageSize"
                :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
                :pager-count="isMobile ? 5 : 7"
                :total="total"
                :class="[
                    isMobile ? 'w-full flex justify-center py-4' : 'fixed bottom-8 right-8 z-10'
                ]">
            </el-pagination>

            <!-- 审核弹窗 -->
            <el-dialog :visible.sync="auditVisible" title="审核申请" :width="isMobile ? '95%' : '360px'" :fullscreen="false"
                class="rounded-lg">
                <div class="space-y-4">
                    <el-checkbox-group v-model="auditValues" class="flex flex-col space-y-3">
                        <el-checkbox v-for="item in auditOptions" :key="item.value" :label="item.value"
                            class="!mr-0 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                            {{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
                <div slot="footer" class="flex justify-end space-x-2">
                    <el-button size="small" type="danger" @click="submitAudit(0)"
                        class="hover:-translate-y-0.5 transition-transform duration-200">拒绝</el-button>
                    <el-button size="small" type="primary" @click="submitAudit(1)"
                        class="hover:-translate-y-0.5 transition-transform duration-200">通过</el-button>
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
.dark-input :deep(.el-input__inner) {
    @apply dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700;
}

.dark-input :deep(.el-input-group__append) {
    @apply dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600;
}

.dark-input :deep(.el-input__inner:hover),
.dark-input :deep(.el-input__inner:focus) {
    @apply dark:border-gray-500;
}

.dark-input :deep(.el-input__inner::placeholder) {
    @apply dark:text-gray-500;
}

/* 添加表格自适应样式 */
.adaptive-table :deep(.el-table__row) {
    height: auto !important;
    min-height: 40px;
}

.adaptive-table :deep(.el-table__cell) {
    padding: clamp(4px, 1vh, 12px) 0;
}

.adaptive-table :deep(.cell) {
    line-height: 1.4;
    white-space: normal;
    min-height: 24px;
    display: flex;
    align-items: center;
}

/* 移除分页器的边框 */
:deep(.el-pagination) {
    @apply border-none;
}
</style>
