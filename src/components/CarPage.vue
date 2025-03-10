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
            <div v-show="!isMobile" class="hidden md:block relative h-full min-h-[300px]">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="bounce"/>
                <!-- 表头 -->
                <div class="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                    <div class="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 font-medium text-sm text-gray-500 dark:text-gray-300">
                        <div class="col-span-3 py-2.5 px-3">账号</div>
                        <div class="col-span-2 py-2.5 px-3">账号类型</div>
                        <div class="col-span-2 py-2.5 px-3 text-center">自动上车</div>
                        <div class="col-span-2 py-2.5 px-3">车主</div>
                        <div class="col-span-1 py-2.5 px-3 text-center">上车情况</div>
                        <div class="col-span-2 py-2.5 px-3">操作</div>
                    </div>
                    
                    <!-- 表格内容 -->
                    <div class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        <div v-for="(item, index) in tableData" :key="index" 
                            class="grid grid-cols-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                            
                            <!-- 账号 -->
                            <div class="col-span-3 py-2.5 px-3">
                                <div class="group relative">
                                    <div class="flex items-center space-x-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded px-2 py-1 cursor-pointer">
                                        <i class="el-icon-message text-gray-400"></i>
                                        <span class="text-gray-700 dark:text-gray-300 truncate">{{ item.email }}</span>
                                    </div>
                                    
                                    <!-- 悬停信息卡片 -->
                                    <div class="absolute left-0 top-full mt-1 z-10 w-60 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div class="space-y-2 text-xs">
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500 dark:text-gray-400">账号类型：</span>
                                                <span class="text-gray-700 dark:text-gray-300">{{ item.type }}</span>
                                            </div>
                                            <div v-if="item.type === 'ChatGPT'" class="flex items-center justify-between">
                                                <span class="text-gray-500 dark:text-gray-400">计划类型：</span>
                                                <span class="text-gray-700 dark:text-gray-300">{{ item.planType }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 账号类型 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-gray-700 dark:text-gray-300">{{ item.type }}</span>
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
                                            无效
                                        </span>
                                    </template>
                                </div>
                            </div>
                            
                            <!-- 自动上车 -->
                            <div class="col-span-2 py-2.5 px-3 text-center">
                                <span :class="[
                                    'px-2.5 py-1 rounded-full text-xs font-medium',
                                    item.auto === 1 
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                                ]">
                                    {{ item.auto === 1 ? 'yes!' : 'No' }}
                                </span>
                            </div>
                            
                            <!-- 车主 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="flex items-center space-x-1.5">
                                    <i class="el-icon-user text-gray-400"></i>
                                    <span class="text-gray-700 dark:text-gray-300">{{ item.usernameDesc }}</span>
                                </div>
                            </div>
                            
                            <!-- 上车情况 -->
                            <div class="col-span-1 py-2.5 px-3 text-center">
                                <div class="flex items-center justify-center space-x-1">
                                    <span class="text-green-500 font-semibold">{{ item.countDesc.split('/')[0] }}</span>
                                    <span class="text-gray-400">/</span>
                                    <span class="text-blue-500 font-semibold">{{ item.countDesc.split('/')[1] }}</span>
                                </div>
                            </div>
                            
                            <!-- 操作 -->
                            <div class="col-span-2 py-2.5 px-3">
                                <div class="flex flex-wrap gap-1.5">
                                    <button v-if="item.authorized === true"
                                        @click="showModal(item.id)" 
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
                                        审核
                                    </button>
                                    <button @click="contact(item.username)" 
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200">
                                        联系车主
                                    </button>
                                    <button @click="applyCar(item.id)"
                                        class="px-2.5 py-0.5 rounded-md text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200">
                                        我要上车
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 无数据状态 -->
                        <div v-if="tableData.length === 0 && !loading" class="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                            <p class="text-lg">暂无车辆数据</p>
                            <p class="text-sm mt-2">请添加新车辆或修改搜索条件</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 移动端卡片视图 -->
            <div v-show="isMobile" class="space-y-3 md:hidden relative h-full min-h-[300px]">
                <LoadingSpinner :loading="loading" loadingText="加载中..." type="bounce"/>
                <div v-for="(item, index) in tableData" :key="index" 
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md border border-gray-100 dark:border-gray-700">
                    
                    <!-- 卡片顶部 -->
                    <div class="flex justify-between items-center mb-2.5">
                        <div class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs flex items-center space-x-1.5 max-w-[70%] overflow-hidden">
                            <i class="el-icon-message"></i>
                            <span class="truncate">{{ item.email }}</span>
                        </div>
                        <div class="flex items-center space-x-1.5">
                            <div class="text-xs font-medium" 
                                :class="{
                                    'text-green-600 dark:text-green-400': item.type === 'ChatGPT',
                                    'text-yellow-600 dark:text-yellow-400': item.type === 'Claude',
                                    'text-blue-600 dark:text-blue-400': item.type === 'API'
                                }">
                                {{ item.type }}
                            </div>
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
                            </template>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <!-- 自动上车 -->
                        <div class="space-y-1">
                            <div class="text-gray-500 dark:text-gray-400 text-xs flex items-center space-x-1.5">
                                <i class="el-icon-setting"></i>
                                <span>自动上车</span>
                            </div>
                            <div>
                                <span :class="[
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    item.auto === 1 
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                                ]">
                                    {{ item.auto === 1 ? 'yes!' : 'No' }}
                                </span>
                            </div>
                        </div>
                        
                        <!-- 车主 -->
                        <div class="space-y-1">
                            <div class="text-gray-500 dark:text-gray-400 text-xs flex items-center space-x-1.5">
                                <i class="el-icon-user"></i>
                                <span>车主</span>
                            </div>
                            <div class="text-gray-900 dark:text-gray-100 font-medium text-sm truncate">
                                {{ item.usernameDesc }}
                            </div>
                        </div>
                        
                        <!-- 上车情况 -->
                        <div class="space-y-1">
                            <div class="text-gray-500 dark:text-gray-400 text-xs flex items-center space-x-1.5">
                                <i class="el-icon-user-solid"></i>
                                <span>上车情况</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="flex items-center space-x-1">
                                    <span class="text-green-500 text-sm font-medium">{{ item.countDesc.split('/')[0] }}</span>
                                    <span class="text-gray-400 text-xs">/</span>
                                    <span class="text-blue-500 text-sm font-medium">{{ item.countDesc.split('/')[1] }}</span>
                                </div>
                                <span class="text-gray-400 text-xs">人</span>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="grid grid-cols-3 gap-1.5">
                        <button v-if="item.authorized === true"
                            @click="showModal(item.id)" 
                            class="w-full py-1.5 rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1">
                            <i class="el-icon-check"></i>
                            <span>审核</span>
                        </button>
                        <button @click="contact(item.username)" 
                            class="w-full py-1.5 rounded-md text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1">
                            <i class="el-icon-chat-dot-square"></i>
                            <span>联系</span>
                        </button>
                        <button @click="applyCar(item.id)"
                            class="w-full py-1.5 rounded-md text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1">
                            <i class="el-icon-position"></i>
                            <span>上车</span>
                        </button>
                    </div>
                </div>
                
                <!-- 移动端无数据状态 -->
                <div v-if="tableData.length === 0 && !loading" class="py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg class="w-14 h-14 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <p class="text-base">暂无车辆数据</p>
                    <p class="text-xs mt-1.5">请添加新车辆或修改搜索条件</p>
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
import LoadingSpinner from './LoadingSpinner.vue'

export default {
    name: 'SharePage',
    components: {
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
/* 添加圆润字体样式 */
#carPanel,
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
#carPanel h2 {
    font-weight: 600;
}

.el-button,
button {
    font-weight: 500;
}

/* 车主名称字体大小调整 */
.grid-cols-12 .col-span-4:first-child,
.grid-cols-12 .col-span-4:first-child .text-gray-700,
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

/* 车主名称标识 */
.col-span-2 .text-gray-700.dark\:text-gray-300,
.el-icon-user.text-gray-400 + .text-gray-700.dark\:text-gray-300 {
    font-size: 0.875rem; /* 14px */
    font-weight: 600;
}

/* 上车情况字体调整 */
.col-span-1 .text-green-500.font-semibold,
.col-span-1 .text-blue-500.font-semibold {
    font-size: 0.825rem; /* 13.2px */
}

/* 移动端卡片内容字体调整 */
.text-gray-900.dark\:text-gray-100.font-medium.text-sm.truncate {
    font-size: 0.8125rem; /* 13px */
    font-weight: 500;
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
