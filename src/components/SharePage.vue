<template>
    <el-container id="sharePanel" class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-5 min-h-[calc(100vh-40px)] flex flex-col border dark:border-gray-800">
        <header class="px-4 py-3">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">分享管理</h2>
        </header>
        <el-main class="flex-1">
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
            <div v-if="!isMobile" class="hidden md:block">
                <el-table :data="tableData" style="width: 100%" :fit="true" 
                    v-loading="loading"
                    element-loading-text="加载中..."
                    element-loading-spinner="el-icon-loading"
                    class="adaptive-table">
                    <el-table-column prop="uniqueName" label="用户名" min-width="200">
                        <template slot-scope="scope">
                            <el-popover 
                                placement="right" 
                                :width="hasAccounts(scope.row) ? 320 : 220" 
                                trigger="hover">
                                <div class="space-y-3 text-sm p-1">
                                    <template v-if="hasAccounts(scope.row)">
                                        <div v-if="scope.row.gptExpiresAt" class="flex items-center justify-between">
                                            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-3">ChatGPT过期时间：</span>
                                            <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ scope.row.gptExpiresAt }}</span>
                                        </div>
                                        <div v-if="scope.row.claudeExpiresAt" class="flex items-center justify-between">
                                            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-3">Claude过期时间：</span>
                                            <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ scope.row.claudeExpiresAt }}</span>
                                        </div>
                                        <div v-if="scope.row.apiExpiresAt" class="flex items-center justify-between">
                                            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap mr-3">API过期时间：</span>
                                            <span class="text-gray-700 dark:text-gray-300 flex-1 text-right">{{ scope.row.apiExpiresAt }}</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="py-1 text-center text-gray-500 dark:text-gray-400">
                                            <i class="el-icon-info-circle mr-1"></i> 当前用户暂无账号
                                        </div>
                                    </template>
                                </div>
                                <div slot="reference" class="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                                    <span class="text-gray-700 dark:text-gray-300">{{ scope.row.uniqueName }}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="gptCarName" label="ChatGPT账号" min-width="220">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.gptCarName" :count="scope.row.gptUserCount || 0" type="gpt"
                                @click="openChat(scope.row.gptConfigId, 1)" 
                                :days="scope.row.gptExpiresAt ? calculateDays(scope.row.gptExpiresAt) : 0"
                                :loading="scope.row.loading"/>
                        </template>
                    </el-table-column>
                    <el-table-column prop="claudeCarName" label="Claude账号" min-width="220">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.claudeCarName" :count="scope.row.claudeUserCount || 0"
                                type="claude"
                                @click="openChat(scope.row.claudeConfigId, 2)" 
                                :days="scope.row.claudeExpiresAt ? calculateDays(scope.row.claudeExpiresAt) : 0"
                                :loading="scope.row.loading"/>
                        </template>
                    </el-table-column>
                    <el-table-column prop="apiCarName" label="API账号" min-width="220">
                        <template slot-scope="scope">
                            <split-button :name="scope.row.apiCarName" :count="scope.row.apiUserCount || 0" type="api"
                                @click="openChat(scope.row.apiConfigId, 3)" 
                                :days="scope.row.apiExpiresAt ? calculateDays(scope.row.apiExpiresAt) : 0"
                                :loading="scope.row.loading"/>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="280" fixed="right">
                        <template slot-scope="scope">
                            <div class="flex space-x-2">
                                <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">激活</el-button>
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)"
                                    class="hover:-translate-y-0.5 transition-transform duration-200">编辑</el-button>
                                <el-button type="danger" size="mini" @click="showConfirmDialog(scope.row.id)"
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
                            <i class="el-icon-user"></i>
                            <span class="truncate">{{ item.uniqueName }}</span>
                        </div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm">
                            {{ item.comment }}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div v-if="item.gptCarName" class="space-y-2">
                            <div class="text-gray-500 dark:text-gray-400 text-sm">ChatGPT账号</div>
                            <div class="w-full">
                                <split-button :name="item.gptCarName" :count="item.gptUserCount || 0" type="gpt"
                                    @click="openChat(item.gptConfigId, 1)" 
                                    :days="item.gptExpiresAt ? calculateDays(item.gptExpiresAt) : 0"
                                    :loading="item.loading"/>
                            </div>
                        </div>

                        <div v-if="item.gptCarName" class="space-y-2">
                            <div class="text-gray-500 dark:text-gray-400 text-sm">Grok账号</div>
                            <div class="w-full">
                                <split-button :name="item.gptCarName" :count="item.gptUserCount || 0" type="gpt"
                                    @click="openChat(item.gptConfigId, 1)" 
                                    :days="item.gptExpiresAt ? calculateDays(item.gptExpiresAt) : 0"
                                    :loading="item.loading"/>
                            </div>
                        </div>

                        <div v-if="item.claudeCarName" class="space-y-2">
                            <div class="text-gray-500 dark:text-gray-400 text-sm">Claude账号</div>
                            <div class="w-full">
                                <split-button :name="item.claudeCarName" :count="item.claudeUserCount || 0"
                                    type="claude"
                                    @click="openChat(item.claudeConfigId, 2)" 
                                    :days="item.claudeExpiresAt ? calculateDays(item.claudeExpiresAt) : 0"
                                    :loading="item.loading"/>
                            </div>
                        </div>

                        <div v-if="item.apiCarName" class="space-y-2">
                            <div class="text-gray-500 dark:text-gray-400 text-sm">API账号</div>
                            <div class="w-full">
                                <split-button :name="item.apiCarName" :count="item.apiUserCount || 0" type="api"
                                    @click="openChat(item.apiConfigId, 3)" 
                                    :days="item.apiExpiresAt ? calculateDays(item.apiExpiresAt) : 0"
                                    :loading="item.loading"/>
                            </div>
                        </div>
                    </div>

                    <div class="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

                    <div class="space-y-3">
                        <div class="flex space-x-2">
                            <el-button type="primary" size="mini" :loading="item.actionLoading"
                                @click="showShareModal(item.id)" class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-check mr-1"></i> 激活
                            </el-button>
                            <el-button type="warning" size="mini" :loading="item.actionLoading"
                                @click="editItem(item.id)" class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
                                <i class="el-icon-edit mr-1"></i> 编辑
                            </el-button>
                            <el-button type="danger" size="mini" :loading="item.actionLoading"
                                @click="showConfirmDialog(item.id)" class="flex-1 hover:-translate-y-0.5 transition-transform duration-200">
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
// import { Loading } from 'element-ui';

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
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }, { value: 3, text: 'API' }], required: true },
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
</style>
