<template>
    <el-container id="sharePanel" class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-5 min-h-[calc(100vh-40px)] flex flex-col border dark:border-gray-800 share-container">
        <header class="px-4 py-3">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">分享管理</h2>
        </header>
        <el-main class="flex-1 share-main">
            <el-row class="mb-7">
                <el-col :xs="24" :sm="18" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱或用户名" v-model="email" class="w-full dark-input">
                        <template v-slot:input>
                            <input class="el-input__inner dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-500" :value="email" @input="e => email = e.target.value" placeholder="请输入邮箱或用户名">
                        </template>
                        <el-button slot="append" @click="emailQuery" class="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">查询</el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-if="!isMobile" class="hidden md:block relative h-full">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="dots"/>
                
                <!-- 表头 -->
                <div class="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                    <div class="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 font-medium text-sm text-gray-500 dark:text-gray-300">
                        <div class="col-span-2 py-2.5 px-3">用户名</div>
                        <div class="col-span-2 py-2.5 px-3">ChatGPT账号</div>
                        <div class="col-span-2 py-2.5 px-3">Claude账号</div>
                        <div class="col-span-2 py-2.5 px-3">Grok账号</div>
                        <div class="col-span-2 py-2.5 px-3">API账号</div>
                        <div class="col-span-2 py-2.5 px-3">操作</div>
                    </div>
                    
                    <!-- 表格内容 -->
                    <div class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        <div v-for="(item, index) in tableData" :key="index" 
                            class="grid grid-cols-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                            <!-- 用户名 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="group relative">
                                    <div class="flex items-center space-x-1.5 rounded-md px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
                                        <span class="text-gray-700 dark:text-gray-300">{{ item.uniqueName }}</span>
                                        <i class="el-icon-info-circle text-gray-400"></i>
                                    </div>
                                    
                                    <!-- 悬停信息卡片 -->
                                    <div :class="[
                                        'absolute z-50 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out pointer-events-none group-hover:pointer-events-auto',
                                        index % 6 >= 4 ? 'top-full right-0' : 'top-full left-0'
                                    ]">
                                        <div class="bg-white dark:bg-gray-800 w-60 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                                            <div class="space-y-2 text-xs">
                                                <template v-if="hasAccounts(item)">
                                                    <div v-if="item.gptExpiresAt" class="flex items-center justify-between">
                                                        <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">ChatGPT:</span>
                                                        <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ item.gptExpiresAt }}</span>
                                                    </div>
                                                    <div v-if="item.claudeExpiresAt" class="flex items-center justify-between">
                                                        <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">Claude:</span>
                                                        <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ item.claudeExpiresAt }}</span>
                                                    </div>
                                                    <div v-if="item.grokExpiresAt" class="flex items-center justify-between">
                                                        <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">Grok:</span>
                                                        <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ item.grokExpiresAt }}</span>
                                                    </div>
                                                    <div v-if="item.apiExpiresAt" class="flex items-center justify-between">
                                                        <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">API:</span>
                                                        <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ item.apiExpiresAt }}</span>
                                                    </div>
                                                </template>
                                                <template v-else>
                                                    <div class="py-1 text-center text-gray-500 dark:text-gray-400">
                                                        <i class="el-icon-info-circle mr-1"></i> 当前用户暂无账号
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- ChatGPT账号 -->
                            <div class="col-span-2 py-2 px-3">
                                <split-button :name="item.gptCarName" :count="item.gptUserCount || 0" type="gpt"
                                    @click="openChat(item.gptConfigId, 1)" 
                                    :days="item.gptExpiresAt ? calculateDays(item.gptExpiresAt) : 0"
                                    :loading="item.loading" 
                                    class="compact"/>
                            </div>
                            
                            <!-- Claude账号 -->
                            <div class="col-span-2 py-2 px-3">
                                <split-button :name="item.claudeCarName" :count="item.claudeUserCount || 0"
                                    type="claude"
                                    @click="openChat(item.claudeConfigId, 2)" 
                                    :days="item.claudeExpiresAt ? calculateDays(item.claudeExpiresAt) : 0"
                                    :loading="item.loading" 
                                    class="compact"/>
                            </div>
                            
                            <!-- Grok账号 -->
                            <div class="col-span-2 py-2 px-3">
                                <split-button :name="item.grokCarName" :count="item.grokUserCount || 0" type="grok"
                                    @click="openChat(item.grokConfigId, 4)" 
                                    :days="item.grokExpiresAt ? calculateDays(item.grokExpiresAt) : 0"
                                    :loading="item.loading" 
                                    class="compact"/>
                            </div>
                            
                            <!-- API账号 -->
                            <div class="col-span-2 py-2 px-3">
                                <split-button :name="item.apiCarName" :count="item.apiUserCount || 0" type="api"
                                    @click="openChat(item.apiConfigId, 3)" 
                                    :days="item.apiExpiresAt ? calculateDays(item.apiExpiresAt) : 0"
                                    :loading="item.loading" 
                                    class="compact"/>
                            </div>
                            
                            <!-- 操作 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="flex flex-wrap gap-1.5">
                                    <button @click="showShareModal(item.id)" :disabled="item.actionLoading"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <i class="el-icon-check" v-if="!item.actionLoading"></i>
                                        <i class="el-icon-loading animate-spin" v-else></i>
                                        激活
                                    </button>
                                    <button @click="editItem(item.id)" :disabled="item.actionLoading"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        编辑
                                    </button>
                                    <button @click="showConfirmDialog(item.id)" :disabled="item.actionLoading"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 无数据状态 -->
                        <div v-if="tableData.length === 0 && !loading" class="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                            <p class="text-lg">暂无共享账号数据</p>
                            <p class="text-sm mt-2">请添加新共享或修改搜索条件</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-else class="space-y-4 md:hidden relative h-full">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="dots"/>
                <div v-for="(item, index) in tableData" :key="index" 
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    
                    <!-- 卡片顶部 -->
                    <div class="flex justify-between items-center mb-3">
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full flex items-center space-x-1.5 max-w-[70%] overflow-hidden">
                            <i class="el-icon-user"></i>
                            <span class="truncate">{{ item.uniqueName }}</span>
                        </div>
                        
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ item.comment }}
                        </div>
                    </div>

                    <!-- 账号信息 -->
                    <div class="space-y-3 mb-3">
                        <div v-if="item.gptCarName" class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <div class="text-xs text-gray-500 dark:text-gray-400">ChatGPT账号</div>
                                <div v-if="item.gptExpiresAt" class="text-xs text-gray-500 dark:text-gray-400">
                                    还有 <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ calculateDays(item.gptExpiresAt) }}</span> 天
                                </div>
                            </div>
                            <div class="w-full">
                                <button @click="openChat(item.gptConfigId, 1)" :disabled="item.loading" 
                                    class="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm transition duration-200 flex items-center justify-center space-x-1.5 disabled:opacity-70">
                                    <i class="el-icon-loading animate-spin" v-if="item.loading"></i>
                                    <i class="el-icon-chat-dot-round" v-else></i>
                                    <span>{{ item.gptCarName || '未配置' }}</span>
                                    <span v-if="item.gptUserCount" class="px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {{ item.gptUserCount }}人
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div v-if="item.claudeCarName" class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <div class="text-xs text-gray-500 dark:text-gray-400">Claude账号</div>
                                <div v-if="item.claudeExpiresAt" class="text-xs text-gray-500 dark:text-gray-400">
                                    还有 <span class="font-semibold text-purple-600 dark:text-purple-400">{{ calculateDays(item.claudeExpiresAt) }}</span> 天
                                </div>
                            </div>
                            <div class="w-full">
                                <button @click="openChat(item.claudeConfigId, 2)" :disabled="item.loading" 
                                    class="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm transition duration-200 flex items-center justify-center space-x-1.5 disabled:opacity-70">
                                    <i class="el-icon-loading animate-spin" v-if="item.loading"></i>
                                    <i class="el-icon-chat-dot-round" v-else></i>
                                    <span>{{ item.claudeCarName || '未配置' }}</span>
                                    <span v-if="item.claudeUserCount" class="px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {{ item.claudeUserCount }}人
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div v-if="item.grokCarName" class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <div class="text-xs text-gray-500 dark:text-gray-400">Grok账号</div>
                                <div v-if="item.grokExpiresAt" class="text-xs text-gray-500 dark:text-gray-400">
                                    还有 <span class="font-semibold text-sky-600 dark:text-sky-400">{{ calculateDays(item.grokExpiresAt) }}</span> 天
                                </div>
                            </div>
                            <div class="w-full">
                                <button @click="openChat(item.grokConfigId, 4)" :disabled="item.loading" 
                                    class="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white text-sm transition duration-200 flex items-center justify-center space-x-1.5 disabled:opacity-70">
                                    <i class="el-icon-loading animate-spin" v-if="item.loading"></i>
                                    <i class="el-icon-chat-dot-round" v-else></i>
                                    <span>{{ item.grokCarName || '未配置' }}</span>
                                    <span v-if="item.grokUserCount" class="px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {{ item.grokUserCount }}人
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div v-if="item.apiCarName" class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <div class="text-xs text-gray-500 dark:text-gray-400">API账号</div>
                                <div v-if="item.apiExpiresAt" class="text-xs text-gray-500 dark:text-gray-400">
                                    还有 <span class="font-semibold text-red-600 dark:text-red-400">{{ calculateDays(item.apiExpiresAt) }}</span> 天
                                </div>
                            </div>
                            <div class="w-full">
                                <button @click="openChat(item.apiConfigId, 3)" :disabled="item.loading" 
                                    class="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm transition duration-200 flex items-center justify-center space-x-1.5 disabled:opacity-70">
                                    <i class="el-icon-loading animate-spin" v-if="item.loading"></i>
                                    <i class="el-icon-connection" v-else></i>
                                    <span>{{ item.apiCarName || '未配置' }}</span>
                                    <span v-if="item.apiUserCount" class="px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {{ item.apiUserCount }}人
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 分隔线 -->
                    <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-3"></div>

                    <!-- 操作按钮 -->
                    <div class="grid grid-cols-3 gap-2.5">
                        <button @click="showShareModal(item.id)" :disabled="item.actionLoading"
                            class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition duration-150 shadow-sm hover:shadow disabled:opacity-50">
                            <i class="el-icon-check mr-1.5" v-if="!item.actionLoading"></i>
                            <i class="el-icon-loading animate-spin mr-1.5" v-else></i>
                            激活
                        </button>
                        <button @click="editItem(item.id)" :disabled="item.actionLoading"
                            class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition duration-150 shadow-sm hover:shadow disabled:opacity-50">
                            <i class="el-icon-edit mr-1.5"></i>编辑
                        </button>
                        <button @click="showConfirmDialog(item.id)" :disabled="item.actionLoading"
                            class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm transition duration-150 shadow-sm hover:shadow disabled:opacity-50">
                            <i class="el-icon-delete mr-1.5"></i>删除
                        </button>
                    </div>
                </div>
                
                <!-- 无数据状态 -->
                <div v-if="tableData.length === 0 && !loading" class="py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <svg class="w-14 h-14 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <p class="text-base">暂无共享账号数据</p>
                    <p class="text-xs mt-1.5">请添加新共享</p>
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

            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个共享账户吗？"
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
import SplitButton from './SplitButton.vue'  // 确保路径正确
import message from '@/configs/message'
import LoadingSpinner from './LoadingSpinner.vue'
// import { Loading } from 'element-ui';

export default {
    name: 'SharePage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput,
        SplitButton,
        LoadingSpinner
    },
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
            loading: false,
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
                { id: 'mjEnable', label: '启用 Midjourney', type: 'checkbox', value: '', required: true }
            ],
            shareFields: [
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' }, { value: 4, text: 'Grok' }], required: true },
                { id: 'accountOptions', label: '选择账号', type: 'select', value: '', options: this.accountOpts },
                { id: 'expiresAt', label: '过期时间', type: 'date', value: '', required: true }
            ],
            isAdmin: false,
        }
    },
    methods: {
        checkIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        async openChat(id, type) {
            if (id === null) {
                return
            }

            // 找到对应的行
            const item = this.tableData.find(item => {
                switch (type) {
                    case 1: return item.gptConfigId === id;
                    case 2: return item.claudeConfigId === id;
                    case 3: return item.apiConfigId === id;
                    case 4: return item.grokConfigId === id;
                }
            });

            if (!item) return;
            
            // 设置加载状态
            this.$set(item, 'loading', true);

            try {
                const body = {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                };

                let response;
                switch (type) {
                    case 1:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getGptShare?gptConfigId=${id}`, body);
                        break;
                    case 2:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getClaudeShare?claudeConfigId=${id}`, body);
                        break;
                    case 3:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getApiShare?apiConfigId=${id}`, body);
                        break;
                    case 4:
                        response = await apiClient.get(`${config.apiBaseUrl}/share/getGrokShare?grokConfigId=${id}`, body);
                        break;
                }

                if (response?.data?.status) {
                    window.open(response.data.data)
                }
            } catch (error) {
                console.error('请求失败:', error);
                this.$message.error('操作失败，请重试');
            } finally {
                // 清除加载状态
                this.$set(item, 'loading', false);
            }
        },
        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },
        async fetchItems(email) {
            this.loading = true;
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/share/list?page=${this.currentPage}&size=10&emailAddr=${email}`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.tableData = response.data.data.data.map(item => ({
                        ...item,
                        loading: false
                    }));
                    this.total = response.data.data.total;
                }
            } catch (error) {
                message.error(error)
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
            this.formFields = this.shareFields;
            this.resetFormFields();
            this.modalVisible = true;
            this.activateFlag = true;

            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=1`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                this.accountOpts = response.data.data;
                const newF = this.shareFields.find(f => f.id === "accountOptions");
                if (newF) {
                    newF.options = this.accountOpts;
                    this.formData = {
                        'accountId': parseInt(this.accountOpts[0]?.value),
                        'id': id
                    };
                }
            } catch (error) {
                message.error('获取账号选项失败');
            }
        },
        async editItem(index) {
            this.modalTitle = '编辑共享';
            this.formFields = [
                { id: 'uniqueName', label: '用户名', type: 'text', value: '', required: true },
                { id: 'comment', label: '备注', type: 'text', value: '', required: true },
                ...(this.isAdmin ? [{ 
                    id: 'mjEnable', 
                    label: '启用 Midjourney', 
                    type: 'checkbox', 
                    value: '', 
                    required: true 
                }] : [])
            ];
            this.currentIndex = index;

            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/share/getById?id=${index}`, {
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
            } catch (error) {
                message.error('获取共享信息失败');
            }
        },
        closeModal() {
            this.modalVisible = false;
            this.shareAddFlag = false;
            this.activateFlag = false;
            this.formData = {};
        },
        async submitForm() {
            const itemData = { ...this.formData };
            const item = this.tableData.find(item => item.id === this.currentIndex);
            if (item) {
                item.actionLoading = true;
            }

            try {
                if (this.activateFlag) {
                    itemData.accountId = itemData.accountOptions ? parseInt(itemData.accountOptions) : itemData.accountId;
                    itemData.id = this.currentIndex;
                    itemData.accountType = parseInt(itemData.accountType);

                    const response = await apiClient.post(`${config.apiBaseUrl}/share/distribute`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (response.data.status) {
                        message.success('激活成功');
                    } else {
                        message.error(response.data.message);
                    }
                } else if (this.currentIndex !== null) {
                    itemData.id = this.currentIndex;
                    const response = await apiClient.patch(`${config.apiBaseUrl}/share/update`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (response.data.status) {
                        message.success("编辑成功");
                    }
                }
            } catch (error) {
                message.error('操作失败');
            } finally {
                if (item) {
                    item.actionLoading = false;
                }
                await this.fetchItems('');
                this.closeModal();
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
            this.fetchItems(this.email);
        },
        async handleDelete() {
            const item = this.tableData.find(item => item.id === this.currentIndex);
            if (item) {
                item.actionLoading = true;
            }

            try {
                const response = await apiClient.delete(`${config.apiBaseUrl}/share/delete?id=${this.currentIndex}`, {
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
            } catch (error) {
                message.error('删除失败');
            } finally {
                if (item) {
                    item.actionLoading = false;
                }
                await this.fetchItems('');
                this.isDialogVisible = false;
            }
        },
        handleCurrentChange() {
            this.fetchItems('');
        },
        async handleSelectChange({ type, field, value }) {
            if (type === 1 && field.id !== "accountOptions") {
                try {
                    const response = await apiClient.get(`${config.apiBaseUrl}/account/options?type=${value}`, {
                        withCredentials: true,
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    this.accountOpts = response.data.data;
                    field.value = value;
                    const newF = this.shareFields.find(f => f.id === "accountOptions");
                    if (newF) {
                        newF.options = this.accountOpts;
                    }
                } catch (error) {
                    message.error('获取账号选项失败');
                }
            }
        },
        calculateDays(expiresAt) {
            if (!expiresAt || expiresAt === '-') {
                return '-';
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const expireDate = new Date(expiresAt);
            expireDate.setHours(0, 0, 0, 0);
            
            const diffTime = expireDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return Math.max(0, diffDays);
        },
        hasAccounts(item) {
            return item.gptExpiresAt || item.claudeExpiresAt || item.apiExpiresAt;
        },
        async checkAdminRole() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/user/info`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.isAdmin = response.data.data.id === 1;
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            }
        },
    },
    mounted() {
        this.fetchItems('');
        this.checkIsMobile();
        this.checkAdminRole();
        window.addEventListener('resize', this.checkIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkIsMobile);
    }
}
</script>

<style scoped>
/* 添加圆润字体样式 */
#sharePanel,
.share-container,
.share-main,
.el-main,
button,
input,
.el-input__inner,
.el-pagination,
.el-popover {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "STHeiti", "WenQuanYi Micro Hei", "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC", "HarmonyOS Sans SC", system-ui, -apple-system, "SF Pro Text", Roboto, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    letter-spacing: 0.015em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "ss01", "ss02";
    font-variant-numeric: tabular-nums;
}

/* 不同元素的字体大小和粗细调整 */
#sharePanel h2 {
    font-weight: 600;
}

.el-button,
button {
    font-weight: 500;
}

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
    @apply flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-0;
}

:deep(.el-pagination button) {
    @apply inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150;
}

:deep(.el-pagination button:disabled) {
    @apply opacity-50 cursor-not-allowed;
}

:deep(.el-pagination .el-pager li) {
    @apply inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150;
}

:deep(.el-pagination .el-pager li.active) {
    @apply text-white bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700;
}

/* 优化弹出框样式 */
:deep(.el-popover) {
    @apply dark:bg-gray-800 dark:border-gray-700;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-popover .el-popper__arrow) {
    @apply dark:border-gray-700;
}

:deep(.el-popover .el-popper__arrow::after) {
    @apply dark:bg-gray-800;
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

/* 确保容器不限制悬浮元素显示 */
#sharePanel,
.el-container,
.el-main,
.rounded-xl,
.rounded-2xl,
.divide-y,
.grid,
.grid-cols-12 {
    overflow: visible !important;
}

/* 适配移动设备的字体 */
@media (max-width: 768px) {
    #sharePanel,
    .share-container {
        font-size: 14px;
    }
    
    #sharePanel h2 {
        font-size: 18px;
    }
    
    button, .el-button {
        font-size: 13px;
    }
}

/* 表格内字体优化 */
.grid-cols-12 .col-span-2 {
    font-weight: 400;
    line-height: 1.5;
}

/* 用户名列字体大小调整 */
.grid-cols-12 .col-span-2:first-child,
.grid-cols-12 .col-span-2:first-child .text-gray-700,
.truncate {
    font-size: 0.875rem; /* 14px */
    letter-spacing: -0.01em; /* 字母间距略微紧凑 */
    font-weight: 600; /* 加粗字体 */
}

/* 所有内容字体稍微调小 */
.text-sm {
    font-size: 0.8125rem; /* 13px */
}

.text-xs {
    font-size: 0.75rem; /* 12px */
}

/* 用户名弹出提示框样式优化 */
.group-hover\:opacity-100 .text-xs {
    font-size: 0.75rem; /* 12px */
    line-height: 1.5;
}

/* 确保移动端用户名字体也调小 */
.bg-gradient-to-r.from-blue-50.to-indigo-50 .truncate {
    font-size: 0.8125rem; /* 13px */
    font-weight: 600; /* 加粗字体，提高可读性 */
}

/* 账号信息字体大小 */
.el-icon-chat-dot-round + span,
.el-icon-connection + span {
    font-size: 0.8125rem; /* 13px */
}

/* 确保数字等对齐美观 */
.font-semibold, .rounded-full, .px-1\.5 {
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
}
</style>
