import axios from 'axios';
import config from '@/configs/config';
import message from '@/configs/message'
export default {
    data() {
        return {
            // 基本状态
            loading: false,
            queueStatus: 'idle', // 'idle', 'active', 'error'
            isPanelCollapsed: false,
            isMobile: false,

            // 图片查看状态
            showViewer: false,
            previewUrl: '',

            // 图片编辑状态
            showImageEditor: false,
            currentTask: {},

            // 设置抽屉状态
            showAdvancedSettings: false,

            // 表单数据
            formData: {
                prompt: '',
                negativePrompt: '',
                referenceImage: null,
                version: '--v 6.1',
                imageWeight: '',
                perspective: '',
                shot: '',
                lighting: '',
                seed: '',
                quality: '',
                stylize: 100,
                aspectRatio: '',
            },

            // 用户数据
            user: {
                name: '',
                email: '',
                credit: 0,
                usedCredit: 0
            },

            // 任务数据
            taskQueue: [],
            recentImages: [],

            // 分页数据
            pagination: {
                current: 1,
                pageSize: 6,
                total: 0
            },

            // 加载状态
            queueLoading: false,

            // 定时器
            queueTimer: null,
            queueInterval: 5000 // 5秒轮询一次
        };
    },
    mounted() {
        this.checkMobileDevice();
        window.addEventListener('resize', this.checkMobileDevice);
        
        // 从localStorage读取收缩状态
        const savedCollapsedState = localStorage.getItem('drawPanelCollapsed');
        if (savedCollapsedState !== null) {
            this.isPanelCollapsed = savedCollapsedState === 'true';
        }
        
        // 获取用户信息
        this.fetchUserInfo();

        // 加载任务列表
        this.fetchTaskQueue();

        // 启动任务队列自动刷新
        this.startQueueTimer();
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobileDevice);

        // 停止任务队列自动刷新
        this.stopQueueTimer();
    },
    methods: {
        // ===== 基础功能 =====
        checkMobileDevice() {
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile) {
                this.isPanelCollapsed = false;
            }
        },

        togglePanel() {
            this.isPanelCollapsed = !this.isPanelCollapsed;
            // 保存状态到localStorage
            localStorage.setItem('drawPanelCollapsed', this.isPanelCollapsed.toString());
        },

        // ===== 图片预览功能 =====
        handlePreviewImage(imageUrl) {
            this.previewUrl = imageUrl;
            this.showViewer = true;
        },

        closeViewer() {
            this.showViewer = false;
        },

        // ===== 图片编辑功能 =====
        handleEditImage(task) {
            this.currentTask = task;
            this.showImageEditor = true;
        },

        handleEditorClose() {
            this.showImageEditor = false;
        },

        async handleEditorConfirm(editorData) {
            try {
                // 显示加载状态
                this.loading = true;

                console.log('提交局部重绘请求:', {
                    taskId: this.currentTask.modalTaskId,
                    prompt: editorData.prompt,
                    maskBase64: editorData.maskBase64.substring(0, 50) + '...' // 日志中只显示前50个字符
                });

                // 提交 modal 请求
                const modalResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/modal`, {
                    taskId: this.currentTask.modalTaskId,
                    prompt: editorData.prompt,
                    maskBase64: editorData.maskBase64
                }, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                if (modalResponse.data && modalResponse.data.status === true && modalResponse.data.data && modalResponse.data.data.code === 1) {
                    this.$message.success('局部重绘操作已提交');
                    
                    // 将页面重置为第一页
                    this.pagination.current = 1;
                    this.loading = false;
                    await this.fetchTaskQueue();
                    
                    // 启动轮询刷新任务状态
                    if (this.$refs.taskQueue) {
                        this.$refs.taskQueue.refreshAllTasks();
                    }
                    
                    // 通知编辑器关闭并重置
                    if (editorData.callback && typeof editorData.callback === 'function') {
                        editorData.callback(true);
                    }
                    this.showImageEditor = false;
                } else {
                    const errorMsg = modalResponse.data?.data?.description || modalResponse.data?.msg || '提交失败';
                    console.error('局部重绘提交失败:', modalResponse.data);
                    this.$message.error(errorMsg);
                    
                    // 通知编辑器提交失败
                    if (editorData.callback && typeof editorData.callback === 'function') {
                        editorData.callback(false);
                    }
                }
            } catch (error) {
                console.error('局部重绘提交错误:', error);
                this.$message.error('操作失败: ' + (error.response?.data?.error || error.message));
                
                // 通知编辑器提交失败
                if (editorData.callback && typeof editorData.callback === 'function') {
                    editorData.callback(false);
                }
            } finally {
                this.loading = false;
            }
        },

        // ===== 设置功能 =====
        handleSettingsApply(settings) {
            this.formData = {
                ...this.formData,
                ...settings
            };
            this.$message.success('设置已应用');
        },

        // ===== 图片操作功能 =====
        handleDownloadImage(task) {
            if (!task.imageUrl) return;

            // 在新窗口打开图片
            window.open(task.imageUrl, '_blank');
        },

        async handleCopyImage(task) {
            if (!task.prompt) return;

            try {
                await navigator.clipboard.writeText(task.prompt);
                this.$message.success('提示词已复制到剪贴板');
            } catch (err) {
                console.error('复制失败:', err);
                this.$message.error('复制失败，请手动复制');
            }
        },

        async handleDeleteTask(task, confirmed = false) {
            try {
                // 如果已经确认过，直接删除无需再次确认
                if (confirmed) {
                    const index = this.taskQueue.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        this.taskQueue.splice(index, 1);
                    }
                    
                    // 如果已经通过API删除，无需再次提示
                    return;
                }
                
                this.$confirm('确定要删除这个任务吗？', '删除确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const index = this.taskQueue.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        this.taskQueue.splice(index, 1);
                    }

                    // 如果有API去删除任务，可以在这里调用
                    this.$message.success('任务已删除');
                }).catch(() => {
                    // 取消删除
                });
            } catch (error) {
                console.error('删除任务失败:', error);
                this.$message.error('删除失败');
            }
        },

        // ===== 表单提交功能 =====
        async handleFormSubmit(formData) {
            try {
                this.loading = true;

                // 构建提交数据
                const submitData = {
                    prompt: formData.prompt,
                    negative_prompt: formData.negativePrompt || '',
                };

                // 添加版本和其他参数
                const params = [];

                // 添加版本
                if (formData.version) params.push(formData.version);

                // 添加其他参数
                ['aspectRatio', 'quality', 'imageWeight'].forEach(key => {
                    if (formData[key]) params.push(formData[key]);
                });

                // 添加风格强度
                if (formData.stylize !== 100) {
                    params.push(`--s ${formData.stylize}`);
                }

                // 添加随机种子
                if (formData.seed) {
                    params.push(`--seed ${formData.seed}`);
                }

                // 添加视角、镜头、灯光等高级参数到提示词
                const advancedParams = ['perspective', 'shot', 'lighting'];
                let advancedPrompt = '';

                advancedParams.forEach(param => {
                    if (formData[param]) {
                        advancedPrompt += `${formData[param]}, `;
                    }
                });

                // 合并高级参数到提示词
                if (advancedPrompt) {
                    submitData.prompt = `${advancedPrompt}${submitData.prompt}`;
                }

                // 将所有参数连接起来
                const paramsString = params.join(' ');
                submitData.prompt = `${submitData.prompt} ${paramsString}`.trim();

                console.log('提交的绘图请求:', submitData);

                // 处理图片上传
                let referenceImageBase64 = null;
                
                if (formData.imageList && formData.imageList.length > 0) {
                    // 使用第一张图片作为参考图片
                    referenceImageBase64 = formData.imageList[0].url;
                    if (referenceImageBase64.startsWith('data:image')) {
                        referenceImageBase64 = referenceImageBase64.split(',')[1];
                    }
                } else if (formData.referenceImage) {
                    // 兼容旧版本
                    referenceImageBase64 = formData.referenceImage;
                    if (referenceImageBase64.startsWith('data:image')) {
                        referenceImageBase64 = referenceImageBase64.split(',')[1];
                    }
                }

                // 根据选择的模型选择不同的API
                let apiEndpoint = `${config.apiBaseUrl}/mj/submit/imagine`;
                let requestData = {
                    prompt: submitData.prompt,
                    base64: referenceImageBase64 || null,
                };

                // 处理不同的AI引擎
                switch (formData.modelId) {
                    case 'mj':
                        // 默认MJ API
                        break;
                    case 'niji':
                        // Niji参数
                        requestData.prompt = `${requestData.prompt} --niji 5`;
                        break;
                    case 'dall-e-3':
                    case 'flux':
                    case 'sd3':
                    case 'sdxl':
                    case 'sd-core':
                    case 'sd-ultra':
                        // 使用不同的API接口
                        apiEndpoint = `${config.apiBaseUrl}/sd/generate`;
                        requestData = {
                            prompt: submitData.prompt,
                            negative_prompt: submitData.negative_prompt,
                            model: formData.modelId,
                            base64: referenceImageBase64 || null,
                        };
                        break;
                }

                const response = await axios.post(apiEndpoint, requestData, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                // 处理响应
                if (response.data && response.data.status === true) {
                    this.$message.success('任务已提交，请在列表中查看进度');
                    
                    // 重置表单
                    if (this.$refs.form) {
                        this.$refs.form.resetFields();
                    }
                    
                    // 刷新任务列表
                    this.pagination.current = 1; // 重置为第一页
                    this.loading = false;
                    await this.fetchTaskQueue();
                    
                    // 启动轮询任务状态
                    if (this.$refs.taskQueue) {
                        this.$refs.taskQueue.refreshAllTasks();
                    }
                } else {
                    const errorMsg = response.data.data?.description || response.data.error || '提交失败，请重试';
                    this.$message.error(errorMsg);
                }
            } catch (error) {
                console.error('绘图请求错误:', error);
                this.$message.error('提交失败: ' + (error.response?.data?.error || error.message));
            } finally {
                this.loading = false;
            }
        },

        // ===== 数据获取功能 =====
        async fetchUserInfo() {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/user/info`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                if (response.data && response.data.code === 1) {
                    this.user = response.data.result || {};
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            }
        },

        async fetchTaskQueue() {
            if (this.loading) return;

            this.loading = true;
            this.queueStatus = 'active'; // 设置为active以触发isLoading
            try {
                const response = await axios.get(`${config.apiBaseUrl}/mj/tasks?` + "page=" + this.pagination.current + "&size=" + this.pagination.pageSize, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                if (response.status === 200 && response.data.data.list) {
                    // 直接使用新的API返回格式
                    this.taskQueue = response.data.data.list;
                    // 遍历任务队列，处理空状态
                    this.taskQueue = this.taskQueue.map(task => {
                        // 如果状态为空，设置为 NOT_START
                        if (!task.status || task.status === '') {
                            task.status = 'NOT_START';
                        }
                        // 同时处理 displays 中的状态
                        if (task.displays && (!task.displays.status || task.displays.status === '')) {
                            task.displays.status = 'NOT_START';
                        }
                        return task;
                    });
                    // 更新分页信息
                    this.pagination.total = response.data.data.pagination.total;
                } else {
                    console.error('任务列表数据格式不正确:', response.data.data);
                    message.error('获取任务队列失败');
                }
            } catch (error) {
                console.error('获取任务队列失败:', error);
                message.error('获取任务队列失败');
            } finally {
                this.loading = false;
                this.queueStatus = 'idle'; // 恢复为idle状态
            }
        },

        // ===== 任务轮询功能 =====
        startQueueTimer() {
            // 先清除现有定时器
            this.stopQueueTimer();

            // 设置新定时器，每15秒自动刷新所有任务状态
            this.queueTimer = setInterval(() => {
                // 如果有任务处于进行中状态，则刷新所有任务的状态
                const hasInProgressTasks = this.taskQueue.some(task => {
                    const status = task.displays?.status || task.status;
                    return ['SUBMITTED', 'IN_PROGRESS', 'PENDING', 'NOT_START','MODAL',''].includes(status);
                });

                if (hasInProgressTasks) {
                    console.log('检测到进行中的任务，更新任务状态');

                    // 只通过子组件的方法刷新各个任务状态，而不获取整个任务列表
                    this.refreshAllTaskStatus();
                }
            }, 3000); // 15秒检查一次

            console.log('已启动全局任务状态自动刷新');
        },

        // 刷新所有任务状态
        refreshAllTaskStatus() {
            // 使用 $refs 代替 $children 查找组件
            const taskQueueComponent = this.$refs.taskQueue;
            console.log('taskQueueComponent', taskQueueComponent);
            if (taskQueueComponent && typeof taskQueueComponent.refreshAllTasks === 'function') {
                taskQueueComponent.refreshAllTasks();
            }
        },

        // 刷新单个任务状态
        refreshTaskStatus(taskId) {
            if (!taskId) return;

            // 使用 $refs 代替 $children 查找组件
            const taskQueueComponent = this.$refs.taskQueue;
            if (taskQueueComponent && typeof taskQueueComponent.refreshTask === 'function') {
                taskQueueComponent.refreshTask(taskId);
            }
        },

        stopQueueTimer() {
            if (this.queueTimer) {
                clearInterval(this.queueTimer);
                this.queueTimer = null;
            }
        },

        // ===== 分页功能 =====
        handlePageChange(current) {
            this.pagination.current = current;
            this.fetchTaskQueue();
        },

        // ===== 处理局部重绘(Vary Region)操作 =====
        async handleVaryRegion(task, btn) {
            try {
                if (!btn || !btn.customId) {
                    this.$message.error('无效的操作');
                    return;
                }

                const customId = btn.customId;
                console.log('处理局部重绘操作:', customId);
                
                try {
                    // 显示加载状态
                    this.loading = true;
                    
                    // 提交操作请求
                    const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                        taskId: task.id,
                        customId: customId,
                        index: 1,
                        chooseSameChannel: true,
                        state: 'midjourney-proxy-admin'
                    }, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                        // 设置当前任务并存储modalTaskId用于后续提交
                        this.currentTask = { 
                            ...task,
                            modalTaskId: actionResponse.data.data.result
                        };
                        
                        // 打开图像编辑器
                        this.showImageEditor = true;
                        
                        // 这里不调用initEditor方法，让ImageEditor组件通过watch visible属性自行初始化
                        console.log('已打开局部重绘编辑器，任务ID:', task.id, '图片URL:', task.imageUrl);
                    } else {
                        this.$message.error(actionResponse.data.data?.description || '局部重绘操作失败');
                    }
                } catch (error) {
                    console.error('局部重绘操作错误:', error);
                    this.$message.error('局部重绘操作失败，请重试');
                } finally {
                    this.loading = false;
                }
            } catch (error) {
                console.error('处理局部重绘失败:', error);
                this.$message.error('操作失败: ' + (error.response?.data?.error || error.message));
                this.loading = false;
            }
        },

        // ===== MJ操作功能 =====
        async handleMjAction(task, btn) {
            try {
                if (!btn || !btn.customId) {
                    this.$message.error('无效的操作');
                    return;
                }

                const customId = btn.customId;

                // 处理不同类型的操作
                if (customId.includes('Inpaint')) {
                    // Inpaint 操作 - 需要图像编辑器
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                            this.currentTask = task;
                            this.editPrompt = '';  // 设置为空字符串
                            this.showImageEditor = true;
                            this.currentTask.modalTaskId = actionResponse.data.data.result;

                            // 等待对话框打开后初始化画布
                            this.$nextTick(() => {
                                console.log('Initializing canvas with image:', task.imageUrl);
                                this.initializeCanvas(task.imageUrl);
                            });
                        } else {
                            // 始终跳转到第一页并刷新任务列表 - 无论操作类型
                            this.$message.error(actionResponse.data.data?.description || '操作失败');
                        }
                    } catch (error) {
                        console.error('Inpaint action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理直接执行的简单操作 (upsample, reroll, BOOKMARK, Outpaint)
                else if (customId.includes('upsample') ||
                    customId.includes('BOOKMARK') ||
                    customId.includes('Outpaint')) {
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && (actionResponse.data.data.code === 1)) {
                            this.$message.success('操作成功');
                            this.pagination.current = 1;
                            this.loading = false;
                            await this.fetchTaskQueue();
                            // 始终跳转到第一页并刷新任务列表 - 无论操作类型
                            
                            // 启动轮询 (除了BOOKMARK操作)
                            //   if (!customId.includes('BOOKMARK')) {
                            //     this.startQueueTimer();
                            //   }
                        } else {
                            this.$message.error(actionResponse.data.data?.description || '操作失败');
                        }
                    } catch (error) {
                        console.error('Action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理变体操作 (variation)
                else if (customId.includes('variation')) {
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            this.$prompt(`请输入Variation提示词`, '设置', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                inputPlaceholder: '请输入提示词',
                                inputValue: actionResponse.data.data.properties?.finalPrompt || task.prompt,
                                inputValidator: (value) => {
                                    if (!value || value.trim() === '') {
                                        return '提示词不能为空';
                                    }
                                    return true;
                                }
                            }).then(async ({ value: newPrompt }) => {
                                try {
                                    const modalResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'Authorization': "Bearer " + localStorage.getItem('token')
                                        }
                                    });

                                    if (modalResponse.data.status && modalResponse.data.data.code === 1) {
                                        this.$message.success('变体操作已提交');
                                        this.pagination.current = 1;
                                        this.loading = false;
                                        await this.fetchTaskQueue();
                                        // this.startQueueTimer();
                                    } else {
                                        this.$message.error(modalResponse.data.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    console.error('Modal submit error:', error);
                                    this.$message.error('提交失败，请重试');
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data.status && actionResponse.data.data.code === 1) {
                            // 如果直接返回成功
                            this.$message.success('变体操作已提交');
                            // 始终跳转到第一页并刷新任务列表 - 无论操作类型
                            this.pagination.current = 1;
                            this.loading = false;
                            await this.fetchTaskQueue();
                            //   this.startQueueTimer();
                        } else {
                            this.$message.error(actionResponse.data.data?.description || '提交失败');
                        }
                    } catch (error) {
                        console.error('Variation action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理 reroll 操作
                else if (customId.includes('reroll')) {
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            this.$prompt(`请输入重绘提示词`, '设置', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                inputPlaceholder: '请输入提示词',
                                inputValue: actionResponse.data.data.properties?.finalPrompt || task.prompt,
                                inputValidator: (value) => {
                                    if (!value || value.trim() === '') {
                                        return '提示词不能为空';
                                    }
                                    return true;
                                }
                            }).then(async ({ value: newPrompt }) => {
                                try {
                                    const modalResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'Authorization': "Bearer " + localStorage.getItem('token')
                                        }
                                    });

                                    if (modalResponse.data.status && modalResponse.data.data.code === 1) {
                                        this.$message.success('重绘操作已提交');
                                        this.pagination.current = 1;
                                        this.loading = false;
                                        await this.fetchTaskQueue();
                                    } else {
                                        this.$message.error(modalResponse.data.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    console.error('Modal submit error:', error);
                                    this.$message.error('提交失败，请重试');
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data.status && actionResponse.data.data.code === 1) {
                            // 如果直接返回成功
                            this.$message.success('重绘操作已提交');
                            this.pagination.current = 1;
                            this.loading = false;
                            await this.fetchTaskQueue();
                            // this.startQueueTimer();
                        } else {
                            this.$message.error(actionResponse.data.data?.description || '提交失败');
                        }
                    } catch (error) {
                        console.error('Variation action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理平移操作 (pan)
                else if (customId.includes('pan')) {
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            const direction = customId.includes('pan_left') ? '向左平移' :
                                customId.includes('pan_right') ? '向右平移' :
                                    customId.includes('pan_up') ? '向上平移' : '向下平移';

                            this.$prompt(`请输入${direction}的提示词`, '平移设置', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                inputPlaceholder: '请输入提示词',
                                inputValue: actionResponse.data.data.properties?.finalPrompt || task.prompt,
                                inputValidator: (value) => {
                                    if (!value || value.trim() === '') {
                                        return '提示词不能为空';
                                    }
                                    return true;
                                }
                            }).then(async ({ value: newPrompt }) => {
                                try {
                                    const modalResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'Authorization': "Bearer " + localStorage.getItem('token')
                                        }
                                    });

                                    if (modalResponse.data.status && modalResponse.data.data.code === 1) {
                                        this.$message.success('平移操作已提交');
                                        this.pagination.current = 1;
                                        this.loading = false;
                                        await this.fetchTaskQueue();
                                        // this.startQueueTimer();
                                    } else {
                                        this.$message.error(modalResponse.data.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    console.error('Modal submit error:', error);
                                    this.$message.error('提交失败，请重试');
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data.status && actionResponse.data.data.code === 1) {
                            // 如果直接返回成功
                            this.$message.success('平移操作已提交');
                            this.pagination.current = 1;
                            this.loading = false;
                            await this.fetchTaskQueue();
                            //   this.startQueueTimer();
                        } else {
                            this.$message.error(actionResponse.data.data?.description || '提交失败');
                        }
                    } catch (error) {
                        console.error('Pan action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理缩放操作 (CustomZoom)
                else if (customId.includes('CustomZoom')) {
                    try {
                        const actionResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });

                        if (actionResponse.data.status && actionResponse.data.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            this.$prompt(`请输入缩放的提示词`, '设置', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                inputPlaceholder: '请输入提示词',
                                inputValue: '',  // 将默认值设为空字符串
                                inputValidator: (value) => {
                                    if (!value || value.trim() === '') {
                                        return '提示词不能为空';
                                    }
                                    return true;
                                }
                            }).then(async ({ value: newPrompt }) => {
                                try {
                                    const modalResponse = await axios.post(`${config.apiBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'Authorization': "Bearer " + localStorage.getItem('token')
                                        }
                                    });

                                    if (modalResponse.data.status && modalResponse.data.data.code === 1) {
                                        this.$message.success('缩放操作已提交');
                                        this.pagination.current = 1;
                                        this.loading = false;
                                        await this.fetchTaskQueue();
                                        // this.startQueueTimer();
                                    } else {
                                        this.$message.error(modalResponse.data.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    console.error('Modal submit error:', error);
                                    this.$message.error('提交失败，请重试');
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data.status && actionResponse.data.data.code === 1) {
                            // 如果直接返回成功
                            this.$message.success('缩放操作已提交');
                            this.pagination.current = 1;
                            this.loading = false;
                            await this.fetchTaskQueue();
                            //   this.startQueueTimer();
                        } else {
                            this.$message.error(actionResponse.data.data?.description || '提交失败');
                        }
                    } catch (error) {
                        console.error('Zoom action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                }
                // 处理默认情况 - 其他操作类型
                else {
                    // 默认的操作处理
                    const response = await axios.post(`${config.apiBaseUrl}/mj/submit/action`, {
                        taskId: task.id,
                        customId: customId
                    }, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token')
                        }
                    });

                    if (response.data && response.data.code === 1) {
                        this.$message.success('操作已提交');
                        // 刷新任务队列                        
                        this.fetchTaskQueue();
                    } else {
                        this.$message.error(response.data?.description || '操作失败');
                    }
                }
            } catch (error) {
                console.error('MJ操作错误:', error);
                this.$message.error('操作失败，请重试');
            } finally {
                this.loading = false;

                // 获取任务ID
                const taskId = task.id || task.taskId;

                // 刷新当前任务状态而不是整个任务列表
                if (taskId) {
                    this.refreshTaskStatus(taskId);
                }

                // 刷新页面显示的任务列表（只在操作后需要一次）
                // await this.fetchTaskQueue();
            }
        }
    }
}; 