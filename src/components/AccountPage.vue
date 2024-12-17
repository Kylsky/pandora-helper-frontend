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
            <div class="pc-view">
                <el-table :data="tableData" style="width: 100%" :fit="true">
                    <el-table-column prop="email" label="邮箱" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="type" label="账号类型" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="shared" label="共享" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span class="ellipsis">{{ scope.row.shared === 1 ? '✅' : '❌' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTime" label="更新时间"></el-table-column>
                    <el-table-column label="操作" width="350">
                        <template slot-scope="scope">
                            <el-button type='info' size="mini" v-if="scope.row.accountType === 1"
                                @click="refresh(scope.row.id)">刷新</el-button>
                            <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)">共享</el-button>
                            <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>
                            <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="mobile-view">
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
                <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                    :layout="isMobile ? 'prev, pager, next' : 'prev, pager, next, jumper'"
                    :pager-count="isMobile ? 5 : 7" :total="total" class="pagination-wrapper">
                </el-pagination>
            </div>


            <!-- 弹窗组件保持不变 -->
            <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal" @confirm="submitForm">
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
                { id: 'expiresAt', label: '过期时间', type: 'date', value: '', required: true },
            ]
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
                    this.$nextTick(() => {
                        this.initChart();
                    });
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

            if (fieldId === 'accountType') {
                const inputB = this.formFields.find(field => field.id === 'accessToken');
                // 根据选中的值动态更新 inputB 的 label
                switch (newValue) {
                    case 1:
                        inputB.label = 'ACCESS_TOKEN';
                        break;
                    case 2:
                        inputB.label = 'SESSION_KEY';
                        break;
                    case 3:
                        inputB.label = 'API_PROXY';
                        break;
                    default:
                        inputB.label = 'ChatGPT';
                }

                const inputC = this.formFields.find(field => field.id === 'refreshToken');
                inputC.hideLabel = false
                // 根据选中的值动态更新 inputB 的 label
                switch (newValue) {
                    case 1:
                        inputC.hideLabel = false;
                        inputC.label = 'REFRESH_TOKEN';
                        break;
                    case 2:
                        inputC.hideLabel = true;
                        break;
                    case 3:
                        inputC.hideLabel = false;
                        inputC.label = 'API_KEY';
                        break;
                    default:
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
            this.formFields = this.shareFields
            this.resetFormFields();
            this.modalVisible = true;
        },
        async editItem(index) {
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
        },
        closeModal() {
            this.currentIndex = null;
            this.modalVisible = false;
            this.shareAddFlag = false;
        },
        async submitForm() {
            console.log(this.formData);
            const itemData = { ...this.formData };

            if (this.shareAddFlag) {
                itemData.uniqueName = itemData.username
                itemData.accountId = this.currentIndex
                console.log(itemData)
                const response = await apiClient.post(`${config.apiBaseUrl}/share/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
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
                apiClient.patch(`${config.apiBaseUrl}/account/update`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
                message.success("修改成功")
            } else {
                itemData.auto = itemData.auto ? 1 : 0;
                itemData.shared = itemData.shared ? 1 : 0;
                itemData.accountType = itemData.accountType === '' ? 1 : itemData.accountType;
                apiClient.post(`${config.apiBaseUrl}/account/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    message.error(error)
                })
                message.success("新增成功")
            }
            this.fetchAccounts('')
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
            console.log(this.email);
            this.fetchAccounts(this.email)
        },
        handleEdit(id) {
            // 实现编辑逻辑
            console.log(id + 123123123)
        },
        handleAdd() {
            // 实现编辑逻辑
            console.log()
        },
        async handleDelete() {
            // 实现删除逻辑
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
        },
        handleCurrentChange(val) {
            // 处理页码变化
            console.log(val)
            this.fetchAccounts('')
        },
        async refresh(id) {
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
        }
    },
    mounted() {
        this.fetchAccounts('');
        this.checkIsMobile();
        window.addEventListener('resize', this.checkIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkIsMobile);
    }
}
</script>

<style scoped>
.panel {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 15px;
    margin: 1% 15px;
    height: 97%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 搜索栏样式 */
.search-bar {
    margin-bottom: 20px;
}

.search-input {
    width: 100%;
}

.create-btn-wrapper {
    display: flex;
    justify-content: flex-end;
}

.create-new {
    margin-top: 0;
}

/* PC端表格视图 */
.pc-view {
    display: none;
}

/* 移动端卡片视图 */
.mobile-view {
    display: none;
}

.mobile-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mobile-card-content {
    margin-bottom: 15px;
}

.mobile-card-item {
    display: flex;
    margin-bottom: 8px;
}

.mobile-card-item .label {
    font-weight: bold;
    min-width: 80px;
    color: #606266;
}

.mobile-card-item .value {
    flex: 1;
    word-break: break-all;
}

.mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

/* 图表样式 */
.chart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.chart-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
}

.chart-content {
    width: 100%;
    height: 400px;
}

/* Element UI 按钮样式 */
.el-button--primary {
    background-color: #0e8f6f;
    border-color: #0e8f6f;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background-color: #2980b9;
    border-color: #2980b9;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 10px;
        padding: 10px;
    }

    .create-btn-wrapper {
        justify-content: stretch;
        margin-top: 10px;
    }

    .create-new {
        width: 100%;
    }

    .pc-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }

    .chart-container {
        padding: 15px;
    }

    .chart-content {
        height: 300px;
    }
}

@media screen and (min-width: 769px) {
    .pc-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }
}

/* 更新移动端卡片样式 */
.mobile-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
}

.mobile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.email-badge {
    background: #f0f7ff;
    color: #409eff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.email-badge i {
    font-size: 16px;
}

.status-badge {
    background: #f5f7fa;
    color: #909399;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-shared {
    background: #f0f9eb;
    color: #67c23a;
}

.mobile-card-content {
    padding: 8px 0;
}

.info-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    color: #909399;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.info-label i {
    font-size: 14px;
}

.info-value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
}

.mobile-card-divider {
    height: 1px;
    background: #ebeef5;
    margin: 16px 0;
}

.mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

.action-button {
    display: flex;
    align-items: center;
    gap: 4px;
}

.action-button i {
    font-size: 14px;
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
    .mobile-card {
        padding: 12px;
    }

    .info-row {
        grid-template-columns: 1fr;
    }

    .mobile-card-actions {
        justify-content: stretch;
    }

    .action-button {
        flex: 1;
        justify-content: center;
    }
}

/* 确保按钮颜色符合主题 */
.el-button--primary {
    background-color: #0e8f6f;
    border-color: #0e8f6f;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background-color: #2980b9;
    border-color: #2980b9;
}

.mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
    /* 默认左对齐 */
}

/* 当容器宽度足够时，让按钮组两端对齐 */
@media screen and (min-width: 480px) {
    .mobile-card-actions {
        justify-content: space-between;
    }
}

.mobile-card-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-row {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    width: 100%;
}

.action-row .el-button {
    flex: 1;
}

/* 当只有一个按钮时的样式 */
.action-row:last-child {
    justify-content: stretch;
}

.action-row:last-child .el-button {
    width: 100%;
}

/* 确保按钮组的高度一致 */
.mobile-card-actions .el-button {
    height: 32px;
    padding: 0 12px;
}

/* 基础容器样式 */
.panel {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 15px;
    margin: 1% 15px;
    min-height: calc(100vh - 30px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

/* 主内容区域样式 */
.el-main {
    flex: 1;
    padding-bottom: 48px; 
    overflow-y: auto;     
}



/* 移动端分页器样式 */
@media screen and (max-width: 768px) {
    .pagination-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 4px 0;
        box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        height: 36px;
    }

    /* Element UI 分页器组件样式 */
    :deep(.el-pagination) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        padding: 0 12px;
        height: 100%;
    }

    :deep(.el-pagination .btn-prev),
    :deep(.el-pagination .btn-next) {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 2px;
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        border-radius: 14px;
    }

    :deep(.el-pagination .number) {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        margin: 0 2px;
        border-radius: 14px;
    }

    /* 移动端卡片布局调整 */
    .mobile-card:last-child {
        margin-bottom: 48px; /* 确保最后一张卡片不被分页器遮挡 */
    }


    /* 当前页码突出显示 */
    :deep(.el-pagination .active) {
        background-color: #0e8f6f;
        color: white;
        border-radius: 4px;
    }

    /* 调整内容区域的下边距 */
    .el-main {
        padding-bottom: calc(48px + env(safe-area-inset-bottom)); /* 适配全面屏 */
    }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
    @media screen and (max-width: 768px) {
        .pagination-container {
            background: rgba(30, 30, 30, 0.95);
            box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.15);
        }

        :deep(.el-pagination) {
            color: #e0e0e0;
        }
    }
}


/* 分页器样式 */
.pagination-container {
    margin-top: 20px;
    padding: 8px 0;  /* 减小上下内边距 */
}

.pagination-wrapper {
    text-align: center;
}
</style>