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
                <div v-if="!isMobile" class="hidden md:block relative h-full min-h-[300px]">
                    <LoadingSpinner :loading="loading" loadingText="加载中..." type="pulse"/>
                    
                    <!-- 表头 -->
                    <div class="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                        <div class="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 font-medium text-sm text-gray-500 dark:text-gray-300">
                            <div class="col-span-4 py-2.5 px-3">名称</div>
                            <div class="col-span-2 py-2.5 px-3">账号类型</div>
                            <div class="col-span-3 py-2.5 px-3">兑换码</div>
                            <div class="col-span-1 py-2.5 px-3">兑换时长</div>
                            <div class="col-span-2 py-2.5 px-3">操作</div>
                        </div>
                        
                        <!-- 表格内容 -->
                        <div class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            <div v-for="(item, index) in tableData" :key="index" 
                                class="grid grid-cols-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                                
                                <!-- 名称 -->
                                <div class="col-span-4 py-2.5 px-3">
                                    <div class="flex items-center space-x-1.5">
                                        <i class="el-icon-user text-gray-400"></i>
                                        <span class="text-gray-700 dark:text-gray-300">{{ item.email }}</span>
                                    </div>
                                </div>
                                
                                <!-- 账号类型 -->
                                <div class="col-span-2 py-2.5 px-3">
                                    <span :class="{
                                        'px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800': item.accountType === 'ChatGPT',
                                        'px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800': item.accountType === 'Claude',
                                        'px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800': item.accountType === 'API'
                                    }">
                                        {{ item.accountType }}
                                    </span>
                                </div>
                                
                                <!-- 兑换码 -->
                                <div class="col-span-3 py-2.5 px-3">
                                    <div class="flex items-center space-x-1.5">
                                        <i class="el-icon-key text-gray-400"></i>
                                        <span class="text-gray-700 dark:text-gray-300 truncate">{{ item.code }}</span>
                                    </div>
                                </div>
                                
                                <!-- 兑换时长 -->
                                <div class="col-span-1 py-2.5 px-3">
                                    <div class="flex items-center space-x-1.5">
                                        <i class="el-icon-time text-gray-400"></i>
                                        <span class="text-gray-700 dark:text-gray-300">{{ item.duration }} 天</span>
                                    </div>
                                </div>
                                
                                <!-- 操作 -->
                                <div class="col-span-2 py-2.5 px-3">
                                    <div class="flex gap-1.5">
                                        <button @click="editItem(item.id)"
                                            class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200">
                                            <i class="el-icon-edit mr-1"></i> 编辑
                                        </button>
                                        <button @click="showConfirmDialog(item.id)"
                                            class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-200">
                                            <i class="el-icon-delete mr-1"></i> 删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 无数据状态 -->
                            <div v-if="tableData.length === 0 && !loading" class="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                                </svg>
                                <p class="text-lg">暂无兑换码数据</p>
                                <p class="text-sm mt-2">请添加新兑换码或修改搜索条件</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 移动端卡片视图 -->
                <div v-else class="space-y-3 md:hidden relative h-full min-h-[300px]">
                    <LoadingSpinner :loading="loading" loadingText="加载中..." type="pulse"/>
                    <div v-for="(item, index) in tableData" :key="index" 
                        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md border border-gray-100 dark:border-gray-700">
                        
                        <!-- 卡片顶部 -->
                        <div class="flex justify-between items-center mb-2.5">
                            <div class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs flex items-center space-x-1.5 max-w-[70%] overflow-hidden">
                                <i class="el-icon-message"></i>
                                <span class="truncate">{{ item.email }}</span>
                            </div>
                            <span :class="{
                                'px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800': item.accountType === 'ChatGPT',
                                'px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800': item.accountType === 'Claude',
                                'px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800': item.accountType === 'API'
                            }">
                                {{ item.accountType }}
                            </span>
                        </div>

                        <div class="space-y-2 mb-3">
                            <!-- 兑换码 -->
                            <div class="space-y-0.5">
                                <div class="text-gray-500 dark:text-gray-400 text-xs flex items-center space-x-1.5">
                                    <i class="el-icon-key"></i>
                                    <span>兑换码</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-medium text-sm truncate">
                                    {{ item.code }}
                                </div>
                            </div>
                            
                            <!-- 兑换时长 -->
                            <div class="space-y-0.5">
                                <div class="text-gray-500 dark:text-gray-400 text-xs flex items-center space-x-1.5">
                                    <i class="el-icon-time"></i>
                                    <span>兑换时长</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-medium text-sm">
                                    {{ item.duration }} 天
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="grid grid-cols-2 gap-2">
                            <button @click="editItem(item.id)"
                                class="w-full py-1.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1">
                                <i class="el-icon-edit"></i>
                                <span>编辑</span>
                            </button>
                            <button @click="showConfirmDialog(item.id)"
                                class="w-full py-1.5 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1">
                                <i class="el-icon-delete"></i>
                                <span>删除</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 移动端无数据状态 -->
                    <div v-if="tableData.length === 0 && !loading" class="py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <svg class="w-14 h-14 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                        </svg>
                        <p class="text-base">暂无兑换码数据</p>
                        <p class="text-xs mt-1.5">请添加新兑换码或修改搜索条件</p>
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
                class="pagination-container">
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
import LoadingSpinner from './LoadingSpinner.vue'

export default {
    name: 'RedemptionPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput,
        LoadingSpinner
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
                        text: `${item.name}(${item.accountType === 1 ? 'ChatGPT' : item.accountType === 2 ? 'Claude' : item.accountType === 3 ? 'API' : 'Grok'})`,
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
/* 添加圆润字体样式 */
#redemptionPanel,
.el-main,
button,
input,
.el-input__inner,
.el-pagination,
.el-popover,
.pagination-container,
.card-title,
.card-content,
.col-span-2 {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "STHeiti", "WenQuanYi Micro Hei", "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC", "HarmonyOS Sans SC", system-ui, -apple-system, "SF Pro Text", Roboto, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    letter-spacing: 0.015em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "ss01", "ss02";
    font-variant-numeric: tabular-nums;
}

/* 不同元素的字体大小和粗细调整 */
#redemptionPanel h2 {
    font-weight: 600;
}

.el-button,
button {
    font-weight: 500;
}

/* 兑换码用户名字体加粗调整 */
.grid-cols-12 .col-span-2:first-child,
.grid-cols-12 .col-span-2:first-child .text-gray-700,
.truncate {
    font-size: 0.875rem; /* 14px */
    letter-spacing: -0.01em; /* 字母间距略微紧凑 */
    font-weight: 600; /* 加粗字体 */
}

/* 名称列字体调整 */
.col-span-4 .text-gray-700.dark\:text-gray-300 {
    font-size: 0.875rem; /* 14px */
    font-weight: 600;
}

/* 所有内容字体稍微调小 */
.text-sm {
    font-size: 0.8125rem; /* 13px */
}

.text-xs {
    font-size: 0.75rem; /* 12px */
}

/* 兑换码字体调整 */
.col-span-3 .text-gray-700.dark\:text-gray-300.truncate {
    font-size: 0.8125rem; /* 13px */
    letter-spacing: -0.01em;
}

/* 兑换时长字体调整 */
.col-span-1 .text-gray-700.dark\:text-gray-300 {
    font-size: 0.8125rem; /* 13px */
}

/* 移动端卡片字体调整 */
.text-gray-900.dark\:text-gray-100.font-medium.text-sm.truncate,
.text-gray-900.dark\:text-gray-100.font-medium.text-sm {
    font-size: 0.8125rem; /* 13px */
}

.dark-input :deep(.el-input__inner) {
    @apply dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700;
    @apply font-sans;
}

.dark-input :deep(.el-input-group__append) {
    @apply dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600;
    @apply font-sans;
}

.dark-input :deep(.el-input__inner:hover),
.dark-input :deep(.el-input__inner:focus) {
    @apply dark:border-gray-500;
}

.dark-input :deep(.el-input__inner::placeholder) {
    @apply dark:text-gray-500;
    @apply font-sans;
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
    @apply flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-0;
    @apply font-sans;
}

:deep(.el-pagination button) {
    @apply inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150;
    @apply font-sans;
}

:deep(.el-pagination button:disabled) {
    @apply opacity-50 cursor-not-allowed;
}

:deep(.el-pagination .el-pager li) {
    @apply inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150;
    @apply font-sans;
}

:deep(.el-pagination .el-pager li.active) {
    @apply text-white bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700;
}

/* 分页容器样式 */
.pagination-container {
    @apply w-full md:w-auto mt-4;
    @apply md:fixed md:bottom-8 md:right-8 md:z-10 md:rounded-lg md:overflow-hidden;
}

@media (max-width: 768px) {
    .pagination-container {
        @apply flex justify-center;
    }
}
</style>
