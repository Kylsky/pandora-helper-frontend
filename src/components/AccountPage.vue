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
            <div v-if="!isMobile" class="hidden md:block">
                <el-table :data="tableData" style="width: 100%" :fit="true" 
                    v-loading="loading"
                    element-loading-text="加载中..."
                    element-loading-spinner="el-icon-loading"
                    :cell-style="{ padding: '8px 0' }"
                    :header-cell-style="{ padding: '8px 0' }"
                    :row-style="{ height: '48px' }"
                    :header-row-style="{ height: '48px' }"
                    size="small">
                    <el-table-column prop="email" label="电子邮箱" min-width="180" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div class="flex items-center space-x-2">
                                <i class="el-icon-message text-gray-400 text-sm"></i>
                                <span class="text-gray-700 dark:text-gray-300">{{ scope.row.email }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="账号名称" min-width="120" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span class="text-gray-700 dark:text-gray-300">{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="账号类型" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div class="flex items-center space-x-2">
                                <span class="text-gray-700 dark:text-gray-300">{{ scope.row.type }}</span>
                                <template v-if="scope.row.type === 'ChatGPT'">
                                    <el-tag v-if="scope.row.planType === 'plus'" class="bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" effect="plain" size="mini">Plus</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'free'" class="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" effect="plain" size="mini">Free</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'team'" class="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" effect="plain" size="mini">Team</el-tag>
                                    <el-tag v-else-if="scope.row.planType === 'pro'" class="bg-black text-yellow-400 border-yellow-500 dark:bg-black/40 dark:text-yellow-300 dark:border-yellow-600" effect="plain" size="mini">Pro</el-tag>
                                    <el-tag v-else class="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800" effect="plain" size="mini">已失效</el-tag>
                                </template>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="shared" label="共享" width="120" align="center" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <i class="el-icon-circle-check text-green-500" v-if="scope.row.shared === 1"></i>
                            <i class="el-icon-circle-close text-red-500" v-else></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTime" label="更新时间" min-width="160" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div class="flex items-center space-x-2">
                                <i class="el-icon-time text-gray-400 text-sm"></i>
                                <span class="text-gray-600 dark:text-gray-400 font-medium">{{ scope.row.updateTime }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="320" fixed="right">
                        <template slot-scope="scope">
                            <div class="flex space-x-2">
                                <el-button type='info' size="mini" v-if="scope.row.accountType === 1"
                                    @click="refresh(scope.row.id)" class="hover:-translate-y-0.5 transition-transform duration-200">刷新</el-button>
                                <!-- <el-button type="success" size="mini" v-if="scope.row.type === 'ChatGPT'"
                                    @click="statistic(scope.row.id)" class="hover:-translate-y-0.5 transition-transform duration-200">统计</el-button> -->
                                <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)" 
                                    class="hover:-translate-y-0.5 transition-transform duration-200">共享</el-button>
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">编辑</el-button>
                                <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">删除</el-button>
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
                            <span class="truncate">{{ item.email }}</span>
                        </div>
                        <div class="px-3 py-1 rounded-full text-sm font-medium" 
                            :class="{ 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400': item.shared === 1, 
                                     'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400': item.shared !== 1 }">
                            {{ item.shared === 1 ? '已共享' : '未共享' }}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                    <i class="el-icon-user"></i>
                                    <span>账号类型</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.type }}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-2">
                                    <i class="el-icon-time"></i>
                                    <span>更新时间</span>
                                </div>
                                <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ item.updateTime }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

                    <div class="space-y-3">
                        <div class="flex space-x-2">
                            <el-button v-if="item.accountType === 1" type="info" size="mini" @click="refresh(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-refresh mr-1"></i> 刷新
                            </el-button>
                            <el-button type="primary" size="mini" @click="showShareModal(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-share mr-1"></i> 共享
                            </el-button>
                            <el-button type="warning" size="mini" @click="editItem(item.id)"
                                class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-edit mr-1"></i> 编辑
                            </el-button>
                        </div>
                        <div class="flex">
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

export default {
    name: 'AccountPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
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
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }], required: true },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '', required: true },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '', required: true },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '', required: false },
                { id: 'shared', label: '是否共享', type: 'checkbox', value: false, required: true },
                { id: 'auto', label: '自动加入', type: 'checkbox', value: false, required: true },
            ],
            accountFields: [
                { id: 'name', label: '账号名称', type: 'text', value: '', required: true },
                { id: 'email', label: '邮箱地址', type: 'text', value: '', required: true },
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' }], required: true },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '', required: true },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '', required: true },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '', hideLabel: false },
                { id: 'shared', label: '是否共享', type: 'checkbox', value: false, required: true },
                { id: 'auto', label: '自动加入', type: 'checkbox', value: false, required: true },
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

            const fieldIndex = this.formFields.findIndex(field => field.id === fieldId);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = newValue;
            }

            if (fieldId === 'accountType') {
                const inputB = this.formFields.find(field => field.id === 'accessToken');
                const inputC = this.formFields.find(field => field.id === 'refreshToken');
                
                switch (newValue) {
                    case 1:
                        inputB.label = 'ACCESS_TOKEN';
                        inputC.hideLabel = false;
                        inputC.label = 'REFRESH_TOKEN';
                        break;
                    case 2:
                        inputB.label = 'SESSION_KEY';
                        inputC.hideLabel = true;
                        break;
                    case 3:
                        inputB.label = 'API_PROXY';
                        inputC.hideLabel = false;
                        inputC.label = 'API_KEY';
                        break;
                    default:
                        inputB.label = 'ChatGPT';
                        inputC.hideLabel = false;
                        inputC.label = 'ChatGPT';
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
                switch (accountType) {
                    case 1:
                        inputC.hideLabel = false;
                        inputB.label = 'ACCESS_TOKEN';
                        inputC.label = 'REFRESH_TOKEN';
                        break;
                    case 2:
                        inputB.label = 'SESSION_KEY';
                        inputC.hideLabel = true;
                        break;
                    case 3:
                        inputB.label = 'API_PROXY';
                        inputC.hideLabel = false;
                        inputC.label = 'API_KEY';
                        break;
                    default:
                        inputC.hideLabel = false;
                        inputC.label = 'ChatGPT';
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
                const defaultValue = field.type === 'checkbox' ? false : '';
                field.value = defaultValue;
                this.formData[field.id] = defaultValue;
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

/* 移除分页器的边框 */
:deep(.el-pagination) {
    @apply border-none;
}
</style>
