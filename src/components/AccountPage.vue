<template>
    <el-container id="accountPanel" class="panel">
        <el-header>
            <h2>账号管理</h2>
        </el-header>
        <el-main>
            <!-- 搜索栏响应式布局 -->
            <el-row class="search-bar" :gutter="20">
                <el-col :xs="24" :sm="24" :md="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email" class="search-input">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="6" class="create-btn-wrapper">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                </el-col>
            </el-row>

            <!-- PC端表格视图 -->
            <div v-if="!isMobile" class="pc-view">
                <el-table :data="tableData" style="width: 100%" :fit="true" v-loading="loading" :cell-style="{padding: '12px 0'}">
                    <el-table-column prop="email" label="电子邮箱" min-width="180" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="name" label="账号名称" min-width="120" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="type" label="账号类型" min-width="140" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span>{{ scope.row.type }}</span>
                            <template v-if="scope.row.type === 'ChatGPT'">
                                <el-tag v-if="scope.row.planType === 'plus'" type="warning" effect="plain" size="mini" style="margin-left: 5px; color: #DAA520; border-color: #DAA520">Plus</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'free'" type="success" effect="plain" size="mini" style="margin-left: 5px; color: #67C23A; border-color: #67C23A">Free</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'team'" type="info" effect="plain" size="mini" style="margin-left: 5px; color: #87CEEB; border-color: #87CEEB">Team</el-tag>
                                <el-tag v-else-if="scope.row.planType === 'pro'" type="info" effect="plain" size="mini" style="margin-left: 5px; color: #000000; border-color: #FFD700">Pro</el-tag>
                                <el-tag v-else type="info" effect="plain" size="mini" style="margin-left: 5px; color: #808080; border-color: #808080">已失效</el-tag>
                            </template>
                        </template>
                    </el-table-column>
                    <el-table-column prop="shared" label="共享" width="80" align="center" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <i class="el-icon-circle-check" v-if="scope.row.shared === 1" style="color: green;"></i>
                            <i class="el-icon-circle-close" v-else style="color: red;"></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTime" label="更新时间" min-width="160" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i class="el-icon-time" style="color: #909399; font-size: 14px;"></i>
                                <span style="color: #606266; font-weight: 500;">{{ scope.row.updateTime }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="320" fixed="right">
                        <template slot-scope="scope">
                            <div class="operation-column">
                                <el-button type='info' size="mini" v-if="scope.row.accountType === 1"
                                    @click="refresh(scope.row.id)">刷新</el-button>
                                <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)">共享</el-button>
                                <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>
                                <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-else class="mobile-view">
                <div v-for="(item, index) in tableData" :key="index" class="mobile-card">
                    <div class="mobile-card-header">
                        <div class="email-badge">
                            <i class="el-icon-message"></i>
                            {{ item.email }}
                        </div>
                        <div class="status-badge" :class="{ 'status-shared': item.shared === 1 }">
                            {{ item.shared === 1 ? '已共享' : '未共享' }}
                        </div>
                    </div>

                    <div class="mobile-card-content">
                        <div class="info-row">
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="el-icon-user"></i>
                                    账号类型
                                </div>
                                <div class="info-value">{{ item.type }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="el-icon-time"></i>
                                    更新时间
                                </div>
                                <div class="info-value">{{ item.updateTime }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mobile-card-divider"></div>

                    <!-- 重新组织按钮布局 -->
                    <div class="mobile-card-actions">
                        <div class="action-row">
                            <el-button v-if="item.accountType === 1" type="info" size="mini" @click="refresh(item.id)">
                                <i class="el-icon-refresh"></i> 刷新
                            </el-button>
                            <el-button type="primary" size="mini" @click="showShareModal(item.id)">
                                <i class="el-icon-share"></i> 共享
                            </el-button>
                            <el-button type="warning" size="mini" @click="editItem(item.id)">
                                <i class="el-icon-edit"></i> 编辑
                            </el-button>
                        </div>
                        <div class="action-row">
                            <el-button type="danger" size="mini" @click="showConfirmDialog(item.id)">
                                <i class="el-icon-delete"></i> 删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页器 -->
            <div class="pagination-container">
                <el-pagination 
                    @current-change="handleCurrentChange" 
                    :current-page.sync="currentPage" 
                    :page-size="pageSize"
                    :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
                    :pager-count="isMobile ? 5 : 7"
                    :total="total"
                    class="pagination-wrapper">
                </el-pagination>
            </div>

            

            <!-- 弹窗组件保持不变 -->
            <enhanced-dialog v-if="modalVisible" :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
                <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                    @updateValue="handleUpdateValue" />
            </enhanced-dialog>

            <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                @confirm="handleDelete" />

            <!-- 图表组件 -->
            <div v-if="chartsVisible" class="chart-overlay">
                <div class="chart-container">
                    <div ref="chart" class="chart-content"></div>
                    <el-button @click="closeChart" type="primary" size="small">关闭</el-button>
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
                        text: 'GPT使用情况',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['GPT-4o', 'GPT-4', 'GPT-4o-mini', 'o1-preview', 'o1-mini'],
                        top: 'bottom'
                    },
                    xAxis: {
                        type: 'category',
                        data: this.chartData.map(item => item.uniqueName),
                        axisLabel: {
                            rotate: 45
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '使用次数'
                    },
                    series: [
                        {
                            name: 'GPT-4o',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt4o),
                            itemStyle: { color: '#91cc75' }
                        },
                        {
                            name: 'GPT-4',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt4),
                            itemStyle: { color: '#5470c6' }
                        },
                        {
                            name: 'GPT-4o-mini',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.gpt4omini),
                            itemStyle: { color: '#fac858' }
                        },
                        {
                            name: 'o1-preview',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.o1Preview),
                            itemStyle: { color: '#2980b9' }
                        },
                        {
                            name: 'o1-mini',
                            type: 'bar',
                            data: this.chartData.map(item => item.usage.o1Mini),
                            itemStyle: { color: '#f0ad5e' }
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
/* 基础布局 */
.panel {
    background-color: #ffffff;
    border-radius: 16px;
    /* padding: 10px; */
    margin: 1.5% 20px;
    min-height: calc(100vh - 40px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
}

/* 搜索栏 */
.search-bar {
    margin-bottom: 28px;
}

.search-input {
    width: 100%;
}

.create-btn-wrapper {
    display: flex;
    justify-content: flex-end;
}

/* 移动端卡片 */
.mobile-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(235, 238, 245, 0.6);
}

.mobile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

/* 卡片头部 */
.mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

/* 邮箱标签 */
.email-badge {
    background: linear-gradient(135deg, #ecf5ff 0%, #e6f1ff 100%);
    color: #409eff;
    padding: 10px 18px;
    border-radius: 28px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.email-badge i {
    font-size: 16px;
}

/* 状态标签 */
.status-badge {
    background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
    color: #606266;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
}

.status-shared {
    background: linear-gradient(135deg, #f0f9eb 0%, #e7f6e1 100%);
    color: #67c23a;
}

/* 卡片内容 */
.mobile-card-content {
    padding: 16px 0;
}

.info-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 24px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label {
    color: #909399;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.info-label i {
    font-size: 16px;
}

.info-value {
    color: #303133;
    font-size: 15px;
    font-weight: 600;
}

/* 分割线 */
.mobile-card-divider {
    height: 1px;
    background: linear-gradient(90deg, #ebeef5 0%, rgba(235, 238, 245, 0.4) 100%);
    margin: 24px 0;
}

/* 按钮组 */
.mobile-card-actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.action-row {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    width: 100%;
}

.action-row .el-button {
    flex: 1;
    height: 40px;
    font-weight: 600;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 主题色按钮 */
.el-button--primary {
    background: linear-gradient(135deg, #0e8f6f 0%, #0d8365 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(14, 143, 111, 0.2);
}

.el-button--primary:hover,
.el-button--primary:focus {
    background: linear-gradient(135deg, #2980b9 0%, #2472a8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(41, 128, 185, 0.25);
}

/* 分页器 */
.pagination-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px;
    backdrop-filter: blur(8px);
    border-radius: 8px;
    z-index: 1000;
}


.pagination-wrapper {
    text-align: center;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 16px;
        padding: 20px;
    }

    .create-btn-wrapper {
        justify-content: stretch;
        margin-top: 16px;
    }

    .create-new {
        width: 100%;
    }

    .mobile-card {
        padding: 20px;
        margin-bottom: 20px;
    }

    .info-row {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        padding: 6px 0;
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
        z-index: 1000;
        height: 44px;
    }

    :deep(.el-pagination) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        padding: 0 16px;
        height: 100%;
    }

    :deep(.el-pagination .btn-prev),
    :deep(.el-pagination .btn-next) {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 4px;
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
    }

    :deep(.el-pagination .number) {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        margin: 0 4px;
        border-radius: 16px;
        font-weight: 500;
    }

    .mobile-card:last-child {
        margin-bottom: 56px;
    }

    :deep(.el-pagination .active) {
        background: linear-gradient(145deg, #0e8f6f, #0d8668);
        color: white;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(14, 143, 111, 0.2);
    }

    .el-main {
        padding-bottom: calc(56px + env(safe-area-inset-bottom));
    }
}

/* 暗色主题优化 */
@media (prefers-color-scheme: dark) {
    /* 基础布局 */
    .panel {
        background: rgba(30, 30, 30, 0.95);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    h2 {
        color: #e0e0e0;
    }

    /* 搜索栏 */
    .el-input__inner {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: #e0e0e0;
    }

    .el-input__inner:hover {
        border-color: rgba(14, 143, 111, 0.5);
    }

    .el-input__inner:focus {
        border-color: #0e8f6f;
    }

    .el-input-group__append {
        background: rgba(14, 143, 111, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-left: none;
    }

    /* 表格样式 */
    .el-table {
        background-color: transparent;
    }

    .el-table th,
    .el-table tr {
        background-color: transparent;
        color: #e0e0e0;
    }

    .el-table td,
    .el-table th.is-leaf {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
        background-color: rgba(255, 255, 255, 0.05);
    }

    /* 移动端卡片样式 */
    .mobile-card {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .mobile-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 邮箱徽章 */
    .email-badge {
        background: linear-gradient(145deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
        color: #7eb6ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(64, 158, 255, 0.1);
    }

    /* 状态徽章 */
    .status-badge {
        background: rgba(255, 255, 255, 0.05);
        color: #909399;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .status-shared {
        background: linear-gradient(145deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
        color: #95d475;
        border: 1px solid rgba(103, 194, 58, 0.1);
    }

    /* 标签样式 */
    .el-tag {
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.05);
    }

    .el-tag--warning {
        background: rgba(230, 162, 60, 0.1);
        border-color: rgba(230, 162, 60, 0.2);
        color: #e6a23c;
    }

    .el-tag--success {
        background: rgba(103, 194, 58, 0.1);
        border-color: rgba(103, 194, 58, 0.2);
        color: #67c23a;
    }

    /* 信息文本 */
    .info-label {
        color: #909399;
    }

    .info-value {
        color: #e0e0e0;
    }

    /* 分割线 */
    .mobile-card-divider {
        background: linear-gradient(90deg, 
            transparent,
            rgba(255, 255, 255, 0.05) 20%,
            rgba(255, 255, 255, 0.05) 80%,
            transparent
        );
    }

    /* 按钮样式 */
    .el-button--primary {
        background: linear-gradient(145deg, #0e8f6f, #0d8668);
        border: none;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(14, 143, 111, 0.1);
    }

    .el-button--primary:hover {
        background: linear-gradient(145deg, #10a37f, #0f9973);
        box-shadow: 0 6px 16px rgba(14, 143, 111, 0.2);
    }

    .el-button--warning {
        background: linear-gradient(145deg, #946c00, #855f00);
        border: none;
        color: #ffffff;
    }

    .el-button--warning:hover {
        background: linear-gradient(145deg, #a37800, #946c00);
    }

    .el-button--danger {
        background: linear-gradient(145deg, #c53030, #b52b2b);
        border: none;
        color: #ffffff;
    }

    .el-button--danger:hover {
        background: linear-gradient(145deg, #d13b3b, #c53030);
    }

    /* 图表容器 */
    .chart-overlay {
        background: rgba(30, 30, 30, 0.95);
    }

    .chart-container {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    /* 移动端分页器 */
    @media screen and (max-width: 768px) {
        .pagination-container {
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(20px);
            box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination) {
            color: #909399;
        }

        :deep(.el-pagination .btn-prev),
        :deep(.el-pagination .btn-next) {
            background: transparent;
            color: #909399;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination .btn-prev:hover),
        :deep(.el-pagination .btn-next:hover) {
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
        }

        :deep(.el-pagination .number) {
            color: #909399;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        :deep(.el-pagination .number:hover) {
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
        }

        :deep(.el-pagination .active) {
            background: linear-gradient(145deg, #0e8f6f, #0d8668);
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(14, 143, 111, 0.3);
        }

        :deep(.el-pagination .active:hover) {
            background: linear-gradient(145deg, #10a37f, #0f9973);
        }
    }
}

.operation-column {
    display: flex;
    align-items: center;
    gap: 8px;
}

:deep(.el-table td.el-table__cell) {
    padding: 8px 0;
}

:deep(.el-table .cell) {
    padding: 0 12px;
    display: flex;
    align-items: center;
}
</style>
