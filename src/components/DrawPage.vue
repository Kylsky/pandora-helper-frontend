<template>
    <el-container class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <!-- 使用 el-dialog 实现图片预览 -->
        <dialog v-if="showViewer" class="fixed inset-0 z-[9999] w-full h-full bg-black bg-opacity-75 flex items-center justify-center"
            @click.self="closeViewer">
            <div class="relative w-full h-full flex items-center justify-center" @click.self="closeViewer">
                <!-- 关闭按钮 -->
                <button class="absolute top-4 right-4 text-white hover:text-gray-300 z-[9999]" @click="closeViewer">
                    <i class="el-icon-close text-2xl"></i>
                </button>
                <img :src="previewUrl" class="max-w-full max-h-full object-contain" @click.stop>
            </div>
        </dialog>

        <!-- 图片编辑弹窗 -->
        <div v-if="showImageEditor" class="fixed inset-0 z-[9999] overflow-y-auto">
            <!-- 遮罩层 -->
            <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="handleEditorClose"></div>

            <!-- 弹窗内容 -->
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                    <!-- 弹窗头部 -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">图片编辑</h3>
                        <button 
                            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            @click="handleEditorClose">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- 弹窗主体 -->
                    <div class="p-4">
                        <div class="space-y-3">
                            <!-- 画布容器 -->
                            <div class="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900" style="height: calc(100vh - 400px);">
                                <canvas 
                                    ref="imageCanvas" 
                                    class="max-w-full max-h-full object-contain"
                                    @mousedown="handleMouseDown" 
                                    @mousemove="handleMouseMove"
                                    @mouseup="handleMouseUp" 
                                    @mouseleave="handleMouseUp">
                                </canvas>
                            </div>

                            <!-- 提示词输入框 -->
                            <div class="space-y-2">
                                <div class="text-sm font-medium text-gray-600 dark:text-gray-400">提示词</div>
                                <textarea 
                                    v-model="editPrompt"
                                    rows="3"
                                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                                    placeholder="请输入提示词">
                                </textarea>
                            </div>
                        </div>
                    </div>

                    <!-- 弹窗底部 -->
                    <div class="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <button 
                            class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            @click="handleEditorClose">
                            取消
                        </button>
                        <button 
                            class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            @click="handleEditorConfirm">
                            确定
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- <header class="px-4 py-3">
            <h2 class="text-xl font-semibold">AI绘图</h2>
        </header> -->
        <el-main ref="mainContainer" class="p-2 md:p-6">
            <div class="w-full h-full">
                <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <!-- 左侧绘图设置 -->
                    <div class="xl:col-span-1 h-full">
                        <div class="sticky top-6">
                            <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
                                <div class="px-8 py-4 border-b border-gray-100 dark:border-gray-700/50">
                                    <h2 class="text-xl font-medium text-gray-800 dark:text-gray-100">绘图设置</h2>
                                    <!-- <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">创建你的专属 AI 艺术作品</p> -->
                                </div>
                                
                                <div class="p-6">
                                    <el-form ref="form" :model="formData" :rules="rules" label-position="top" class="space-y-4">
                                        <!-- 提示词输入 -->
                                        <el-form-item label="提示词" prop="prompt" class="mb-4">
                                            <el-input 
                                                type="textarea" 
                                                v-model="formData.prompt" 
                                                :rows="3" 
                                                placeholder="例如：一只可爱的猫咪坐在窗台上，阳光洒在它的身上..."
                                                class="w-full !rounded-xl !border-gray-200 dark:!border-gray-700 dark:!bg-gray-800 dark:!text-gray-100 hover:!border-blue-500 dark:hover:!border-blue-400 focus:!border-blue-500 dark:focus:!border-blue-400 !shadow-sm dark:!shadow-gray-900/30 transition-colors duration-300">
                                            </el-input>
                                        </el-form-item>
                                        
                                        <!-- 宽高比例选择 -->
                                        <el-form-item label="宽高比例" class="mb-4">
                                            <el-select v-model="formData.aspectRatio" placeholder="选择宽高比例" class="w-full">
                                                <el-option label="默认" value=""></el-option>
                                                <el-option label="16:9" value="--ar 16:9"></el-option>
                                                <el-option label="4:3" value="--ar 4:3"></el-option>
                                                <el-option label="1:1" value="--ar 1:1"></el-option>
                                                <el-option label="9:16" value="--ar 9:16"></el-option>
                                            </el-select>
                                        </el-form-item>

                                        <!-- 预设风格 -->
                                        <el-form-item label="预设风格" class="mb-4">
                                            <el-select 
                                                v-model="selectedStyle" 
                                                placeholder="选择预设风格"
                                                clearable
                                                @change="handleStyleChange"
                                                class="w-full !rounded-xl dark:!bg-gray-800 dark:!border-gray-700">
                                                <el-option
                                                    v-for="style in presetStyles"
                                                    :key="style.name"
                                                    :label="style.name"
                                                    :value="style.name"
                                                    class="group !h-auto dark:!bg-gray-800 dark:hover:!bg-gray-700">
                                                    <div class="flex items-center justify-between py-2">
                                                        <div class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                                            {{ style.name }}
                                                        </div>
                                                        <div class="text-xs text-gray-500 dark:text-gray-400 ml-4 text-right">
                                                            {{ style.description }}
                                                        </div>
                                                    </div>
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                        
                                        <!-- 图片上传 -->
                                        <el-form-item label="参考图片" class="mb-4">
                                            <div class="space-y-3">
                                                <div class="relative group">
                                                    <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-3 group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50 transition-all duration-300 cursor-pointer bg-gray-50/50 dark:bg-gray-800/50"
                                                         @click="triggerFileInput" 
                                                         @dragover.prevent 
                                                         @drop.prevent="handleDrop">
                                                        <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" multiple accept="image/*">
                                                        <div class="flex flex-col items-center justify-center py-1 group-hover:scale-105 transition-all duration-300">
                                                            <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-1.5 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors duration-300">
                                                                <i class="el-icon-plus text-lg text-blue-500/80 dark:text-blue-400/80 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300"></i>
                                                            </div>
                                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">点击或拖拽上传</span>
                                                            <span class="text-xs text-gray-400 dark:text-gray-500">支持多张图片</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div v-if="imageList.length > 0" 
                                                     class="grid grid-cols-4 gap-2 overflow-y-auto" 
                                                     style="max-height: min(200px, calc(100vh - 45rem));">
                                                    <div v-for="(image, index) in imageList" 
                                                         :key="index" 
                                                         class="relative group rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                                                        <img :src="image.url" 
                                                             class="w-full h-16 object-cover transition-all duration-500 group-hover:scale-110" 
                                                             @click="previewImage({imageUrl: image.url})">
                                                        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                            <div class="absolute inset-0 flex items-center justify-center">
                                                                <button class="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 hover:bg-white/20 transition-all duration-300"
                                                                       @click.stop="removeImage(index)">
                                                                    <i class="el-icon-delete text-lg"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </el-form-item>

                                        <!-- 高级设置按钮 -->
                                        <el-form-item class="mb-4">
                                            <el-button 
                                                type="text" 
                                                class="w-full flex items-center justify-center py-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 border border-dashed border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-300"
                                                @click="showAdvancedSettings = true">
                                                <i class="el-icon-setting mr-2 text-lg"></i>
                                                <span class="text-sm font-medium">高级设置</span>
                                            </el-button>
                                        </el-form-item>

                                        <!-- 提交按钮 -->
                                        <el-form-item>
                                            <el-button 
                                                type="primary" 
                                                class="w-full h-10 !rounded-xl bg-[#1A9168] hover:bg-[#158055] border-0 text-base font-medium shadow-lg shadow-[#1A9168]/20 hover:shadow-xl hover:shadow-[#1A9168]/30 transform hover:-translate-y-0.5 transition-all duration-300 !flex !items-center !justify-center" 
                                                :loading="loading || permissionLoading"
                                                @click="submitDrawing" 
                                                :disabled="!hasPermission">
                                                <div class="flex items-center justify-center w-full">
                                                    <i v-if="!loading && !permissionLoading" class="el-icon-picture-outline mr-2"></i>
                                                    <span>{{ loading ? '绘图中...' : (permissionLoading ? '验证中...' : (hasPermission ? '开始绘图' : '无权限')) }}</span>
                                                </div>
                                            </el-button>
                                        </el-form-item>
                                    </el-form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧任务列表/图片编辑区域 -->
                    <div class="xl:col-span-3">
                        <!-- 任务队列表格(仅PC端显示) -->
                        <div v-if="!showImageDetail" class="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg min-h-[calc(100vh-4rem)] flex flex-col">
                            <!-- 标题栏 -->
                            <div class="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200/50 dark:border-gray-700/50">
                                <span class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">任务队列 ({{ taskQueue.length }})</span>
                                <el-button 
                                    type="text" 
                                    icon="el-icon-refresh" 
                                    :loading="queueLoading"
                                    @click="fetchTaskQueue" 
                                    class="text-gray-600/90 hover:text-blue-500 dark:text-gray-400/90 dark:hover:text-blue-400 transition-colors duration-300">
                                    刷新
                                </el-button>
                            </div>

                            <!-- 内容区域 -->
                            <div class="flex-1 flex flex-col overflow-hidden">
                                <!-- 移动端列表视图 -->
                                <div class="block sm:hidden flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
                                    <div v-for="task in taskQueue" :key="task.id" 
                                        class="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                                        @click="handleRowClick(task)">
                                        <div class="flex items-center justify-between mb-2">
                                            <el-tag size="small" type="info">{{ getActionText(task.action) }}</el-tag>
                                            <el-tooltip v-if="task.status === 'FAILURE'" :content="task.failReason || '未知错误'" placement="top">
                                                <el-tag :type="getStatusType(task.status)">{{ getStatusText(task.status) }}</el-tag>
                                            </el-tooltip>
                                            <el-tag v-else :type="getStatusType(task.status)">{{ getStatusText(task.status) }}</el-tag>
                                        </div>
                                        <div class="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{{ task.prompt }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ formatTime(task.displays.submitTime) }}</div>
                                        <el-progress :percentage="getProgressPercentage(task.progress)"
                                            :status="getProgressStatus(task.status)"></el-progress>
                                    </div>
                                </div>

                                <!-- 桌面端表格视图 -->
                                <div class="hidden sm:block flex-1 overflow-y-auto custom-scrollbar">
                                    <el-table 
                                        :data="taskQueue" 
                                        class="w-full custom-table"
                                        :height="'calc(100vh - 16rem)'"
                                        v-loading="queueLoading"
                                        element-loading-text="加载中..."
                                        element-loading-spinner="el-icon-loading"
                                        @row-click="handleRowClick">
                                        <el-table-column prop="prompt" label="提示词" min-width="180" align="left"
                                            show-overflow-tooltip></el-table-column>
                                        <el-table-column prop="action" label="类型" min-width="80" align="center">
                                            <template slot-scope="scope">
                                                <el-tag size="small" type="info">
                                                    {{ getActionText(scope.row.action) }}
                                                </el-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="status" label="状态" min-width="80" align="center">
                                            <template slot-scope="scope">
                                                <el-tooltip v-if="scope.row.status === 'FAILURE'" :content="scope.row.failReason || '未知错误'" placement="top">
                                                    <el-tag :type="getStatusType(scope.row.status)">
                                                        {{ getStatusText(scope.row.status) }}
                                                    </el-tag>
                                                </el-tooltip>
                                                <el-tag v-else :type="getStatusType(scope.row.status)">
                                                    {{ getStatusText(scope.row.status) }}
                                                </el-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="提交时间" min-width="160" align="center">
                                            <template slot-scope="scope">
                                                <el-tooltip :content="scope.row.displays.submitTime" placement="top">
                                                    <span>{{ formatTime(scope.row.displays.submitTime) }}</span>
                                                </el-tooltip>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="进度" width="220" align="center">
                                            <template slot-scope="scope">
                                                <el-progress :percentage="getProgressPercentage(scope.row.progress)"
                                                    :status="getProgressStatus(scope.row.status)"></el-progress>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>

                                <!-- 分页 -->
                                <div class="flex justify-center p-4 border-t border-gray-100 dark:border-gray-700">
                                    <el-pagination 
                                        @size-change="handleSizeChange" 
                                        @current-change="handlePageChange"
                                        :current-page="pagination.current" 
                                        :page-sizes="[10, 20, 30]"
                                        :page-size="pagination.pageSize" 
                                        layout="total, sizes, prev, pager, next, jumper"
                                        :total="pagination.total"
                                        class="flex items-center">
                                    </el-pagination>
                                </div>
                            </div>
                        </div>

                        <!-- 图片编辑模块 -->
                        <div v-else class="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg min-h-[calc(100vh-4rem)]">
                            <div class="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 dark:border-gray-700/50">
                                <div class="flex items-center space-x-4">
                                    <span class="text-xl font-semibold text-gray-800 dark:text-gray-200">图片编辑</span>
                                    <el-button 
                                        icon="el-icon-back" 
                                        type="text"
                                        @click="showImageDetail = false"
                                        class="text-gray-600/90 hover:text-blue-500">
                                        返回任务队列
                                    </el-button>
                                </div>
                            </div>
                            
                            <div class="p-6">
                                <div class="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
                                    <!-- 左侧图片预览 -->
                                    <div class="md:w-2/3 h-full">
                                        <div class="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 h-full flex items-center justify-center">
                                            <img 
                                                v-if="currentTask && currentTask.imageUrl"
                                                :src="currentTask.imageUrl"
                                                @click="handlePreviewImage(currentTask.imageUrl)"
                                                class="max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                                            >
                                        </div>
                                    </div>

                                    <!-- 右侧操作区域 -->
                                    <div class="md:w-1/3 h-full flex flex-col">
                                        <div class="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                                            <!-- 提示词 -->
                                            <div class="space-y-4">
                                                <div class="text-sm font-medium text-gray-600 dark:text-gray-400">提示词</div>
                                                <div class="relative group">
                                                    <div class="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">{{ currentTask ? currentTask.prompt : '' }}</div>
                                                    <button class="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-md shadow-sm transition-colors opacity-0 group-hover:opacity-100" @click="copyPrompt(currentTask?.prompt)" v-if="currentTask?.prompt"><i class="el-icon-document-copy text-sm"></i></button>
                                                </div>
                                            </div>

                                            <!-- 任务信息 -->
                                            <div class="grid grid-cols-2 gap-5">
                                                <div class="space-y-4">
                                                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400">任务状态</div>
                                                    <el-tag :type="getStatusType(currentTask?.status)">
                                                        {{ getStatusText(currentTask?.status) }}
                                                    </el-tag>
                                                </div>
                                                <div class="space-y-4">
                                                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400">任务类型</div>
                                                    <el-tag type="info">{{ getActionText(currentTask?.action) }}</el-tag>
                                                </div>
                                            </div>

                                            <!-- 操作按钮组 -->
                                            <div class="space-y-6">
                                                <div class="text-sm font-medium text-gray-600 dark:text-gray-400">可用操作</div>
                                                <div class="grid grid-cols-2 gap-3">
                                                    <!-- 放大按钮组 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('upsample'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('upsample'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <i class="el-icon-zoom-in mr-2"></i>
                                                            <span>{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- 变体按钮组 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('variation'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('variation'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 hover:border-yellow-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <i class="el-icon-refresh mr-2"></i>
                                                            <span>{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- Inpaint 按钮组 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('Inpaint'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('Inpaint'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <i class="el-icon-edit mr-2"></i>
                                                            <span>{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- 缩放按钮组 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('Outpaint') || btn.customId.includes('CustomZoom'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('Outpaint') || b.customId.includes('CustomZoom'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 hover:border-yellow-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <i class="el-icon-zoom-out mr-2"></i>
                                                            <span>{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- 平移按钮组 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('pan'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('pan'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <span>{{ btn.emoji }}</span>
                                                            <span class="ml-2">{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- 收藏按钮 -->
                                                    <template v-if="currentTask && currentTask.buttons && currentTask.buttons.some(btn => btn.customId.includes('BOOKMARK'))">
                                                        <button
                                                            v-for="btn in currentTask.buttons.filter(b => b.customId.includes('BOOKMARK'))"
                                                            :key="btn.customId"
                                                            class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
                                                            @click="handleButtonAction(btn, currentTask)">
                                                            <span>{{ btn.emoji }}</span>
                                                            <span class="ml-2">{{ btn.label }}</span>
                                                        </button>
                                                    </template>

                                                    <!-- 下载按钮 -->
                                                    <button 
                                                        v-if="currentTask && currentTask.imageUrl" 
                                                        class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
                                                        @click="downloadImage(currentTask.imageUrl)">
                                                        <i class="el-icon-download mr-2"></i>
                                                        <span>下载</span>
                                                    </button>

                                                    <!-- 取消按钮 -->
                                                    <button 
                                                        v-if="currentTask && canCancel(currentTask.status)" 
                                                        class="flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
                                                        @click="handleCancel(currentTask)">
                                                        <i class="el-icon-close mr-2"></i>
                                                        <span>取消</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PC端绘图结果展示 -->
            <div v-if="!isMobile && drawingResults.length > 0" class="pc-view">
                <el-card class="result-card">
                    <div slot="header">
                        <span>绘图结果</span>
                    </div>
                    <el-row :gutter="20">
                        <el-col v-for="(result, index) in drawingResults" :key="index" :xs="24" :sm="12" :md="8" :lg="6"
                            class="result-col">
                            <el-card shadow="hover" class="image-card">
                                <el-image :src="result.imageUrl" fit="contain" class="result-image">
                                    <div slot="error" class="image-slot">
                                        <i class="el-icon-picture-outline"></i>
                                    </div>
                                </el-image>
                                <div class="image-actions">
                                    <el-button type="text" @click="downloadImage(result.imageUrl)">
                                        <i class="el-icon-download"></i> 下载
                                    </el-button>
                                    <el-button type="text" @click="variateImage(result.imageUrl, result.taskId)">
                                        <i class="el-icon-refresh"></i> 变体
                                    </el-button>
                                </div>
                                <div class="prompt-text">{{ result.prompt }}</div>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-card>
            </div>

            <!-- 移动端绘图结果展示 -->
            <div v-if="isMobile && drawingResults.length > 0" class="mobile-view">
                <div v-for="(result, index) in drawingResults" :key="index" class="mobile-card">
                    <div class="mobile-card-content">
                        <el-image :src="result.imageUrl" fit="contain" class="mobile-image">
                            <div slot="error" class="image-slot">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                        <div class="prompt-badge">
                            <i class="el-icon-chat-line-square"></i>
                            {{ result.prompt }}
                        </div>
                    </div>
                    <div class="mobile-card-divider"></div>
                    <div class="mobile-card-actions">
                        <div class="action-row">
                            <el-button type="primary" size="mini" @click="downloadImage(result.imageUrl)">
                                <i class="el-icon-download"></i> 下载
                            </el-button>
                            <el-button type="warning" size="mini" @click="variateImage(result.imageUrl, result.taskId)">
                                <i class="el-icon-refresh"></i> 变体
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 返回顶部按钮(仅移动端显示) -->
            <el-backtop v-if="isMobile" :right="16" :bottom="16" :target="'.el-main'" class="mobile-backtop">
                <i class="el-icon-arrow-up"></i>
            </el-backtop>

            <!-- 在template最外层添加抽屉组件 -->
            <el-drawer
                title="高级设置"
                :visible.sync="showAdvancedSettings"
                direction="rtl"
                :size="isMobile ? '75%' : '400px'"
                :modal-append-to-body="false"
                :wrapperClosable="true"
                :modal="true"
                custom-class="advanced-settings-drawer dark:bg-gray-800">
                <div class="flex flex-col h-full">
                    <div class="flex-1 overflow-y-auto p-4 md:p-6">
                        <div class="space-y-6 md:space-y-8">
                            <!-- 基础设置组 -->
                            <div class="settings-group">
                                <div class="flex items-center space-x-2 mb-3 md:mb-4">
                                    <i class="el-icon-setting text-base md:text-lg text-emerald-600"></i>
                                    <span class="text-sm md:text-base font-medium">基础设置</span>
                                </div>
                                <el-form :model="formData" label-position="top" label-width="auto" class="space-y-3 md:space-y-4">
                                    <!-- 版本选择 -->
                                    <el-form-item label="版本选择" class="w-full">
                                        <el-select v-model="formData.version" placeholder="选择版本" class="w-full">
                                            <el-option label="MJ V6.1" value="--v 6.1"></el-option>
                                            <el-option label="MJ V6" value="--v 6"></el-option>
                                            <el-option label="MJ V5.2" value="--v 5.2"></el-option>
                                            <el-option label="MJ V5.1" value="--v 5.1"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <el-form-item label="文本权重" class="w-full">
                                        <el-select v-model="formData.imageWeight" placeholder="设置文本权重" class="w-full">
                                            <el-option label="默认(0.25)" value=""></el-option>
                                            <el-option label="0.5" value="--iw 0.5"></el-option>
                                            <el-option label="1.0" value="--iw 1"></el-option>
                                            <el-option label="2.0" value="--iw 2"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-form>
                            </div>

                            <!-- 高级设置组 -->
                            <div class="settings-group">
                                <div class="flex items-center space-x-2 mb-3 md:mb-4">
                                    <i class="el-icon-magic-stick text-base md:text-lg text-emerald-600"></i>
                                    <span class="text-sm md:text-base font-medium">高级设置</span>
                                </div>
                                <el-form :model="formData" label-position="top" label-width="auto" class="space-y-3 md:space-y-4">
                                    <!-- 视角设置 -->
                                    <el-form-item label="视角" class="w-full">
                                        <el-select v-model="formData.perspective" placeholder="选择视角" class="w-full">
                                            <el-option label="默认" value=""></el-option>
                                            <el-option label="第一人称视角" value="first person"></el-option>
                                            <el-option label="第三人称视角" value="third person"></el-option>
                                            <el-option label="俯视角" value="top view"></el-option>
                                            <el-option label="仰视角" value="bottom view"></el-option>
                                            <el-option label="侧视角" value="side view"></el-option>
                                            <el-option label="远景" value="long shot"></el-option>
                                            <el-option label="近景" value="close-up"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <!-- 人物镜头 -->
                                    <el-form-item label="人物镜头" class="w-full">
                                        <el-select v-model="formData.shot" placeholder="选择人物镜头" class="w-full">
                                            <el-option label="默认" value=""></el-option>
                                            <el-option label="全身镜头" value="full body"></el-option>
                                            <el-option label="半身镜头" value="half body"></el-option>
                                            <el-option label="特写镜头" value="close-up shot"></el-option>
                                            <el-option label="超近特写" value="extreme close-up"></el-option>
                                            <el-option label="全景镜头" value="wide shot"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <!-- 灯光设置 -->
                                    <el-form-item label="灯光" class="w-full">
                                        <el-select v-model="formData.lighting" placeholder="选择灯光效果" class="w-full">
                                            <el-option label="默认" value=""></el-option>
                                            <el-option label="自然光" value="natural light"></el-option>
                                            <el-option label="柔和光" value="soft light"></el-option>
                                            <el-option label="强光" value="hard light"></el-option>
                                            <el-option label="逆光" value="backlight"></el-option>
                                            <el-option label="环境光" value="ambient light"></el-option>
                                            <el-option label="聚光灯" value="spotlight"></el-option>
                                            <el-option label="霓虹灯" value="neon light"></el-option>
                                            <el-option label="电影灯光" value="cinematic light"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <el-form-item label="随机种子" class="w-full">
                                        <el-input-number v-model="formData.seed" :min="0" :max="4294967295"
                                            placeholder="输入随机种子" class="w-full">
                                        </el-input-number>
                                    </el-form-item>
                                    <el-form-item label="渲染质量" class="w-full">
                                        <el-select v-model="formData.quality" placeholder="选择渲染质量" class="w-full">
                                            <el-option label="默认(1.0)" value=""></el-option>
                                            <el-option label="0.25" value="--quality 0.25"></el-option>
                                            <el-option label="0.5" value="--quality 0.5"></el-option>
                                            <el-option label="2.0" value="--quality 2"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="风格强度" class="w-full">
                                        <el-slider v-model="formData.stylize" :min="0" :max="1000" :step="10">
                                        </el-slider>
                                    </el-form-item>
                                    <el-form-item label="多样性" class="w-full">
                                        <el-slider v-model="formData.chaos" :min="0" :max="100">
                                        </el-slider>
                                    </el-form-item>
                                </el-form>
                            </div>

                            <!-- 特殊选项组 -->
                            <div class="settings-group">
                                <div class="flex items-center space-x-2 mb-3 md:mb-4">
                                    <i class="el-icon-star-off text-base md:text-lg text-emerald-600"></i>
                                    <span class="text-sm md:text-base font-medium">特殊选项</span>
                                </div>
                                <el-form :model="formData" label-position="top" label-width="auto">
                                    <el-form-item>
                                        <el-checkbox-group v-model="formData.specialOptions" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <el-checkbox label="--sameseed" class="!mr-0">使用相同种子</el-checkbox>
                                            <el-checkbox label="--upbeta" class="!mr-0">Beta放大工具</el-checkbox>
                                            <el-checkbox label="--uplight" class="!mr-0">轻量化处理</el-checkbox>
                                            <el-checkbox label="--niji" class="!mr-0">动漫风格</el-checkbox>
                                            <!-- <el-checkbox label="--hd" class="!mr-0">高清模式</el-checkbox> -->
                                            <!-- <el-checkbox label="--tile" class="!mr-0">平铺模式</el-checkbox> -->
                                        </el-checkbox-group>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </div>
                    <!-- 底部操作栏 -->
                    <div class="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 md:p-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400">设置将在下次绘图时生效</span>
                            <div class="space-x-2">
                                <el-button size="mini" md:size="small" @click="clearAdvancedSettings">
                                    重置设置
                                </el-button>
                                <el-button size="mini" md:size="small" type="primary" @click="showAdvancedSettings = false">
                                    确定
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-drawer>
        </el-main>
    </el-container>
</template>

<script>
import message from '@/configs/message'
import axios from '@/configs/axios'
import config from '@/configs/config'

export default {
    name: 'DrawPage',

    data() {
        return {
            loading: false,
            permissionLoading: false,
            isMobile: false,
            hasPermission: false,
            expandedRows: [],
            formData: {
                prompt: '',
                bot_type: 'MID_JOURNEY',
                state: 'midjourney-proxy-admin',
                speed: 'FAST',
                aspectRatio: '',
                imageWeight: '',
                version: '--v 6.1',  // 默认使用 V6.1 版本
                seed: '',
                quality: '',
                stylize: 0,
                chaos: 0,
                specialOptions: [],
                perspective: '',  // 视角
                shot: '',        // 人物镜头
                lighting: ''     // 灯光
            },
            rules: {
                prompt: [
                    { required: true, message: '请输入提示词', trigger: 'blur' }
                ],
                model: [
                    { required: true, message: '请选择模型', trigger: 'change' }
                ]
            },
            modelOptions: [
                { value: 'MJ_V6', text: 'MJ V6' },
                { value: 'MJ_V5.2', text: 'MJ V5.2' }
            ],
            speedOptions: [
                { value: 'FAST', text: '快速' },
                { value: 'RELAX', text: '标准' }
            ],
            drawingResults: [],
            taskId: null,
            checkInterval: null,
            taskQueue: [],
            queueLoading: false,
            queueTimer: null,
            activeCollapse: ['queue'],
            mjApiSecret: null,
            showViewer: false,
            previewUrl: '',
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            showAdvancedSettings: false,
            showImageEditor: false,
            selectedTool: 'rectangle',
            editPrompt: '',
            isDrawing: false,
            startX: 0,
            startY: 0,
            currentTask: null,
            maskBase64: '',
            originalImage: null, // 添加新的数据属性
            selectionRect: { x: 0, y: 0, width: 0, height: 0 },
            finalSelectionRect: null,
            imageList: [], // 添加图片列表数据
            base64Array: [], // 添加base64数组
            // 添加预设风格数据
            presetStyles: [
                {
                    name: '写实风格',
                    description: '注重细节的写实效果',
                    params: {
                        stylize: 100,
                        quality: '--quality 1',
                        specialOptions: ['--niji'],
                        aspectRatio: '--ar 1:1'
                    }
                },
                {
                    name: '动漫风格',
                    description: '日式动漫插画风格',
                    params: {
                        stylize: 100,
                        quality: '--quality 1',
                        specialOptions: ['--niji'],
                        aspectRatio: '--ar 1:1'
                    }
                },
                {
                    name: '油画风格',
                    description: '古典油画艺术效果',
                    params: {
                        stylize: 250,
                        quality: '--quality 1',
                        specialOptions: [],
                        aspectRatio: '--ar 4:3'
                    }
                },
                {
                    name: '水彩风格',
                    description: '柔和的水彩画效果',
                    params: {
                        stylize: 200,
                        quality: '--quality 1',
                        specialOptions: [],
                        aspectRatio: '--ar 4:3'
                    }
                },
                {
                    name: '概念艺术',
                    description: '现代概念设计风格',
                    params: {
                        stylize: 150,
                        quality: '--quality 1',
                        specialOptions: [],
                        aspectRatio: '--ar 16:9'
                    }
                },
                {
                    name: '赛博朋克',
                    description: '未来科技感风格',
                    params: {
                        stylize: 300,
                        quality: '--quality 1',
                        specialOptions: [],
                        aspectRatio: '--ar 16:9'
                    }
                },
                {
                    name: '极简风格',
                    description: '简约现代设计风格',
                    params: {
                        stylize: 50,
                        quality: '--quality 1',
                        specialOptions: [],
                        aspectRatio: '--ar 1:1'
                    }
                },
                {
                    name: '复古风格',
                    description: '怀旧复古效果',
                    params: {
                        stylize: 200,
                        quality: '--quality 0.5',
                        specialOptions: [],
                        aspectRatio: '--ar 4:3'
                    }
                },
                // 添加头像相关风格
                {
                    name: '高清头像-写实',
                    description: '适合制作写实风格的高清头像',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 1:1'
                    }
                },
                {
                    name: '高清头像-动漫',
                    description: '适合制作动漫风格的高清头像',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: ['--niji'],
                        aspectRatio: '--ar 1:1'
                    }
                },
                {
                    name: '高清头像-艺术',
                    description: '适合制作艺术风格的高清头像',
                    params: {
                        stylize: 200,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 1:1'
                    }
                },
                // 添加手机壁纸相关风格
                {
                    name: '手机壁纸-写实',
                    description: '适合制作写实风格的手机壁纸',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 9:16'
                    }
                },
                {
                    name: '手机壁纸-动漫',
                    description: '适合制作动漫风格的手机壁纸',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: ['--niji'],
                        aspectRatio: '--ar 9:16'
                    }
                },
                {
                    name: '手机壁纸-艺术',
                    description: '适合制作艺术风格的手机壁纸',
                    params: {
                        stylize: 200,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 9:16'
                    }
                },
                // 添加电脑壁纸相关风格
                {
                    name: '电脑壁纸-写实',
                    description: '适合制作写实风格的电脑壁纸',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 16:9'
                    }
                },
                {
                    name: '电脑壁纸-动漫',
                    description: '适合制作动漫风格的电脑壁纸',
                    params: {
                        stylize: 100,
                        quality: '--quality 2',
                        specialOptions: ['--niji'],
                        aspectRatio: '--ar 16:9'
                    }
                },
                {
                    name: '电脑壁纸-艺术',
                    description: '适合制作艺术风格的电脑壁纸',
                    params: {
                        stylize: 200,
                        quality: '--quality 2',
                        specialOptions: [],
                        aspectRatio: '--ar 16:9'
                    }
                }
            ],
            selectedStyle: null,
            showImageDetail: false,
        }
    },

    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },

        async getUserInfo() {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/user/info`, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });
                if (response.data.status) {
                    this.permissionLoading = true;
                    this.mjApiSecret = response.data.data.apiKey;
                    // 验证apiKey权限
                    try {
                        const adminResponse = await axios.get(`${config.apiBaseUrl}/mj/users`, {
                            headers: {
                                'Authorization': "Bearer " + localStorage.getItem('token')
                            }
                        });
                        // 获取当前用户名
                        const currentUsername = response.data.data.username;
                        // 检查用户列表是否为空或是否包含当前用户
                        const userList = adminResponse.data.data.list || [];
                        // 查询用户名相同的用户
                        const hasPerm = userList.find(user => user.name === currentUsername);
                        // 获取具体的权限

                        const permission = hasPerm.status;
                        if (permission === 'NORMAL') {
                            this.hasPermission = true;
                            await this.fetchTaskQueue();
                        } else {
                            message.error('您没有AI绘图的权限');
                            this.hasPermission = false;
                        }
                    } catch (error) {
                        console.log('AI绘图块权限验证失败:', error);
                        this.hasPermission = false;
                    } finally {
                        this.permissionLoading = false;
                    }
                } else {
                    message.error('获取用户信息失败');
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                message.handleError(error);
            }
        },
        async fetchTaskQueue() {
            if (this.queueLoading) return;

            this.queueLoading = true;
            try {
                const response = await axios.get(`${config.apiBaseUrl}/mj/tasks?` + "page=" + this.pagination.current + "&size=" + this.pagination.pageSize, {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token')
                    }
                });

                if (response.status === 200 && response.data.data.list) {
                    this.taskQueue = response.data.data.list.map(task => ({
                        ...task,
                        displays: task.displays || {
                            submitTime: new Date(task.submitTime).toLocaleString(),
                            finishTime: task.finishTime ? new Date(task.finishTime).toLocaleString() : '',
                            status: task.status,
                            action: task.action
                        }
                    }));
                    // 更新分页信息
                    this.pagination.total = response.data.data.pagination.total;
                } else {
                    console.error('任务列表数据格式不正确:', response.data.data);
                    message.error('获取任务队列失败');
                }
            } catch (error) {
                console.error('获取任务列表失败:', error);
                message.handleError(error);
            } finally {
                this.queueLoading = false;
            }
        },

        startQueueTimer() {
            // 先清除可能存在的定时器
            this.stopQueueTimer()

            let refreshCount = 0;  // 添加刷新计数器
            const maxRefreshes = 7;  // 最大刷新次数

            // 启动新的定时器
            this.queueTimer = setInterval(async () => {
                refreshCount++;  // 增加计数
                await this.fetchTaskQueue()

                // 检查是否所有任务已完成   
                const hasUnfinishedTasks = this.taskQueue.some(task =>
                    !['SUCCESS', 'FAILURE', 'CANCEL'].includes(task.status)
                );

                // 如果达到最大刷新次数或所有任务已完成，停止定时器
                if (refreshCount >= maxRefreshes || !hasUnfinishedTasks) {
                    this.stopQueueTimer()
                    console.log('停止轮询：', refreshCount >= maxRefreshes ? '达到最大刷新次数' : '所有任务已完成')
                }
            }, 5000)  // 改为5秒轮询一次
        },

        stopQueueTimer() {
            if (this.queueTimer) {
                clearInterval(this.queueTimer)
                this.queueTimer = null
            }
        },

        getStatusType(status) {
            const statusMap = {
                'NOT_START': 'info',
                'SUBMITTED': 'info',
                'IN_PROGRESS': 'warning',
                'SUCCESS': 'success',
                'FAILURE': 'danger',
                'MODAL': 'warning',
                'CANCEL': 'info'
            };
            return statusMap[status] || 'info';
        },

        getStatusText(status) {
            const statusMap = {
                'NOT_START': '未开始',
                'SUBMITTED': '已提交',
                'IN_PROGRESS': '进行中',
                'SUCCESS': '已完成',
                'FAILURE': '失败',
                'MODAL': '等待中',
                'CANCEL': '取消'
            };
            return statusMap[status] || status;
        },

        getProgressStatus(status) {
            if (status === 'SUCCESS') return 'success';
            if (status === 'FAILURE') return 'exception';
            if (status === 'CANCEL') return 'warning';
            return '';
        },

        getProgressPercentage(progress) {
            if (!progress) return 0;
            const match = progress.match(/(\d+)%/);
            return match ? parseInt(match[1]) : 0;
        },

        canCancel(status) {
            return ['NOT_START', 'SUBMITTED', 'IN_PROGRESS', 'MODAL'].includes(status);
        },

        async cancelTask(taskId) {
            try {
                const response = await axios.post(`${config.mjBaseUrl}/mj/task/${taskId}/cancel`, null, {
                    headers: {
                        'mj-api-secret': this.mjApiSecret
                    }
                });
                // 处理回的 TaskInfo 对象
                if (response.status === 200) {
                    const taskInfo = response.data;
                    if (taskInfo.status === 'CANCEL') {
                        message.success('任务已取消');
                        // 更新任务队列中对应任务状态
                        const taskIndex = this.taskQueue.findIndex(task => task.id === taskId);
                        if (taskIndex !== -1) {
                            this.taskQueue[taskIndex] = {
                                ...this.taskQueue[taskIndex],
                                ...taskInfo,
                                displays: {
                                    ...this.taskQueue[taskIndex].displays,
                                    status: taskInfo.status
                                }
                            };
                        }
                    } else {
                        message.warning(`取消失败: ${taskInfo.failReason || '未知原因'}`);
                    }
                    // 刷新任务队列
                    await this.fetchTaskQueue();
                } else {
                    message.error('取消任务失败：返回数据为空');
                }
            } catch (error) {
                console.error('取消任务失败:', error);
                message.handleError(error);
            }
        },

        async submitDrawing() {
            try {
                const valid = await this.$refs.form.validate();
                if (!valid) return;

                this.loading = true;
                let fullPrompt = '';

                // 添加视角、人物镜头和灯光参数到最前面
                const prefixParams = [
                    this.formData.perspective,
                    this.formData.shot,
                    this.formData.lighting
                ].filter(param => param).join(', ');

                if (prefixParams) {
                    fullPrompt = prefixParams + ', ' + this.formData.prompt;
                } else {
                    fullPrompt = this.formData.prompt;
                }

                // 添加其他参数
                if (this.formData.aspectRatio) fullPrompt += ' ' + this.formData.aspectRatio;
                if (this.formData.imageWeight) fullPrompt += ' ' + this.formData.imageWeight;
                if (this.formData.version) fullPrompt += ' ' + this.formData.version;
                if (this.formData.seed) fullPrompt += ` --seed ${this.formData.seed}`;
                if (this.formData.quality) fullPrompt += ' ' + this.formData.quality;
                if (this.formData.stylize > 0) fullPrompt += ` --stylize ${this.formData.stylize}`;
                if (this.formData.chaos > 0) fullPrompt += ` --chaos ${this.formData.chaos}`;

                // 添加特殊选项
                this.formData.specialOptions.forEach(option => {
                    fullPrompt += ' ' + option;
                });

                const requestData = {
                    prompt: fullPrompt,
                    // negativePrompt: this.formData.negativePrompt || '',
                    // model: this.formData.model,
                    bot_type: 'MID_JOURNEY',
                    state: 'midjourney-proxy-admin',
                    base64Array: this.base64Array,
                    accountFilter:{}
                };

                const response = await axios.post(`${config.mjBaseUrl}/mj/submit/imagine`, requestData, {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                        'sec-ch-ua-mobile': '?0',
                        'Dnt': '1',
                        'sec-ch-ua-platform': '"macOS"',
                        'mj-api-secret': this.mjApiSecret,
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    withCredentials: true
                });

                if (response.data && response.data.code === 1) {
                    this.taskId = response.data.result;
                    message.success(response.data.description || '提交成功，正在生成...');
                    await this.fetchTaskQueue();
                    this.startQueueTimer();
                } else {
                    message.error(response.data?.description || '提交失败');
                }
            } catch (error) {
                message.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async checkProgress() {
            if (!this.taskId) return

            try {
                const response = await axios.get(`${config.mjBaseUrl}/mj/task/fetch/${this.taskId}`, {
                    headers: {
                        'mj-api-secret': this.mjApiSecret
                    }
                })

                if (response.data) {
                    const task = response.data
                    if (task.status === 'SUCCESS') {
                        this.drawingResults.unshift({
                            imageUrl: task.imageUrl,
                            prompt: task.prompt,
                            taskId: this.taskId
                        })
                        this.stopCheckingProgress()
                        message.success('生成完成')
                        await this.fetchTaskQueue()
                    } else if (task.status === 'FAILURE') {
                        this.stopCheckingProgress()
                        message.error(task.failReason || '生成失败')
                    }
                }
            } catch (error) {
                console.error('检查进度失败:', error)
            }
        },

        startCheckingProgress() {
            this.checkInterval = setInterval(this.checkProgress, 3000)
        },

        stopCheckingProgress() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval)
                this.checkInterval = null
            }
        },

        async downloadImage(imageUrl) {
            try {
                window.open(imageUrl, '_blank');
            } catch (error) {
                console.error('打开图片失败:', error);
                message.error('打开失败');
            }
        },

        async variateImage(imageUrl, taskId) {
            try {
                this.loading = true
                const response = await axios.post(`${config.mjBaseUrl}/mj/submit/change`, {
                    taskId: taskId,
                    action: 'VARIATION',
                    index: 1,
                    notifyHook: '',
                    state: 'midjourney-proxy-admin'
                }, {
                    headers: {
                        'mj-api-secret': this.mjApiSecret
                    }
                })

                if (response.data && response.data.id) {
                    this.taskId = response.data.id
                    message.success('变体生成已提交')
                    this.startCheckingProgress()
                    await this.fetchTaskQueue()
                    this.startQueueTimer()
                } else {
                    message.error(response.data?.failReason || '提交失败')
                }
            } catch (error) {
                message.handleError(error)
            } finally {
                this.loading = false
            }
        },

        getActionText(action) {
            const actionMap = {
                'IMAGINE': '绘图',
                'UPSCALE': '放大',
                'VARIATION': '变体',
                'REROLL': '重绘'
            };
            return actionMap[action] || action;
        },

        previewImage(task) {
            this.$alert(
                `<div style="text-align: center">
                    <img src="${task.imageUrl}" style="max-width: 100%; max-height: 500px;">
                    <p style="margin-top: 10px">${task.prompt || ''}</p>
                    <p style="margin-top: 5px; color: #666;">提交时间：${task.displays?.submitTime || ''}</p>
                    <p style="margin-top: 5px; color: #666;">完成时间：${task.displays?.finishTime || ''}</p>
                </div>`,
                '图片预览',
                {
                    dangerouslyUseHTMLString: true,
                    customClass: 'image-preview-dialog',
                    showClose: true,
                    callback: () => {
                        // 函数处理关闭回调
                    },
                    beforeClose: (_, instance, done) => {
                        done(); // 直接关闭
                    }
                }
            ).catch(err => {
                // 略关闭对话框时的报错
                if (err !== 'cancel' && err !== 'close') {
                    console.error('预览对话框错误:', err);
                }
            });
        },

        handleRowClick(row) {
            if (row.userId === '🔒') {
                this.$message.warning('无权查看该任务详情');
                return;
            }
            this.currentTask = row;
            this.showImageDetail = true;
        },

        getButtonIcon(action) {
            const iconMap = {
                'PREVIEW': 'el-icon-view',
                'DOWNLOAD': 'el-icon-download',
                'UPSCALE': 'el-icon-zoom-in',
                'VARIATION': 'el-icon-refresh',
                'REROLL': 'el-icon-refresh-right',
                'CANCEL': 'el-icon-close',
                'INPAINT': 'el-icon-edit'  // 添加 Inpaint 的图标
            };
            return iconMap[action] || 'el-icon-more';
        },

        async handleButtonAction(button, task) {
            try {
                this.loading = true;
                if (button.customId.includes('Inpaint')) {
                    try {
                        const actionResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: button.customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'mj-api-secret': this.mjApiSecret
                            }
                        });

                        if (actionResponse.data && actionResponse.data.code === 21) {
                            this.currentTask = task;
                            this.editPrompt = '';  // 设置为空字符串
                            this.showImageEditor = true;
                            this.currentTask.modalTaskId = actionResponse.data.result;

                            // 等待对话框打开后初始化画布
                            this.$nextTick(() => {
                                console.log('Initializing canvas with image:', task.imageUrl);
                                this.initializeCanvas(task.imageUrl);
                            });
                        } else {
                            this.$message.error(actionResponse.data?.description || '操作失败');
                        }
                    } catch (error) {
                        console.error('Inpaint action error:', error);
                        this.$message.error('操作失败，请重试');
                    }
                    return;
                } else if (button.customId.includes('upsample')
                    || button.customId.includes('reroll')
                    || button.customId.includes('variation')
                    || button.customId.includes('BOOKMARK')
                    || button.customId.includes('Outpaint')
                ) {
                    try {
                        const actionResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: button.customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'mj-api-secret': this.mjApiSecret
                            }
                        });
                        if (actionResponse.data && actionResponse.data.code === 1) {
                            this.$message.success('操作成功');
                            await this.fetchTaskQueue();
                            // 启动轮询
                            if (!button.customId.includes('BOOKMARK')) {
                                this.startQueueTimer();
                            }
                            
                        } else {
                            this.$message.error(actionResponse.data?.description || '操作失败');
                        }
                    } catch (error) {
                        message.handleError(error);
                    }
                    return;
                } else if (button.customId.includes('pan')) {
                    try {
                        const actionResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: button.customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'mj-api-secret': this.mjApiSecret
                            }
                        });

                        if (actionResponse.data && actionResponse.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            const direction = button.customId.includes('pan_left') ? '向左平移' :
                                button.customId.includes('pan_right') ? '向右平移' :
                                    button.customId.includes('pan_up') ? '向上平移' : '向下平移';

                            this.$prompt(`请输入${direction}的提示词`, '平移设置', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                inputPlaceholder: '请输入提示词',
                                inputValue: actionResponse.data.properties?.finalPrompt || task.prompt,
                                inputValidator: (value) => {
                                    if (!value || value.trim() === '') {
                                        return '提示词不能为空';
                                    }
                                    return true;
                                }
                            }).then(async ({ value: newPrompt }) => {
                                try {
                                    const modalResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'mj-api-secret': this.mjApiSecret
                                        }
                                    });

                                    if (modalResponse.data && modalResponse.data.code === 1) {
                                        message.success('平移操作已提交');
                                        await this.fetchTaskQueue();
                                        this.startQueueTimer();
                                    } else {
                                        message.error(modalResponse.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    message.handleError(error);
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data && actionResponse.data.code === 1) {
                            // 如果直接返回成功
                            this.taskId = actionResponse.data.result;
                            message.success('平移操作已提交');
                            await this.fetchTaskQueue();
                            this.startQueueTimer();
                        } else {
                            message.error(actionResponse.data?.description || '提交失败');
                        }
                    } catch (error) {
                        message.handleError(error);
                    }
                    return;
                } else if (button.customId.includes('CustomZoom')) {
                    try {
                        const actionResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/action`, {
                            taskId: task.id,
                            customId: button.customId,
                            index: 1,
                            chooseSameChannel: true,
                            state: 'midjourney-proxy-admin'
                        }, {
                            headers: {
                                'mj-api-secret': this.mjApiSecret
                            }
                        });

                        if (actionResponse.data && actionResponse.data.code === 21) {
                            // 如果返回code=21，弹出提示词输入框
                            const direction = button.customId.includes('CustomZoom') ? '缩放' : '';

                            this.$prompt(`请输入${direction}的提示词`, '设置', {
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
                                    const modalResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/modal`, {
                                        taskId: actionResponse.data.result,
                                        prompt: newPrompt
                                    }, {
                                        headers: {
                                            'mj-api-secret': this.mjApiSecret
                                        }
                                    });

                                    if (modalResponse.data && modalResponse.data.code === 1) {
                                        message.success('操作已提交');
                                        await this.fetchTaskQueue();
                                        this.startQueueTimer();
                                    } else {
                                        message.error(modalResponse.data?.description || '提交失败');
                                    }
                                } catch (error) {
                                    message.handleError(error);
                                }
                            }).catch(() => {
                                // 用户取消操作
                            });
                        } else if (actionResponse.data && actionResponse.data.code === 1) {
                            // 如果直接返回成功
                            this.taskId = actionResponse.data.result;
                            message.success('平移操作已提交');
                            await this.fetchTaskQueue();
                            this.startQueueTimer();
                        } else {
                            message.error(actionResponse.data?.description || '提交失败');
                        }
                    } catch (error) {
                        message.handleError(error);
                    }
                    return;
                }
            } catch (error) {
                console.error('Button action error:', error);
                this.$message.error('操作失败，请重试');
            } finally {
                this.loading = false;
            }
        },

        copyTaskId(taskId) {
            const input = document.createElement('input');
            input.value = taskId;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            message.success('任务ID已复制');
        },

        formatTime(timeStr) {
            if (!timeStr) return '';
            // 只保留月日时分,如: 12-27 17:30
            const date = new Date(timeStr);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${month}-${day} ${hour}:${minute}`;
        },

        handlePreviewImage(url) {
            if (!url) return;
            this.previewUrl = url;
            this.showViewer = true;
        },

        closeViewer() {
            this.showViewer = false;
            this.previewUrl = '';
        },

        handlePageChange(current) {
            this.pagination.current = current;
            this.fetchTaskQueue();
        },

        handleSizeChange(size) {
            this.pagination.pageSize = size;
            this.pagination.current = 1;
            this.fetchTaskQueue();
        },

        handleAdvancedSettingsClose(done) {
            // 可以在这里添加关闭前的确认逻辑
            done()
        },

        clearAdvancedSettings() {
            // 重置所有高级设置
            this.formData.aspectRatio = '';
            this.formData.imageWeight = '';
            this.formData.version = '--v 6.1';  // 重置为默认版本 V6.1
            this.formData.seed = '';
            this.formData.quality = '';
            this.formData.stylize = 0;
            this.formData.chaos = 0;
            this.formData.specialOptions = [];
            this.formData.perspective = '';  // 重置视角
            this.formData.shot = '';         // 重置人物镜头
            this.formData.lighting = '';     // 重置灯光

            this.$message.success('已清空所有高级设置');
        },

        getRowClassName({ row }) {
            const classes = [];
            if (row.userId === '🔒') {
                classes.push('locked-row');
                classes.push('hide-expand');
            }
            return classes.join(' ');
        },

        renderImageEditor(h, task) {
            return h('div', {
                class: 'image-editor-container'
            }, [
                h('div', { class: 'image-canvas-container' }, [
                    h('canvas', {
                        ref: 'imageCanvas',
                        style: {
                            maxWidth: '100%',
                            border: '1px solid #ddd'
                        },
                        on: {
                            mousedown: this.handleMouseDown,
                            mousemove: this.handleMouseMove,
                            mouseup: this.handleMouseUp,
                            mouseleave: this.handleMouseUp
                        },
                        hook: {
                            insert: (vnode) => {
                                const el = vnode.elm;
                                const ctx = el.getContext('2d');
                                const img = new Image();
                                img.crossOrigin = 'anonymous';
                                img.onload = () => {
                                    el.width = img.width;
                                    el.height = img.height;
                                    ctx.drawImage(img, 0, 0);
                                    this.originalImage = img; // 保存图片对象以供后续使用
                                };
                                img.src = task.imageUrl;
                            }
                        }
                    })
                ]),
                h('el-input', {
                    props: {
                        type: 'textarea',
                        rows: 3,
                        placeholder: '请输入Prompt',
                        value: this.editPrompt || task.prompt
                    },
                    on: {
                        input: val => this.editPrompt = val
                    }
                })
            ]);
        },

        handleMouseDown(e) {
            const canvas = this.$refs.imageCanvas;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            this.isDrawing = true;
            this.startX = (e.clientX - rect.left) * scaleX;
            this.startY = (e.clientY - rect.top) * scaleY;

            // 初始化选择区域
            this.selectionRect = {
                x: this.startX,
                y: this.startY,
                width: 0,
                height: 0
            };
        },

        handleMouseMove(e) {
            if (!this.isDrawing || !this.originalImage) return;

            const canvas = this.$refs.imageCanvas;
            // const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const currentX = (e.clientX - rect.left) * scaleX;
            const currentY = (e.clientY - rect.top) * scaleY;

            // 更新选择区域
            this.selectionRect = {
                x: Math.min(this.startX, currentX),
                y: Math.min(this.startY, currentY),
                width: Math.abs(currentX - this.startX),
                height: Math.abs(currentY - this.startY)
            };

            // 重绘画布
            this.redrawCanvas();
        },

        handleMouseUp() {
            this.isDrawing = false;
            // 保存最终的选择区域
            this.finalSelectionRect = { ...this.selectionRect };
        },

        redrawCanvas() {
            const canvas = this.$refs.imageCanvas;
            if (!canvas || !this.originalImage) return;

            const ctx = canvas.getContext('2d');
            ctx.save(); // 保存当前状态

            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制原始图片
            ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);

            // 如果有选择区域，绘制选择框
            if (this.selectionRect.width > 0 && this.selectionRect.height > 0) {
                // 绘制选择框边框
                ctx.strokeStyle = '#9254de';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                    this.selectionRect.x,
                    this.selectionRect.y,
                    this.selectionRect.width,
                    this.selectionRect.height
                );
                ctx.setLineDash([]);

                // 绘制控制点
                this.drawControlPoints();
            }

            ctx.restore(); // 恢复之前的状态
        },

        drawControlPoints() {
            const canvas = this.$refs.imageCanvas;
            const ctx = canvas.getContext('2d');
            const pointSize = 6;
            const points = [
                { x: this.selectionRect.x, y: this.selectionRect.y }, // 左上
                { x: this.selectionRect.x + this.selectionRect.width, y: this.selectionRect.y }, // 右上
                { x: this.selectionRect.x, y: this.selectionRect.y + this.selectionRect.height }, // 左下
                { x: this.selectionRect.x + this.selectionRect.width, y: this.selectionRect.y + this.selectionRect.height } // 右下
            ];

            ctx.fillStyle = '#9254de';
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
                ctx.fill();
            });
        },

        resetEditor() {
            this.isDrawing = false;
            this.startX = 0;
            this.startY = 0;
            this.selectionRect = { x: 0, y: 0, width: 0, height: 0 };
            this.finalSelectionRect = null;
            this.editPrompt = '';
            this.maskBase64 = '';
            this.originalImage = null;
            if (this.$refs.imageCanvas) {
                const ctx = this.$refs.imageCanvas.getContext('2d');
                ctx.clearRect(0, 0, this.$refs.imageCanvas.width, this.$refs.imageCanvas.height);
            }
        },

        generateMask(canvas) {
            try {
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = canvas.width;
                maskCanvas.height = canvas.height;
                const ctx = maskCanvas.getContext('2d');

                // 绘制黑色背景
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

                // 如果有选择区域，绘制白色矩形（表示要修改的区域）
                if (this.finalSelectionRect) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(
                        this.finalSelectionRect.x,
                        this.finalSelectionRect.y,
                        this.finalSelectionRect.width,
                        this.finalSelectionRect.height
                    );
                }

                return maskCanvas.toDataURL('image/png').split(',')[1];
            } catch (error) {
                console.error('生成遮罩失败:', error);
                throw new Error('生成遮罩失败，请重试');
            }
        },

        handleEditorClose() {
            this.resetEditor();
            this.showImageEditor = false;
        },

        async handleEditorConfirm() {
            try {
                if (!this.editPrompt.trim()) {
                    this.$message.warning('请输入提示词');
                    return;
                }

                const canvas = this.$refs.imageCanvas;
                const maskBase64 = this.generateMask(canvas);
                this.maskBase64 = maskBase64;

                // 显示加载状态
                this.loading = true;

                // 提交 modal 请求
                const modalResponse = await axios.post(`${config.mjBaseUrl}/mj/submit/modal`, {
                    taskId: this.currentTask.modalTaskId, // 从当前任务中获取 modalTaskId
                    prompt: this.editPrompt,
                    maskBase64: 'data:image/png;base64,' + this.maskBase64
                }, {
                    headers: {
                        'mj-api-secret': this.mjApiSecret
                    }
                });

                if (modalResponse.data && modalResponse.data.code === 1) {
                    this.$message.success('Inpaint 操作已提交');
                    this.showImageEditor = false;
                    this.$emit('editor-closed');

                    // 更新任务队列并启动轮询
                    await this.fetchTaskQueue();
                    this.startQueueTimer();
                } else {
                    this.$message.error(modalResponse.data?.description || '提交失败');
                }
            } catch (error) {
                console.error('Inpaint 提交失败:', error);
                this.$message.error(error.response?.data?.description || '提交失败，请重试');
            } finally {
                this.loading = false;
                this.resetEditor();
            }
        },

        initializeCanvas(imageUrl) {
            const canvas = this.$refs.imageCanvas;
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }

            const img = new Image();

            img.onload = () => {
                // 获取容器的实际尺寸
                const container = canvas.parentElement;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // 计算图片缩放比例，保持原始宽高比
                const scaleX = containerWidth / img.width;
                const scaleY = containerHeight / img.height;
                const scale = Math.min(scaleX, scaleY);

                // 使用原始尺寸，但确保不超过容器
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                // 启用图像平滑
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // 清空画布
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 绘制原始尺寸的图片
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // 保存原始图片
                this.originalImage = img;

                // 通过CSS控制显示尺寸，保持清晰度
                canvas.style.width = `${img.width * scale}px`;
                canvas.style.height = `${img.height * scale}px`;

                // 立即重绘一次以显示遮罩
                this.redrawCanvas();

                console.log('Canvas initialized with dimensions:', {
                    width: canvas.width,
                    height: canvas.height,
                    displayWidth: canvas.style.width,
                    displayHeight: canvas.style.height,
                    scale
                });
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
                this.$message.error('图片加载失败，请重试');
            };

            // 直接加载图片
            img.src = imageUrl;
        },

        // 添加图片处理方法
        handleImageChange(file, fileList) {
            this.imageList = fileList;
        },

        handleImageRemove(file, fileList) {
            this.imageList = fileList;
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        },

        // 将File对象转换为base64
        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    // 直接返回完整的 base64 字符串，包含前缀
                    resolve(reader.result);
                };
                reader.onerror = error => reject(error);
            });
        },

        // 处理文件改变
        async handleFileChange(event) {
            const files = event.target.files;
            for (const file of files) {
                try {
                    const base64 = await this.fileToBase64(file);
                    this.base64Array.push(base64);
                    this.imageList.push({
                        raw: file,
                        url: URL.createObjectURL(file)
                    });
                } catch (error) {
                    console.error('转换图片失败:', error);
                    this.$message.error('图片处理失败');
                }
            }
            event.target.value = '';
        },

        // 处理拖拽
        async handleDrop(event) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            for (const file of files) {
                try {
                    const base64 = await this.fileToBase64(file);
                    this.base64Array.push(base64);
                    this.imageList.push({
                        raw: file,
                        url: URL.createObjectURL(file)
                    });
                } catch (error) {
                    console.error('转换图片失败:', error);
                    this.$message.error('图片处理失败');
                }
            }
        },

        removeImage(index) {
            URL.revokeObjectURL(this.imageList[index].url);
            this.imageList.splice(index, 1);
            this.base64Array.splice(index, 1); // 同时移除对应的base64数据
        },

        beforeDestroy() {
            // 组件销毁前清理所有创建的 URL 对象
            this.imageList.forEach(image => {
                URL.revokeObjectURL(image.url);
            });
            this.base64Array = []; // 清空base64数组
            this.stopCheckingProgress();
            window.removeEventListener('resize', this.checkMobile);
        },

        // 添加应用风格的方法
        applyStyle(style) {
            this.selectedStyle = style.name;
            // 应用风格参数
            this.formData.stylize = style.params.stylize;
            this.formData.quality = style.params.quality;
            this.formData.specialOptions = [...style.params.specialOptions];
            this.formData.aspectRatio = style.params.aspectRatio;
            
            this.$message({
                message: `已应用${style.name}的参数设置`,
                type: 'success'
            });
        },

        // 修改应用风格的方法
        handleStyleChange(styleName) {
            if (!styleName) {
                // 如果清空选择，重置所有参数
                this.formData.stylize = 0;
                this.formData.quality = '';
                this.formData.specialOptions = [];
                this.formData.aspectRatio = '';
                this.$message({
                    message: '已重置风格参数',
                    type: 'info'
                });
                return;
            }

            const style = this.presetStyles.find(s => s.name === styleName);
            if (style) {
                // 应用风格参数
                this.formData.stylize = style.params.stylize;
                this.formData.quality = style.params.quality;
                this.formData.specialOptions = [...style.params.specialOptions];
                this.formData.aspectRatio = style.params.aspectRatio;
                
                this.$message({
                    message: `已应用${style.name}的参数设置`,
                    type: 'success'
                });
            }
        },

        copyPrompt(prompt) {
            const input = document.createElement('input');
            input.value = prompt;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            message.success('提示词已复制');
        },
    },

    mounted() {
        this.checkMobile();
        this.getUserInfo();
    },

    computed: {
        canExpand() {
            return (row) => row.userId !== '🔒';
        }
    }
}
</script>

<style lang="scss" scoped>
/* 过渡动画 */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(1rem);
    opacity: 0;
}

/* 分页组件样式覆盖 */
::v-deep .el-pagination {
    border-top: none !important;
    padding: 1rem !important;
    background-color: transparent !important;
}

/* 调整抽屉组件的层级 */
::v-deep .advanced-settings-drawer {
    .el-drawer__wrapper {
        z-index: 3000 !important;
    }
    
    .el-drawer__container {
        z-index: 3001 !important;
    }

    /* 调整抽屉内部遮罩层 */
    .el-drawer__mask {
        z-index: 2999 !important;
    }
}

/* 调整全局遮罩层 */
::v-deep .v-modal {
    z-index: 2000 !important;
}

/* 确保 Element UI 的确认弹窗显示在最上层 */
::v-deep .el-message-box__wrapper {
    z-index: 3100 !important;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
    ::v-deep .el-card {
        background-color: #1f2937;
        border-color: #374151;
    }
    
    ::v-deep .el-card__header {
        border-color: #374151;
    }
    
    ::v-deep .el-input__inner,
    ::v-deep .el-textarea__inner {
        background-color: #374151;
        border-color: #4b5563;
        color: #f3f4f6;
        
        &::placeholder {
            color: #9ca3af;
        }
    }
    
    ::v-deep .el-button--text {
        color: #d1d5db;
        
        &:hover {
            color: #f3f4f6;
        }
    }
    
    ::v-deep .el-table {
        background-color: #1f2937;
        color: #d1d5db;
        
        .el-table__header th {
            background-color: #111827;
            color: #d1d5db;
        }
        
        .el-table__body td {
            background-color: #1f2937;
            color: #d1d5db;
            border-color: #374151;
        }
        
        .el-table__body tr.el-table__row--striped td {
            background-color: #374151;
        }
    }

    /* 分页组件深色模式样式 */
    ::v-deep .el-pagination {
        background-color: transparent !important;
        
        .el-pagination__total,
        .el-pagination__jump,
        .el-pagination__sizes .el-input__inner,
        .el-select .el-input .el-input__inner {
            color: #d1d5db !important;
            background-color: transparent !important;
        }

        .btn-prev,
        .btn-next,
        .el-pager li {
            background-color: transparent !important;
            color: #d1d5db !important;
            border: 1px solid #4b5563 !important;

            &:hover {
                color: #1A9168 !important;
                border-color: #1A9168 !important;
            }

            &.active {
                background-color: #1A9168 !important;
                color: white !important;
                border-color: #1A9168 !important;
            }
        }

        .el-pagination__sizes {
            .el-input .el-input__inner {
                border: 1px solid #4b5563;
                background-color: transparent !important;
            }
        }

        .el-select-dropdown__item {
            color: #d1d5db;
            background-color: transparent !important;
            
            &.selected {
                color: #1A9168;
            }
            
            &:hover {
                background-color: rgba(55, 65, 81, 0.5) !important;
            }
        }
    }

    /* 高级设置抽屉深色模式样式 */
    ::v-deep .advanced-settings-drawer {
        .el-drawer__header {
            background-color: #1f2937;
            border-bottom: 1px solid #374151;
            margin-bottom: 0;
            padding: 16px 20px;
            
            span {
                color: #f3f4f6;
                font-weight: 500;
            }
            
            .el-drawer__close-btn {
                color: #9ca3af;
                &:hover {
                    color: #f3f4f6;
                }
            }
        }

        .settings-group {
            span {
                color: #f3f4f6;
            }
            
            .el-form-item__label {
                color: #d1d5db !important;
            }
        }

        .el-select {
            .el-input__inner {
                background-color: #374151 !important;
                border-color: #4b5563 !important;
                color: #f3f4f6 !important;
            }
        }

        .el-input-number {
            .el-input__inner {
                background-color: #374151 !important;
                border-color: #4b5563 !important;
                color: #f3f4f6 !important;
            }
            
            .el-input-number__decrease,
            .el-input-number__increase {
                background-color: #1f2937 !important;
                border-color: #4b5563 !important;
                color: #d1d5db !important;
                
                &:hover {
                    color: #f3f4f6 !important;
                }
            }
        }

        .el-slider {
            .el-slider__runway {
                background-color: #4b5563;
            }
            
            .el-slider__bar {
                background-color: #1A9168;
            }
            
            .el-slider__button {
                border-color: #1A9168;
                background-color: #1A9168;
            }
        }

        .el-checkbox {
            .el-checkbox__label {
                color: #d1d5db;
            }
            
            .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #1A9168;
                border-color: #1A9168;
            }
        }

        /* 底部操作栏样式 */
        .flex-shrink-0 {
            background-color: #1f2937 !important;
            border-top: 1px solid #374151 !important;
            
            .el-button {
                &:not(.el-button--primary) {
                    background-color: #374151;
                    border-color: #4b5563;
                    color: #d1d5db;
                    
                    &:hover {
                        background-color: #4b5563;
                        border-color: #6b7280;
                        color: #f3f4f6;
                    }
                }
            }
        }
    }

    /* 下拉菜单深色模式 */
    ::v-deep .el-select-dropdown {
        background-color: #1f2937 !important;
        border-color: #374151 !important;

        .el-select-dropdown__item {
            color: #d1d5db !important;

            &:hover {
                background-color: #374151 !important;
            }

            &.selected {
                background-color: #1A9168 !important;
                color: #ffffff !important;
            }
        }

        .popper__arrow {
            border-bottom-color: #374151 !important;
            
            &::after {
                border-bottom-color: #1f2937 !important;
            }
        }
    }
}

/* 添加自定义滚动条样式 */
.custom-scrollbar {
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 4px;

        &:hover {
            background: #9ca3af;
        }
    }
}

/* 暗色模式下的滚动条 */
@media (prefers-color-scheme: dark) {
    .custom-scrollbar {
        &::-webkit-scrollbar-thumb {
            background: #4b5563;

            &:hover {
                background: #6b7280;
            }
        }
    }
}

/* 自定义表格样式 */
::v-deep .custom-table {
    .el-table__header-wrapper {
        position: sticky;
        top: 0;
        z-index: 2;
        background-color: inherit;
    }

    .el-table__body-wrapper {
        overflow-y: auto;
    }

    /* 表格行hover效果 */
    .el-table__row {
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: rgba(0, 0, 0, 0.02);
        }
    }

    /* 暗色模式下的表格样式 */
    @media (prefers-color-scheme: dark) {
        .el-table__row:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
    }
}
</style>