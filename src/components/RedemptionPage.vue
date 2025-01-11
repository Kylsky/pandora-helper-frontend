<template>
    <el-container id="redemptionPanel" class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-5 min-h-[calc(100vh-40px)] flex flex-col border dark:border-gray-800">
        <header class="px-4 py-3">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">兑换码管理</h2>
        </header>
        <el-main class="flex-1">
            <!-- 响应式搜索栏 -->
            <el-row class="mb-7">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email" @keyup.enter.native="emailQuery" class="w-full dark-input">
                        <template v-slot:input>
                            <input class="el-input__inner dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-500" :value="email" @input="e => email = e.target.value" placeholder="请输入邮箱">
                        </template>
                        <el-button slot="append" @click="emailQuery" class="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :xs="24" :sm="6" :md="6" class="flex justify-end sm:mt-4 md:mt-0">
                    <el-button class="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all duration-300 transform hover:-translate-y-0.5" type="primary" @click="showModal()">新增</el-button>
                </el-col>
            </el-row>

            <!-- 主要内容区域 -->
            <div class="flex-1">
                <!-- PC端表格视图 -->
                <div v-if="!isMobile" class="hidden md:block">
                    <el-table :data="tableData" style="width: 100%" :fit="true" 
                        v-loading="loading"
                        element-loading-text="加载中..."
                        element-loading-spinner="el-icon-loading"
                        class="adaptive-table">
                        <el-table-column prop="email" label="名称" min-width="200" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <div class="flex items-center space-x-2">
                                    <i class="el-icon-user text-gray-400 text-sm"></i>
                                    <span class="text-gray-700 dark:text-gray-300">{{ scope.row.email }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accountType" label="账号类型" min-width="150" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-tag size="mini" effect="plain" 
                                    :class="{
                                        'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800': scope.row.accountType === 'ChatGPT',
                                        'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800': scope.row.accountType === 'Claude',
                                        'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800': scope.row.accountType === 'API'
                                    }">
                                    {{ scope.row.accountType }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="code" label="兑换码" min-width="200" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-tooltip :content="scope.row.code" placement="top" effect="light">
                                    <div class="flex items-center space-x-2">
                                        <i class="el-icon-key text-gray-400 text-sm"></i>
                                        <span class="text-gray-700 dark:text-gray-300">{{ scope.row.code }}</span>
                                    </div>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column prop="duration" label="兑换时长" min-width="150" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <div class="flex items-center space-x-2">
                                    <i class="el-icon-time text-gray-400 text-sm"></i>
                                    <span class="text-gray-700 dark:text-gray-300">{{ scope.row.duration }} 天</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" min-width="200">
                            <template slot-scope="scope">
                                <div class="flex space-x-2">
                                    <el-button type="warning" size="mini" @click="editItem(scope.row.id)"
                                        class="hover:-translate-y-0.5 transition-transform duration-200">
                                        <i class="el-icon-edit mr-1"></i> 编辑
                                    </el-button>
                                    <el-button type="danger" size="mini" @click="showConfirmDialog(scope.row.id)"
                                        class="hover:-translate-y-0.5 transition-transform duration-200">
                                        <i class="el-icon-delete mr-1"></i> 删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 移动端卡片视图 -->
                <div v-else class="space-y-4 md:hidden" v-loading="loading" 
                    element-loading-text="加载中..."
                    element-loading-spinner="el-icon-loading">
                    <div v-for="(item, index) in tableData" :key="index" 
                        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center mb-4">
                            <div class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full flex items-center space-x-2 max-w-[70%] overflow-hidden">
                                <i class="el-icon-message"></i>
                                <el-tooltip :content="item.email" placement="top" effect="light">
                                    <span class="truncate">{{ item.email }}</span>
                                </el-tooltip>
                            </div>
                            <div class="px-3 py-1 rounded-full text-sm font-medium"
                                :class="{
                                    'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400': item.accountType === 'ChatGPT',
                                    'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400': item.accountType === 'Claude',
                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': item.accountType === 'API'
                                }">
                                {{ item.accountType }}
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                        <i class="el-icon-key"></i>
                                        <span>兑换码</span>
                                    </div>
                                    <div class="text-gray-900 dark:text-gray-100 font-semibold">
                                        <el-tooltip :content="item.code" placement="top" effect="light">
                                            <span>{{ item.code }}</span>
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                        <i class="el-icon-time"></i>
                                        <span>兑换时长</span>
                                    </div>
                                    <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.duration }} 天</div>
                                </div>
                            </div>
                        </div>

                        <div class="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

                        <div class="flex space-x-2">
                            <el-button type="warning" size="mini" @click="editItem(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-edit mr-1"></i> 编辑
                            </el-button>
                            <el-button type="danger" size="mini" @click="showConfirmDialog(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-delete mr-1"></i> 删除
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

            <!-- 弹窗组件 -->
            <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
                <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                    @updateValue="handleUpdateValue" @handleSelectChange="handleSelectChange" />
            </enhanced-dialog>

            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个兑换码吗？"
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
import { debounce } from 'lodash'

export default {
    name: 'RedemptionPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
    },
    data() {
        return {
            isMobile: false,
            email: '',
            tableData: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            isDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null,
            formData: {},
            formFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options:[] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            accountFields: [
                { id: 'accountId', label: '账号', type: 'select', value: '', required: true, readonly: '1', options:[] },
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
                { id: 'count', label: '兑换数量', type: 'number', value: '', required: true }
            ],
            shareFields: [
                { id: 'duration', label: '兑换时长(天)', type: 'number', value: '', required: true, readonly: true },
            ]
        }
    },
    computed: {
        tableHeight() {
            return `calc(100vh - ${this.headerHeight + this.searchHeight + this.paginationHeight + this.padding}px)`;
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
                this.loading = true;
                const response = await apiClient.get(`${config.apiBaseUrl}/redemption/list`, {
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        emailAddr: email
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    this.tableData = response.data.data.data;
                    this.total = response.data.data.total;
                }
            } catch (error) {
                message.error(error.message || '获取数据失败');
            } finally {
                this.loading = false;
            }
        },

        handleUpdateValue(fieldId, newValue) {
            this.$set(this.formData, fieldId, newValue);
            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }
        },

        async showModal() {
            try {
                this.modalTitle = '新增兑换码';
                this.currentIndex = null;
                this.formFields = this.accountFields;
                this.resetFormFields();
                this.modalVisible = true;

                const response = await apiClient.get(`${config.apiBaseUrl}/account/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const accountField = this.accountFields.find(f => f.id === "accountId");
                if (accountField && response.data.status) {
                    accountField.options = response.data.data.data.map(item => ({
                        text: `${item.name}(${item.accountType === 1 ? 'ChatGPT' : item.accountType === 2 ? 'Claude' : 'API'})`,
                        value: item.id
                    }));
                }
            } catch (error) {
                message.error(error.message || '获取账号列表失败');
            }
        },

        async editItem(index) {
            try {
                this.modalTitle = '编辑兑换码';
                this.formFields = this.shareFields;
                this.currentIndex = index;

                const response = await apiClient.get(`${config.apiBaseUrl}/redemption/getById`, {
                    params: { id: index },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    const acc = response.data.data;
                    this.formFields.forEach(field => {
                        field.value = acc[field.id];
                        this.$set(this.formData, field.id, acc[field.id]);
                    });
                    this.modalVisible = true;
                }
            } catch (error) {
                message.error(error.message || '获取兑换码详情失败');
            }
        },

        closeModal() {
            this.modalVisible = false;
            this.currentIndex = null;
            this.formData = {};
        },

        async submitForm() {
            try {
                const itemData = { ...this.formData };
                
                if (!this.currentIndex) {
                    // 新增
                    itemData.accountId = parseInt(itemData.accountId);
                    itemData.count = parseInt(itemData.count);
                    itemData.duration = parseInt(itemData.duration);

                    const response = await apiClient.post(`${config.apiBaseUrl}/redemption/add`, itemData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data.status) {
                        message.success('新增成功');
                    } else {
                        throw new Error(response.data.message);
                    }
                } else {
                    // 编辑
                    itemData.id = this.currentIndex;
                    itemData.duration = parseInt(itemData.duration);

                    const response = await apiClient.patch(`${config.apiBaseUrl}/redemption/update`, itemData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data.status) {
                        message.success('更新成功');
                    } else {
                        throw new Error('更新失败');
                    }
                }

                this.closeModal();
                this.fetchItems('');
            } catch (error) {
                message.error(error.message || '操作失败');
            }
        },

        resetFormFields() {
            this.formData = {};
            this.formFields.forEach(field => {
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.$set(this.formData, field.id, defaultValue);
            });
        },

        emailQuery: debounce(function() {
            this.currentPage = 1;
            this.fetchItems(this.email);
        }, 300),

        async handleDelete() {
            try {
                const response = await apiClient.delete(`${config.apiBaseUrl}/redemption/delete`, {
                    params: { id: this.currentIndex },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status) {
                    message.success('删除成功');
                    this.fetchItems('');
                } else {
                    throw new Error('删除失败');
                }
            } catch (error) {
                message.error(error.message || '删除失败');
            } finally {
                this.isDialogVisible = false;
            }
        },

        handleCurrentChange(val) {
            this.currentPage = val;
            this.fetchItems(this.email);
        },

        handleSelectChange({ type, field, value }) {
            console.log('Select changed:', { type, field, value });
        }
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
