<template>
    <el-container id="accountPanel" class="panel">
        <el-header>
            <h2>账号管理</h2>
        </el-header>
        <el-main>
            <el-row class="search-bar">
                <el-col :span="18">
                    <el-input id="email-query" placeholder="请输入邮箱" v-model="email">
                        <el-button slot="append" @click="emailQuery">查询</el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button class="create-new" type="primary" @click="showModal()">新增</el-button>
                    <enhanced-dialog :isVisible="modalVisible" :title="modalTitle" @close="closeModal"
                        @confirm="submitForm">
                        <form-input v-for="(field, index) in formFields" :key="index" :field="field"
                            @updateValue="handleUpdateValue" />
                    </enhanced-dialog>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="email" label="邮箱" width="220"></el-table-column>
                <el-table-column prop="type" label="账号类型" width="120"></el-table-column>
                <el-table-column prop="accessToken" label="Access Token" width="200">
                    <template slot-scope="scope">
                        <span class="ellipsis">{{ scope.row.accessToken }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="shared" label="共享" width="80">
                    <template slot-scope="scope">
                        <span class="ellipsis">{{ scope.row.shared === 1 ? '✅' : '❌' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间"></el-table-column>

                <el-table-column label="操作" width="400">
                    <template slot-scope="scope">
                        <el-button size="mini" v-if="scope.row.accountType === 1"
                            @click="statistic(scope.row.id)" style="background-color: #6fafd2;color: white;">统计</el-button>
                        <el-button type='info' size="mini" v-if="scope.row.accountType === 1"
                            @click="refresh(scope.row.id)">刷新</el-button>
                        <el-button type="primary" size="mini" @click="showShareModal(scope.row.id)">共享</el-button>
                        <enhanced-dialog :visible.sync="modalVisible" title="新增共享" message="" @confirm="submitForm()" />

                        <el-button type="warning" size="mini" @click="editItem(scope.row.id)">编辑</el-button>

                        <el-button size="mini" type="danger" @click="showConfirmDialog(scope.row.id)">删除</el-button>
                        <confirm-dialog :visible.sync="isDialogVisible" title="确认删除" message="你确定要删除这个账号吗？"
                            @confirm="handleDelete()" />

                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="10"
                layout="prev, pager, next, jumper" :total=total>
            </el-pagination>
            <div v-if="chartsVisible" class="mychart">
                <div class="chart-container">
                    <div ref="chart" style="width: 600px; height: 400px;"></div>
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

export default {
    name: 'AccountPage',
    components: {
        ConfirmDialog,
        EnhancedDialog,
        FormInput
    },
    data() {
        return {
            email: '',
            tableData: [], // 这里应该填充实际的表格数据
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
                { id: 'accountType', label: '账号类型', type: 'select', value: 'ChatGPT', options: [{ value: 1, text: 'ChatGPT' }, { value: 2, text: 'Claude' }], required: true },
                { id: 'userLimit', label: '分享人数上限', type: 'text', value: '', required: true },
                { id: 'accessToken', label: 'ACCESS_TOKEN', type: 'text', value: '', required: true },
                { id: 'refreshToken', label: 'REFRESH_TOKEN', type: 'text', value: '', required: false },
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
                    data: ['GPT-4o', 'GPT-4', 'GPT-4o-mini'],
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
                if (response.data.status) {
                    this.tableData = response.data.data.data
                    this.total = response.data.data.total
                }
            } catch (error) {
                alert(error)
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
            this.formFields.forEach(field => {
                field.value = acc[field.id];
                this.formData[field.id] = acc[field.id];
            });
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
                apiClient.post(`${config.apiBaseUrl}/share/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    alert(error)
                })
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
                    alert(error)
                })
            } else {
                itemData.auto = itemData.auto ? 1 : 0;
                itemData.shared = itemData.shared ? 1 : 0;
                itemData.accountType = itemData.accountType === '' ? 1 : itemData.accountType;
                apiClient.post(`${config.apiBaseUrl}/account/add`, itemData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                }).catch(function (error) {
                    alert(error)
                })
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
                alert('删除成功');
            } else {
                alert('删除失败，请稍后重试');
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
            const response = await apiClient.post(`${config.apiBaseUrl}/account/refresh?id=` + id,{}, {
                withCredentials: true,
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                }
            });
            if (response.data.status) {
                alert('刷新成功');
            } else {
                alert('刷新失败，请稍后重试');
            }
        }
    },
    mounted() {
        // 组件挂载后的逻辑
        this.fetchAccounts('');
    }
}
</script>

<style scoped>
/* 保留原有的自定义样式 */
.panel {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 15px;
    margin: 1% 15px;
    height: 97%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-bar {
    margin-bottom: 20px;
}

.create-new {
    float: right;
}

.ellipsis,
.share-ellipsis {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.share-ellipsis {
    max-width: 150px;
}

/* 覆盖一些 Element UI 的默认样式以匹配原设计 */
.el-button--primary {
    /* background-color: #43cea2; */
    background-color: #0e8f6f;
    /* border-color: #43cea2; */
    border-color: #0e8f6f;
}

.el-button--primary:hover,
.el-button--primary:focus {
    background-color: #2980b9;
    border-color: #2980b9;
}

.el-table th {
    background-color: #f2f2f2;
}

.el-pagination {
    /* text-align: right; */
    position: absolute;
    bottom: 5%;
    right: 3%;
}
.mychart {
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
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-container .el-button {
    margin-top: 15px;
}
</style>