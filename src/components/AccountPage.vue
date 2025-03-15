<template>
    <el-container id="accountPanel" class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-5 min-h-[calc(100vh-40px)] flex flex-col border dark:border-gray-800">
        <header class="px-4 py-3">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">账号管理</h2>
        </header>
        <el-main class="flex-1">
            <!-- 搜索栏响应式布局 -->
            <el-row class="mb-7" :gutter="20">
                <el-col :xs="24" :sm="24" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email" class="w-full dark-input">
                        <template v-slot:input>
                            <input class="el-input__inner dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-500" :value="email" @input="e => email = e.target.value" placeholder="请输入邮箱">
                        </template>
                        <el-button slot="append" @click="emailQuery" class="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="6" class="flex justify-end sm:mt-4 md:mt-0">
                    <el-button class="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all duration-300 transform hover:-translate-y-0.5" type="primary" @click="showModal()">新增</el-button>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-if="!isMobile" class="hidden md:block relative h-full min-h-[300px]">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="pulse"/>
                
                <!-- 表头 -->
                <div class="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                    <div class="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 font-medium text-sm text-gray-500 dark:text-gray-300">
                        <div class="col-span-3 py-2.5 px-3">电子邮箱</div>
                        <div class="col-span-2 py-2.5 px-3">账号名称</div>
                        <div class="col-span-2 py-2.5 px-3">账号类型</div>
                        <div class="col-span-1 py-2.5 px-2 text-center">共享</div>
                        <div class="col-span-2 py-2.5 px-3">更新时间</div>
                        <div class="col-span-2 py-2.5 px-3">操作</div>
                    </div>
                    
                    <!-- 表格内容 -->
                    <div class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        <div v-for="(item, index) in tableData" :key="index" 
                            class="grid grid-cols-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                            <!-- 电子邮箱 -->
                            <div class="col-span-3 py-2.5 px-3">
                                <div class="flex items-center space-x-1.5">
                                    <i class="el-icon-message text-gray-400 text-sm"></i>
                                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ item.email }}</span>
                                </div>
                            </div>
                            
                            <!-- 账号名称 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <span class="text-gray-700 dark:text-gray-300">{{ item.name }}</span>
                            </div>
                            
                            <!-- 账号类型 -->
                            <div class="col-span-2 py-2 px-3">
                                <div class="flex items-center gap-1">
                                    <span class="text-gray-700 dark:text-gray-300 text-sm">{{ item.type }}</span>
                                    <template v-if="item.type === 'ChatGPT'">
                                        <span v-if="item.planType === 'plus'" 
                                            class="px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 leading-none">
                                            Plus
                                        </span>
                                        <span v-else-if="item.planType === 'free'" 
                                            class="px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 leading-none">
                                            Free
                                        </span>
                                        <span v-else-if="item.planType === 'team'" 
                                            class="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 leading-none">
                                            Team
                                        </span>
                                        <span v-else-if="item.planType === 'pro'" 
                                            class="px-1.5 py-0.5 rounded-full text-xs font-medium bg-black text-yellow-400 border-yellow-500 dark:bg-black/40 dark:text-yellow-300 dark:border-yellow-600 leading-none">
                                            Pro
                                        </span>
                                        <span v-else 
                                            class="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800 leading-none">
                                            已失效
                                        </span>
                                    </template>
                                </div>
                            </div>
                            
                            <!-- 共享 -->
                            <div class="col-span-1 py-2.5 px-2 text-center">
                                <span v-if="item.shared === 1" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/20">
                                    <i class="el-icon-circle-check text-green-500 text-sm"></i>
                                </span>
                                <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20">
                                    <i class="el-icon-circle-close text-red-500 text-sm"></i>
                                </span>
                            </div>
                            
                            <!-- 更新时间 -->
                            <div class="col-span-2 py-2 px-3">
                                <div class="flex items-center space-x-1">
                                    <i class="el-icon-time text-gray-400 text-xs"></i>
                                    <span class="text-gray-600 dark:text-gray-400 text-sm">{{ item.updateTime }}</span>
                                </div>
                            </div>
                            
                            <!-- 操作 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="flex flex-wrap gap-1.5">
                                    
                                    <button v-if="item.accountType === 1"
                                        @click="refresh(item.id)" 
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
                                        刷新
                                    </button>
                                    <button @click="showShareModal(item.id)" 
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200">
                                        共享
                                    </button>
                                    <button @click="editItem(item.id)"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200">
                                        编辑
                                    </button>
                                    <button @click="showConfirmDialog(item.id)"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 hover:-translate-y-0.5 transition-all duration-200">
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
                            <p class="text-lg">暂无账号数据</p>
                            <p class="text-sm mt-2">请添加新账号或修改搜索条件</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-else class="space-y-4 md:hidden relative h-full min-h-[300px]">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="pulse"/>
                <div v-for="(item, index) in tableData" :key="index" 
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    
                    <!-- 卡片顶部 -->
                    <div class="flex justify-between items-center mb-3">
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full flex items-center space-x-1.5 max-w-[70%] overflow-hidden">
                            <i class="el-icon-message"></i>
                            <span class="truncate">{{ item.email }}</span>
                        </div>
                        
                        <div class="flex items-center">
                            <span v-if="item.shared === 1" class="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <i class="el-icon-check mr-1"></i>已共享
                            </span>
                            <span v-else class="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                <i class="el-icon-close mr-1"></i>未共享
                            </span>
                        </div>
                    </div>

                    <!-- 卡片内容 -->
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">账号名称</div>
                            <div class="font-medium text-gray-800 dark:text-gray-200">{{ item.name }}</div>
                        </div>
                        <div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">账号类型</div>
                            <div class="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                {{ item.type }}
                                <template v-if="item.type === 'ChatGPT'">
                                    <span v-if="item.planType === 'plus'" 
                                        class="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 leading-none">
                                        Plus
                                    </span>
                                    <span v-else-if="item.planType === 'free'" 
                                        class="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 leading-none">
                                        Free
                                    </span>
                                </template>
                            </div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">更新时间</div>
                            <div class="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                <i class="el-icon-time text-gray-400 mr-2"></i>
                                {{ item.updateTime }}
                            </div>
                        </div>
                    </div>

                    <!-- 分隔线 -->
                    <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-3"></div>

                    <!-- 操作按钮 -->
                    <div class="grid grid-cols-2 gap-2.5">
                        <div class="col-span-2 grid grid-cols-2 gap-2.5">
                            <button v-if="item.accountType === 1" @click="refresh(item.id)"
                                class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition duration-150 shadow-sm hover:shadow">
                                <i class="el-icon-refresh mr-1.5"></i>刷新
                            </button>
                            <button @click="showShareModal(item.id)"
                                class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition duration-150 shadow-sm hover:shadow">
                                <i class="el-icon-share mr-1.5"></i>共享
                            </button>
                        </div>
                        <button @click="editItem(item.id)"
                            class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition duration-150 shadow-sm hover:shadow">
                            <i class="el-icon-edit mr-1.5"></i>编辑
                        </button>
                        <button @click="showConfirmDialog(item.id)"
                            class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm transition duration-150 shadow-sm hover:shadow">
                            <i class="el-icon-delete mr-1.5"></i>删除
                        </button>
                    </div>
                </div>
                
                <!-- 无数据状态 -->
                <div v-if="tableData.length === 0 && !loading" class="py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <svg class="w-14 h-14 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <p class="text-base">暂无账号数据</p>
                    <p class="text-xs mt-1.5">请添加新账号或修改搜索条件</p>
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
            <enhanced-dialog v-if="modalVisible" :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
                <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                    @updateValue="handleUpdateValue" />
            </enhanced-dialog>

            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                @confirm="handleDelete" />

            <!-- 图表组件 -->
            <div v-if="chartsVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-[90%] mx-4 shadow-2xl relative">
                    <div class="absolute -top-2 -right-2 z-10">
                        <button @click="closeChart" 
                            class="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center 
                            hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                            <i class="el-icon-close text-gray-600 dark:text-gray-300"></i>
                        </button>
                    </div>
                    <div ref="chart" class="w-full h-[400px]"></div>
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script>
import * as echarts from 'echarts'
import ConfirmDialog from '../modules/ConfirmDialog.vue';
import EnhancedDialog from '../modules/EnhancedDialog.vue';
import config from '../configs/config'
import apiClient from '../configs/axios'
import FormInput from '../modules/FormInput'
import message from '@/configs/message'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
    name: 'AccountPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput,
        LoadingSpinner
    },
    data() {
        return {
            loading: false,
            isMobile: false,
            email: '',
            tableData: [],
            currentPage: 1,
            shareAddFlag: false,
            total: 0,
            isDialogVisible: false,
            isAccDialogVisible: false,
            modalVisible: false,
            modalTitle: '新增项目',
            currentIndex: null, // 用于追踪当前编辑的项目索引
            chart: null,
            chartData: [],
            chartsVisible: false,

            formData: {},
            shareFormData: {},
            formFields: [
                { id: 'name', label: '账号名称', type: 'text', value: '', required: true },
                { id: 'email', label: '邮箱地址', type: 'text', value: '', required: true },
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' },{ value: 4, text: 'Grok' }], required: true },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '', required: true },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '', required: true },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '', required: false },
                { id: 'switchesGroup', label: '账号设置', type: 'group', value: '', required: false },
                { id: 'shared', label: '是否共享', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%' },
                { id: 'auto', label: '自动加入', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%' },
                { id: 'conversationIsolated', label: '会话隔离', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%', hideLabel: false },
            ],
            accountFields: [
                { id: 'name', label: '账号名称', type: 'text', value: '', required: true },
                { id: 'email', label: '邮箱地址', type: 'text', value: '', required: true },
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' },{ value: 4, text: 'Grok' }], required: true },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '', required: true },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '', required: true },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '', hideLabel: false },
                { id: 'switchesGroup', label: '账号设置', type: 'group', value: '', required: false },
                { id: 'shared', label: '是否共享', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%' },
                { id: 'auto', label: '自动加入', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%' },
                { id: 'conversationIsolated', label: '会话隔离', type: 'checkbox', value: false, required: true, layout: 'inline', width: '32%', hideLabel: false },
            ],
            shareFields: [
                { id: 'username', label: '用户名', type: 'text', value: '', required: true },
                { id: 'password', label: '密码', type: 'password', value: '', required: true },
                { id: 'comment', label: '备注', type: 'text', value: '', required: true },
                { id: 'mjEnable', label: '启用 Midjourney', type: 'checkbox', value: '', required: true },
                { id: 'expiresAt', label: '过期时间', type: 'date', value: '', required: true }
            ],
            isAdmin: false, // 新增管理员标志
        }
    },
    methods: {
        checkIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        initChart() {
            if (this.chart) {
                this.chart.dispose();
            }
            this.$nextTick(() => {
                this.chart = echarts.init(this.$refs.chart);
                const option = {
                    title: {
                        text: 'GPT使用情况统计',
                        subtext: '各用户模型使用次数统计',
                        left: 'center',
                        top: 10,
                        textStyle: {
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#333'
                        },
                        subtextStyle: {
                            fontSize: 12,
                            color: '#666'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: '#ccc',
                        borderWidth: 1,
                        textStyle: {
                            color: '#333'
                        },
                        formatter: function(params) {
                            let result = `<div class="font-semibold">${params[0].axisValue}</div>`;
                            params.forEach(param => {
                                if (param.value > 0) {
                                    result += `<div style="display: flex; justify-content: space-between; min-width: 150px; padding: 3px 0;">
                                        <span>${param.seriesName}:</span>
                                        <span class="font-semibold">${param.value}</span>
                                    </div>`;
                                }
                            });
                            return result;
                        }
                    },
                    legend: {
                        data: ['GPT-4o', 'GPT-4', 'GPT-4o-mini', 'o1-preview', 'o1-mini'],
                        bottom: 10,
                        icon: 'roundRect',
                        itemWidth: 12,
                        itemHeight: 12,
                        textStyle: {
                            fontSize: 12,
                            color: '#666'
                        }
                    },
                    grid: {
                        top: 100,
                        bottom: 80,
                        left: '5%',
                        right: '5%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: this.chartData.map(item => item.uniqueName),
                        axisLabel: {
                            rotate: 45,
                            fontSize: 12,
                            color: '#666',
                            interval: 0
                        },
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#ddd'
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '使用次数',
                        nameTextStyle: {
                            color: '#666',
                            fontSize: 12,
                            padding: [0, 0, 0, 40]
                        },
                        axisLabel: {
                            color: '#666',
                            fontSize: 12
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#eee',
                                type: 'dashed'
                            }
                        }
                    },
                    series: [
                        {
                            name: 'GPT-4o',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt_4o || 0),
                            itemStyle: { 
                                color: '#67C23A',
                                borderRadius: [4, 4, 0, 0]
                            },
                            barMaxWidth: 30,
                            emphasis: {
                                itemStyle: {
                                    color: '#85CE61'
                                }
                            }
                        },
                        {
                            name: 'GPT-4',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt_4 || 0),
                            itemStyle: { 
                                color: '#409EFF',
                                borderRadius: [4, 4, 0, 0]
                            },
                            barMaxWidth: 30,
                            emphasis: {
                                itemStyle: {
                                    color: '#66B1FF'
                                }
                            }
                        },
                        {
                            name: 'GPT-4o-mini',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt_4o_mini || 0),
                            itemStyle: { 
                                color: '#E6A23C',
                                borderRadius: [4, 4, 0, 0]
                            },
                            barMaxWidth: 30,
                            emphasis: {
                                itemStyle: {
                                    color: '#EBB563'
                                }
                            }
                        },
                        {
                            name: 'o1-preview',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.o1 || 0),
                            itemStyle: { 
                                color: '#3498db',
                                borderRadius: [4, 4, 0, 0]
                            },
                            barMaxWidth: 30,
                            emphasis: {
                                itemStyle: {
                                    color: '#5DADE2'
                                }
                            }
                        },
                        {
                            name: 'o1-mini',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.o1_mini || 0),
                            itemStyle: { 
                                color: '#F56C6C',
                                borderRadius: [4, 4, 0, 0]
                            },
                            barMaxWidth: 30,
                            emphasis: {
                                itemStyle: {
                                    color: '#F78989'
                                }
                            }
                        }
                    ]
                };
                this.chart.setOption(option);
            });
        },
        async statistic(id) {
            try {
                this.chartsVisible = true;

                const response = await apiClient.get(`${config.apiBaseUrl}/account/statistic?id=${id}`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.chartData = response.data.data;
                    this.initChart();
                } else {
                    this.$message.error('获取统计数据失败');
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                this.$message.error('获取统计数据时发生错误');
            }
        },
        closeChart() {
            this.chartsVisible = false;
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }
        },
        showConfirmDialog(id) {
            this.currentIndex = id;
            this.isDialogVisible = true;
        },
        async fetchAccounts(email) {
            try {
                this.loading = true;
                const response = await apiClient.get(`${config.apiBaseUrl}/account/list?page=` + this.currentPage + `&size=` + 10 + `&emailAddr=` + email, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status && response.data.data.total > 0) {
                    this.tableData = response.data.data.data
                    this.total = response.data.data.total
                }
            } catch (error) {
                console.log(error)
                message.error('获取账号列表失败')
            } finally {
                this.loading = false;
            }
        },
        handleUpdateValue(fieldId, newValue) {
            this.$set(this.formData, fieldId, newValue)
            console.log("newValue", newValue)
            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }

            if (fieldId === 'accountType') {
                const inputB = this.formFields.find(field => field.id === 'accessToken');
                const inputC = this.formFields.find(field => field.id === 'refreshToken');
                const conversationIsolatedField = this.formFields.find(field => field.id === 'conversationIsolated');
                
                switch (newValue) {
                    case 1:
                        inputB.label = 'ACCESS_TOKEN';
                        inputC.hideLabel = false;
                        inputC.label = 'REFRESH_TOKEN';
                        conversationIsolatedField.hideLabel = false ;
                        break;
                    case 2:
                        inputB.label = 'SESSION_KEY';
                        inputC.hideLabel = true;
                        conversationIsolatedField.hideLabel = false ;
                        break;
                    case 3:
                        inputB.label = 'API_PROXY';
                        inputC.hideLabel = false;
                        inputC.label = 'API_KEY';
                        conversationIsolatedField.hideLabel = true;
                        break;
                    case 4:
                        inputB.label = 'SSO Token';
                        inputC.hideLabel = true;
                        conversationIsolatedField.hideLabel = false ;
                        break;
                    default:
                        inputB.label = 'ChatGPT';
                        inputC.hideLabel = false;
                        inputC.label = 'ChatGPT';
                        conversationIsolatedField.hideLabel =   false;
                }
            }
        },
        showModal() {
            this.modalTitle = '新增账号';
            this.currentIndex = null;
            this.formFields = this.accountFields;
            this.resetFormFields();
            this.modalVisible = true;
        },
        showShareModal(id) {
            this.shareAddFlag = true;
            this.modalTitle = '新增共享';
            this.currentIndex = id;
            
            // 根据管理员状态过滤表单字段
            this.formFields = this.shareFields.filter(field => {
                // 如果不是管理员且字段是 mjEnable，则不显示
                if (!this.isAdmin && field.id === 'mjEnable') {
                    return false;
                }
                return true;
            });
            
            this.resetFormFields();
            this.modalVisible = true;
        },
        async editItem(index) {
            try {
                this.modalTitle = '编辑账号';
                this.formFields = this.accountFields;
                this.currentIndex = index;
                const response = await apiClient.get(`${config.apiBaseUrl}/account/getById?id=` + index, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                let acc = response.data.data;
                let accountType = 1;
                this.formFields.forEach(field => {
                    field.value = acc[field.id];
                    if (field.id === 'accountType') {
                        accountType = field.value
                    }
                    this.formData[field.id] = acc[field.id];
                });
                const inputB = this.formFields.find(field => field.id === 'accessToken');
                const inputC = this.formFields.find(field => field.id === 'refreshToken');
                const conversationIsolatedField = this.formFields.find(field => field.id === 'conversationIsolated');
                switch (accountType) {
                    case 1:
                        inputC.hideLabel = false;
                        inputB.label = 'ACCESS_TOKEN';
                        inputC.label = 'REFRESH_TOKEN';
                        conversationIsolatedField.hideLabel = false;
                        break;
                    case 2:
                        inputB.label = 'SESSION_KEY';
                        inputC.hideLabel = true;
                        conversationIsolatedField.hideLabel = false;
                        break;
                    case 3:
                        inputB.label = 'API_PROXY';
                        inputC.hideLabel = false;
                        inputC.label = 'API_KEY';
                        conversationIsolatedField.hideLabel = true;
                        break;
                    case 4:
                        inputB.label = 'SSO Token';
                        inputC.hideLabel = true;
                        conversationIsolatedField.hideLabel = false;
                        break;
                    default:
                        inputC.hideLabel = false;
                        inputC.label = 'ChatGPT';
                        conversationIsolatedField.hideLabel = false;
                }
                this.modalVisible = true;
            } catch (error) {
                message.error('获取账号信息失败');
            }
        },
        closeModal() {
            this.currentIndex = null;
            this.modalVisible = false;
            this.shareAddFlag = false;
        },
        async submitForm() {
            try {
                const itemData = { ...this.formData };
                
                // 移除 group 类型的字段
                Object.keys(itemData).forEach(key => {
                    const field = this.formFields.find(f => f.id === key);
                    if (field && field.type === 'group') {
                        delete itemData[key];
                    }
                });

                if (this.shareAddFlag) {
                    itemData.uniqueName = itemData.username
                    itemData.accountId = this.currentIndex
                    const response = await apiClient.post(`${config.apiBaseUrl}/share/add`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    if (!response.data.status) {
                        message.error(response.data.message)
                    } else {
                        message.success("新增账号共享成功")
                    }
                }
                else if (this.currentIndex !== null) {
                    itemData.auto = itemData.auto ? 1 : 0;
                    itemData.shared = itemData.shared ? 1 : 0;
                    itemData.conversationIsolated = itemData.conversationIsolated ? 1 : 0;
                    itemData.accountType = itemData.accountType === '' ? 1 : itemData.accountType;
                    itemData.id = this.currentIndex;
                    await apiClient.patch(`${config.apiBaseUrl}/account/update`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    message.success("修改成功")
                } else {
                    itemData.auto = itemData.auto ? 1 : 0;
                    itemData.shared = itemData.shared ? 1 : 0;
                    itemData.conversationIsolated = itemData.conversationIsolated ? 1 : 0;
                    itemData.accountType = itemData.accountType === '' ? 1 : itemData.accountType;
                    await apiClient.post(`${config.apiBaseUrl}/account/add`, itemData, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });
                    message.success("新增成功")
                }
                this.fetchAccounts('')
                this.closeModal();
            } catch (error) {
                message.error('操作失败，请稍后重试');
            }
        },
        resetFormFields() {
            this.shareAdd = false;
            this.formData = {};
            this.formFields.forEach(field => {
                // 跳过 group 类型的字段
                if (field.type === 'group') return;
                
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.formData[field.id] = defaultValue;
                
                // 根据默认账号类型设置会话隔离字段的显示状态
                if (field.id === 'conversationIsolated') {
                    // 默认账号类型通常是 ChatGPT (1)，所以默认显示会话隔离选项
                    field.hidden = false;
                }
            });
        },
        emailQuery() {
            this.fetchAccounts(this.email)
        },
        async handleDelete() {
            try {
                const response = await apiClient.delete(`${config.apiBaseUrl}/account/delete?id=` + this.currentIndex, {
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
                this.fetchAccounts('')
                this.currentIndex = null;
                this.isDialogVisible = false
            } catch (error) {
                message.error('删除失败，请稍后重试');
            }
        },
        handleCurrentChange() {
            this.fetchAccounts('')
        },
        async refresh(id) {
            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/account/refresh?id=` + id, {}, {
                    withCredentials: true,
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    message.success('刷新成功');
                } else {
                    message.error(response.data.msg);
                }
            } catch (error) {
                message.error('刷新失败，请稍后重试');
            }
        },
        async checkAdminStatus() {
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
        }
    },
    mounted() {
        this.fetchAccounts('');
        this.checkIsMobile();
        this.checkAdminStatus();
        window.addEventListener('resize', this.checkIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkIsMobile);
        if (this.chart) {
            this.chart.dispose();
        }
    }
}
</script>

<style scoped>
/* 添加圆润字体样式 */
#accountPanel,
.el-main,
button,
input,
.el-input__inner,
.el-pagination,
.el-popover,
.pagination-container,
.card-title,
.card-content {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "STHeiti", "WenQuanYi Micro Hei", "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC", "HarmonyOS Sans SC", system-ui, -apple-system, "SF Pro Text", Roboto, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    letter-spacing: 0.015em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "ss01", "ss02";
    font-variant-numeric: tabular-nums;
}

/* 不同元素的字体大小和粗细调整 */
#accountPanel h2 {
    font-weight: 600;
}

.el-button,
button {
    font-weight: 500;
}

/* 更新时间字段字体大小调整 */
.col-span-2 .text-gray-600.dark\:text-gray-400.text-sm {
    font-size: 0.8125rem; /* 13px */
}

/* 账号名称列字体调整 */
.grid-cols-12 .col-span-3:first-child .text-gray-700,
.grid-cols-12 .col-span-3:first-child,
.truncate {
    font-size: 0.875rem; /* 14px */
    letter-spacing: -0.01em; /* 字母间距略微紧凑 */
    font-weight: 600; /* 加粗字体 */
}

/* 账号名称列特定样式 */
.col-span-2 .text-gray-700.dark\:text-gray-300:not(.text-sm),
.col-span-2 > .text-gray-700.dark\:text-gray-300 {
    font-size: 0.875rem !important; /* 14px */
    font-weight: 600 !important; /* 加粗字体 */
    letter-spacing: -0.01em !important; /* 字母间距略微紧凑 */
}

/* 确保邮箱和账号名称列的字体大小和粗细一致 */
.col-span-3 .text-gray-700.dark\:text-gray-300.truncate,
.col-span-2 > .text-gray-700.dark\:text-gray-300 {
    font-size: 0.875rem !important; /* 14px */
    font-weight: 600 !important; /* 加粗字体 */
}

/* 重要：直接定位账号名称列 */
#accountPanel .grid-cols-12 > .col-span-2:nth-child(2) > .text-gray-700.dark\:text-gray-300 {
    font-size: 0.875rem !important; /* 14px */
    font-weight: 600 !important; /* 加粗字体 */
    letter-spacing: -0.01em !important; /* 字母间距略微紧凑 */
}

/* 所有内容字体稍微调小 */
.text-sm {
    font-size: 0.8125rem; /* 13px */
}

.text-xs {
    font-size: 0.75rem; /* 12px */
}

/* 字体样式增强 - 避免对关键元素产生影响 */
.text-sm:not(.col-span-2 > .text-gray-700.dark\:text-gray-300):not(.col-span-3 .text-gray-700.dark\:text-gray-300.truncate) {
    @apply font-sans;
    letter-spacing: 0.01em;
}

.text-xs {
    @apply font-sans;
    letter-spacing: 0.02em;
}

.font-medium, .font-semibold {
    @apply tracking-tight;
}

/* 标题增强 */
h2, .text-xl {
    letter-spacing: -0.02em;
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

/* 表头字体样式 */
#accountPanel .grid-cols-12.bg-gray-50.dark\:bg-gray-800 .col-span-2,
#accountPanel .grid-cols-12.bg-gray-50.dark\:bg-gray-800 .col-span-3 {
    font-size: 0.8125rem; /* 13px */
    font-weight: 500;
    letter-spacing: 0.01em;
}

/* 标题增强 */
</style>
