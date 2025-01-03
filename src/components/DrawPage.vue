<template>
    <el-container class="panel">
        <!-- 使用 el-dialog 实现图片预览 -->
        <el-dialog v-if="showViewer" :visible.sync="showViewer" :append-to-body="true" :modal="true" :show-close="false"
            :close-on-click-modal="true" :close-on-press-escape="true" :fullscreen="true" custom-class="preview-dialog"
            @close="closeViewer">
            <div class="preview-container" @click.self="closeViewer">
                <!-- 关闭按钮 -->
                <div class="preview-close" @click="closeViewer">
                    <i class="el-icon-close"></i>
                </div>
                <el-image :src="previewUrl" fit="contain" @click.stop class="preview-full-image">
                </el-image>
            </div>
        </el-dialog>

        <!-- 在 template 中添加图片编辑器对话框 -->
        <div v-if="showImageEditor" class="custom-dialog-overlay" @click.self="handleEditorClose">
            <div class="custom-dialog">
                <div class="custom-dialog-header">
                    <span>图片编辑</span>
                    <i class="el-icon-close" @click="handleEditorClose"></i>
                </div>
                <div class="custom-dialog-body">
                    <div class="image-editor-container">
                        <div class="image-canvas-container">
                            <canvas ref="imageCanvas" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                                @mouseup="handleMouseUp" @mouseleave="handleMouseUp"></canvas>
                        </div>
                        <el-input type="textarea" :rows="3" placeholder="请输入Prompt" v-model="editPrompt"></el-input>
                    </div>
                </div>
                <div class="custom-dialog-footer">
                    <el-button @click="handleEditorClose">取 消</el-button>
                    <el-button type="primary" @click="handleEditorConfirm">确 定</el-button>
                </div>
            </div>
        </div>

        <el-header>
            <h2>AI绘图</h2>
        </el-header>
        <el-main ref="mainContainer">
            <div class="main-container">
                <!-- 左侧绘图设置 -->
                <div class="left-panel">
                    <el-card class="setting-card">
                        <div slot="header" class="setting-header">
                            <span>绘图设置</span>
                        </div>
                        <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
                            <el-form-item label="提示词" prop="prompt" width="80%" th="100%">
                                <el-input type="textarea" v-model="formData.prompt" :rows="3" placeholder="请输入绘图提示词"
                                    class="prompt-input">
                                </el-input>
                            </el-form-item>
                            <el-form-item label="反向提示词">
                                <el-input v-model="formData.negativePrompt" type="textarea" :rows="2"
                                    placeholder="可选，用于描述不想要的内容"></el-input>
                            </el-form-item>
                            <el-form-item label="模型选择" prop="model">
                                <el-select v-model="formData.model" placeholder="请选择模型"
                                    popper-class="draw-select-dropdown">
                                    <el-option v-for="item in modelOptions" :key="item.value" :label="item.text"
                                        :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>

                            <!-- 添加一个高级设置按钮 -->
                            <el-form-item>
                                <el-button type="text" class="advanced-settings-btn"
                                    @click="showAdvancedSettings = true">
                                    <i class="el-icon-setting"></i>
                                    高级设置
                                </el-button>
                            </el-form-item>

                            <el-form-item class="submit-container">
                                <el-button type="primary" class="submit-btn" :loading="loading || permissionLoading"
                                    @click="submitDrawing" :disabled="!hasPermission">
                                    <i v-if="!loading && !permissionLoading" class="el-icon-picture-outline"></i>
                                    <span>{{ loading ? '绘图中...' : (permissionLoading ? '验证中...' : (hasPermission ?
                                        '开始绘图' : '无权限')) }}</span>
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </div>

                <!-- 右侧任务列表 -->
                <div class="right-panel">
                    <!-- 任务队表格(仅PC端显示) -->
                    <div class="queue-card" v-if="!isMobile">
                        <div class="queue-header">
                            <span>任务队列 ({{ taskQueue.length }})</span>
                            <el-button type="text" icon="el-icon-refresh" :loading="queueLoading"
                                @click="fetchTaskQueue" class="refresh-btn">
                                刷新
                            </el-button>
                        </div>
                        <el-table :data="taskQueue" style="width: 100%" :max-height="500" v-loading="queueLoading"
                            @row-click="handleRowClick" :expand-row-keys="expandedRows" :row-key="row => row.id"
                            :row-class-name="getRowClassName" :expandable="canExpand">
                            <!-- 只对非锁定行显示展开列 -->
                            <el-table-column type="expand">
                                <template v-slot="scope">
                                    <!-- 添加click事件阻止展开 -->
                                    <div class="expanded-row"
                                        @click.native.stop="scope.row.userId === '🔒' && $message.warning('无权查看该任务详情')">
                                        <div v-if="scope.row.userId !== '🔒'" class="expanded-content">
                                            <!-- 预览图片 -->
                                            <div class="expanded-image">
                                                <el-image v-if="scope.row.imageUrl" :src="scope.row.imageUrl"
                                                    fit="contain" @click="handlePreviewImage(scope.row.imageUrl)"
                                                    class="preview-image">
                                                    <div slot="placeholder" class="image-slot">
                                                        <i class="el-icon-loading"></i>
                                                    </div>
                                                    <div slot="error" class="image-slot">
                                                        <i class="el-icon-picture-outline"></i>
                                                    </div>
                                                </el-image>
                                            </div>
                                            <!-- 提示词 -->
                                            <div class="expanded-prompt">
                                                <div class="label">提示词</div>
                                                <div class="content">{{ scope.row.prompt }}</div>
                                            </div>
                                            <!-- 按钮组 -->
                                            <div class="expanded-actions">
                                                <!-- 放大按钮组 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('upsample'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('upsample'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn upscale"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        <i class="el-icon-zoom-in"></i>
                                                        {{ btn.label }}
                                                    </el-button>
                                                </template>

                                                <!-- 变体按钮组 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('variation'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('variation'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn variation"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        <i class="el-icon-refresh"></i>
                                                        {{ btn.label }}
                                                    </el-button>
                                                </template>


                                                <!-- 在展开的操作区域中添加 Inpaint 按钮组 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('Inpaint'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('Inpaint'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn inpaint"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        <i class="el-icon-edit"></i>
                                                        {{ btn.label }}
                                                    </el-button>
                                                </template>

                                                <!-- 缩放按钮组 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('Outpaint') || btn.customId.includes('CustomZoom'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('Outpaint') || b.customId.includes('CustomZoom'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn zoom"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        <i class="el-icon-zoom-out"></i>
                                                        {{ btn.label }}
                                                    </el-button>
                                                </template>

                                                <!-- 平移按钮组 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('pan'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('pan'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn pan"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        {{ btn.emoji }}
                                                    </el-button>
                                                </template>

                                                <!-- 收藏按钮 -->
                                                <template
                                                    v-if="scope.row.buttons && scope.row.buttons.some(btn => btn.customId.includes('BOOKMARK'))">
                                                    <el-button
                                                        v-for="btn in scope.row.buttons.filter(b => b.customId.includes('BOOKMARK'))"
                                                        :key="btn.customId" type="text" size="small"
                                                        class="action-btn bookmark"
                                                        @click.stop="handleButtonAction(btn, scope.row)">
                                                        {{ btn.emoji }}
                                                    </el-button>
                                                </template>

                                                <!-- 下载按钮 -->
                                                <el-button v-if="scope.row.imageUrl" type="text" size="small"
                                                    class="action-btn download"
                                                    @click.stop="downloadImage(scope.row.imageUrl)">
                                                    <i class="el-icon-download"></i>
                                                    下载
                                                </el-button>

                                                <!-- 取消按钮 -->
                                                <el-button v-if="canCancel(scope.row.status)" type="text" size="small"
                                                    class="action-btn cancel" @click.stop="handleCancel(scope.row)">
                                                    <i class="el-icon-close"></i>
                                                    取消
                                                </el-button>

                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- <el-table-column prop="id" label="任务ID" width="100" align="center" show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <el-tooltip content="点击复制" placement="top" :open-delay="500">
                                        <span class="task-id" @click.stop="copyTaskId(scope.row.id)">{{ scope.row.id
                                            }}</span>
                                    </el-tooltip>
                                </template>
                            </el-table-column> -->
                            <el-table-column prop="prompt" label="提示词" width="180" align="left"
                                show-overflow-tooltip></el-table-column>
                            <el-table-column prop="action" label="类型" width="80" align="center">
                                <template slot-scope="scope">
                                    <el-tag size="small" type="info">
                                        {{ getActionText(scope.row.action) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态" width="80" align="center">
                                <template slot-scope="scope">
                                    <el-tag :type="getStatusType(scope.row.status)">
                                        {{ getStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="提交时间" width="160" align="center">
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
                        <!-- 分页 -->
                        <div class="pagination-container">
                            <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange"
                                :current-page="pagination.current" :page-sizes="[8, 16, 24]"
                                :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper"
                                :total="pagination.total">
                            </el-pagination>
                        </div>
                    </div>

                    <!-- 移动端任务队列 -->
                    <div class="mobile-queue" v-else>
                        <!-- 任务队列头部 -->
                        <div class="mobile-queue-header">
                            <div class="header-left">
                                <span class="queue-title">任务队列</span>
                                <el-tag size="small" type="info">{{ taskQueue.length }}</el-tag>
                            </div>
                            <el-button type="text" icon="el-icon-refresh" :loading="queueLoading"
                                @click="fetchTaskQueue">
                                刷新
                            </el-button>
                        </div>

                        <!-- 任务列表 -->
                        <div class="mobile-task-list" v-loading="queueLoading">
                            <div v-for="task in taskQueue" :key="task.id" class="mobile-task-card" :class="{
                                'task-expanded': expandedRows.includes(task.id),
                                'task-success': task.status === 'SUCCESS',
                                'task-failed': task.status === 'FAILED',
                                'task-locked': task.userId === '🔒'
                            }" @click="handleRowClick(task)">

                                <!-- 任务卡片主体 -->
                                <div class="task-main">
                                    <!-- 状态 -->
                                    <div class="task-status-bar">
                                        <div class="status-tags">
                                            <el-tag size="mini" :type="getStatusType(task.status)">
                                                {{ getStatusText(task.status) }}
                                            </el-tag>
                                            <el-tag size="mini" type="info">{{ getActionText(task.action) }}</el-tag>
                                        </div>
                                        <span class="task-time">{{ formatTime(task.displays.submitTime) }}</span>
                                    </div>

                                    <!-- 任务内容 -->
                                    <div class="task-content">
                                        <div class="task-info">
                                            <div class="task-prompt">{{ task.prompt }}</div>
                                            <el-progress v-if="task.status !== 'SUCCESS'"
                                                :percentage="getProgressPercentage(task.progress)"
                                                :status="getProgressStatus(task.status)" :stroke-width="4">
                                            </el-progress>
                                        </div>
                                        <div class="task-preview"
                                            v-if="task.imageUrl && expandedRows.includes(task.id)">
                                            <el-image :src="task.imageUrl" fit="cover"
                                                @click.stop="handlePreviewImage(task.imageUrl)"
                                                class="preview-thumbnail">
                                                <div slot="placeholder" class="image-slot">
                                                    <i class="el-icon-loading"></i>
                                                </div>
                                            </el-image>
                                        </div>
                                    </div>
                                </div>

                                <!-- 展开的操作区域 -->
                                <transition name="slide-fade">
                                    <div class="task-actions" v-show="expandedRows.includes(task.id)">
                                        <!-- 放大按钮组 -->
                                        <div class="action-group"
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('upsample'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('upsample'))"
                                                    :key="btn.customId" size="mini" :type="'primary'" plain
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    {{ btn.label }}
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 变体按钮组 -->
                                        <div class="action-group"
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('variation'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('variation'))"
                                                    :key="btn.customId" size="mini" type="info" plain
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    {{ btn.label }}
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 缩放按钮组 -->
                                        <div class="action-group"
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('Outpaint') || btn.customId.includes('CustomZoom'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('Outpaint') || b.customId.includes('CustomZoom'))"
                                                    :key="btn.customId" size="mini" type="warning" plain
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    {{ btn.label }}
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 平移按钮组 -->
                                        <div class="action-group"
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('pan'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('pan'))"
                                                    :key="btn.customId" size="mini" type="success" plain
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    {{ btn.emoji }}
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 收藏按钮 -->
                                        <div class="action-group"
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('BOOKMARK'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('BOOKMARK'))"
                                                    :key="btn.customId" size="mini" type="danger" plain
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    {{ btn.emoji }}
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 下载按钮 -->
                                        <div class="action-group">
                                            <el-button-group>
                                                <el-button v-if="task.imageUrl" size="mini" type="success" plain
                                                    @click.stop="downloadImage(task.imageUrl)">
                                                    <i class="el-icon-download"></i>
                                                </el-button>
                                                <el-button v-if="canCancel(task.status)" size="mini" type="danger" plain
                                                    @click.stop="handleCancel(task)">
                                                    <i class="el-icon-close"></i>
                                                </el-button>
                                            </el-button-group>
                                        </div>

                                        <!-- 在展开的操作区域中添加 Inpaint 按钮组 -->
                                        <template
                                            v-if="task.buttons && task.buttons.some(btn => btn.customId.includes('Inpaint'))">
                                            <el-button-group>
                                                <el-button
                                                    v-for="btn in task.buttons.filter(b => b.customId.includes('Inpaint'))"
                                                    :key="btn.customId" type="text" size="small"
                                                    class="action-btn inpaint"
                                                    @click.stop="handleButtonAction(btn, task)">
                                                    <i class="el-icon-edit"></i>
                                                    {{ btn.label }}
                                                </el-button>
                                            </el-button-group>
                                        </template>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        <!-- 移动端分页 -->
                        <div class="mobile-pagination">
                            <el-pagination @current-change="handlePageChange" :current-page="pagination.current"
                                :page-size="pagination.pageSize" layout="prev, pager, next" :total="pagination.total">
                            </el-pagination>
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
            <el-drawer title="高级设置" :visible.sync="showAdvancedSettings" direction="rtl" size="400px"
                :before-close="handleAdvancedSettingsClose" custom-class="advanced-settings-drawer">
                <div class="advanced-settings-form">
                    <div class="form-content">
                        <!-- 基础设置组 -->
                        <div class="settings-group">
                            <div class="group-title">
                                <i class="el-icon-setting"></i>
                                <span>基础设置</span>
                            </div>
                            <el-form :model="formData" label-position="top" label-width="auto">
                                <el-form-item label="宽高比例">
                                    <el-select v-model="formData.aspectRatio" placeholder="选择宽高比例">
                                        <el-option label="默认" value=""></el-option>
                                        <el-option label="16:9" value="--ar 16:9"></el-option>
                                        <el-option label="4:3" value="--ar 4:3"></el-option>
                                        <el-option label="1:1" value="--ar 1:1"></el-option>
                                        <el-option label="9:16" value="--ar 9:16"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="文本权重">
                                    <el-select v-model="formData.imageWeight" placeholder="设置文本权重">
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
                            <div class="group-title">
                                <i class="el-icon-magic-stick"></i>
                                <span>高级设置</span>
                            </div>
                            <el-form :model="formData" label-position="top" label-width="auto">
                                <el-form-item label="随机种子">
                                    <el-input-number v-model="formData.seed" :min="0" :max="4294967295"
                                        placeholder="输入随机种子">
                                    </el-input-number>
                                </el-form-item>
                                <el-form-item label="渲染质量">
                                    <el-select v-model="formData.quality" placeholder="选择渲染质量">
                                        <el-option label="默认(1.0)" value=""></el-option>
                                        <el-option label="0.25" value="--quality 0.25"></el-option>
                                        <el-option label="0.5" value="--quality 0.5"></el-option>
                                        <el-option label="2.0" value="--quality 2"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="风格强度">
                                    <el-slider v-model="formData.stylize" :min="0" :max="1000" :step="10">
                                    </el-slider>
                                </el-form-item>
                                <el-form-item label="多样性">
                                    <el-slider v-model="formData.chaos" :min="0" :max="100">
                                    </el-slider>
                                </el-form-item>
                            </el-form>
                        </div>

                        <!-- 特殊选项组 -->
                        <div class="settings-group">
                            <div class="group-title">
                                <i class="el-icon-star-off"></i>
                                <span>特殊选项</span>
                            </div>
                            <el-form :model="formData" label-position="top" label-width="auto">
                                <el-form-item>
                                    <el-checkbox-group v-model="formData.specialOptions">
                                        <el-checkbox label="--sameseed">使用相同种子</el-checkbox>
                                        <el-checkbox label="--upbeta">Beta放大工具</el-checkbox>
                                        <el-checkbox label="--uplight">轻量化处理</el-checkbox>
                                        <el-checkbox label="--niji">动漫风格</el-checkbox>
                                        <el-checkbox label="--hd">高清模式</el-checkbox>
                                        <el-checkbox label="--tile">平铺模式</el-checkbox>
                                    </el-checkbox-group>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>

                    <!-- 底部操作栏 -->
                    <div class="form-footer">
                        <div class="footer-left">
                            <span>设置将在下次绘图时生效</span>
                        </div>
                        <div class="footer-right">
                            <el-button size="small" @click="clearAdvancedSettings">
                                重置设置
                            </el-button>
                            <el-button size="small" type="primary" @click="showAdvancedSettings = false">
                                确定
                            </el-button>
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
                negativePrompt: '',
                model: 'MJ_V6',
                speed: 'FAST',
                aspectRatio: '',
                imageWeight: '',
                seed: '',
                quality: '',
                stylize: 0,
                chaos: 0,
                specialOptions: []
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
                pageSize: 8,
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
                // 添加权限检查
                if (!this.hasPermission) {
                    message.error('您没有AI绘图的权限');
                    return;
                }

                const valid = await this.$refs.form.validate()
                if (!valid) return

                this.loading = true
                let fullPrompt = this.formData.prompt;

                // 添加各种参数
                if (this.formData.aspectRatio) fullPrompt += ' ' + this.formData.aspectRatio;
                if (this.formData.imageWeight) fullPrompt += ' ' + this.formData.imageWeight;
                if (this.formData.seed) fullPrompt += ` --seed ${this.formData.seed}`;
                if (this.formData.quality) fullPrompt += ' ' + this.formData.quality;
                if (this.formData.stylize > 0) fullPrompt += ` --stylize ${this.formData.stylize}`;
                if (this.formData.chaos > 0) fullPrompt += ` --chaos ${this.formData.chaos}`;

                // 添加特殊选项
                this.formData.specialOptions.forEach(option => {
                    fullPrompt += ' ' + option;
                });

                const response = await axios.post(`${config.mjBaseUrl}/mj/submit/imagine`, {
                    prompt: fullPrompt,
                    negativePrompt: this.formData.negativePrompt || '',
                    model: this.formData.model,
                    notifyHook: '',
                    state: ''
                }, {
                    headers: {
                        'mj-api-secret': this.mjApiSecret
                    }
                })

                if (response.data && response.data.code === 1) {
                    this.taskId = response.data.result
                    message.success(response.data.description || '提交成功，正在生成...')
                    await this.fetchTaskQueue()
                    this.startQueueTimer()
                } else {
                    message.error(response.data?.description || '提交失败')
                }
            } catch (error) {
                message.handleError(error)
            } finally {
                this.loading = false
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
                    state: ''
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

            if (this.expandedRows.includes(row.id)) {
                this.expandedRows = [];
            } else {
                this.expandedRows = [row.id];
            }
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
                            this.editPrompt = task.prompt;
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

                // ... 其他代码 ...
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
            this.formData.seed = '';
            this.formData.quality = '';
            this.formData.stylize = 0;
            this.formData.chaos = 0;
            this.formData.specialOptions = [];

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

        handleEditorClose(done) {
            this.$confirm('确认关闭？未保存的更改将会丢失', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.resetEditor();
                this.showImageEditor = false;  // 直接关闭弹窗
                done();
            }).catch(() => { });
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
                const containerWidth = 400;  // 容器宽度
                const containerHeight = 300; // 容器高度

                // 计算图片缩放比例
                const scaleX = containerWidth / img.width;
                const scaleY = containerHeight / img.height;
                const scale = Math.min(scaleX, scaleY);

                // 计算缩放后的尺寸
                const width = img.width * scale;
                const height = img.height * scale;

                // 设置画布尺寸
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // 清空画布
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 绘制缩放后的图片
                ctx.drawImage(img, 0, 0, width, height);

                // 保存原始图片
                this.originalImage = img;

                // 立即重绘一次以显示遮罩
                this.redrawCanvas();

                console.log('Canvas initialized with dimensions:', {
                    width,
                    height,
                    scale,
                    originalWidth: img.width,
                    originalHeight: img.height
                });
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
                this.$message.error('图片加载失败，请重试');
            };

            // 直接加载图片
            img.src = imageUrl;
        },
    },

    mounted() {
        this.checkMobile()
        window.addEventListener('resize', this.checkMobile)
        this.getUserInfo()
    },

    beforeDestroy() {
        this.stopCheckingProgress()
        window.removeEventListener('resize', this.checkMobile)
    },

    computed: {
        canExpand() {
            return (row) => row.userId !== '🔒';
        }
    }
}
</script>

<style scoped>
/* 基础布局 */
.panel {
    background-color: #ffffff;
    border-radius: 16px;
    margin: 1% auto;  /* 修改为auto以实现居中 */
    min-height: calc(100vh - 30px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    max-width: 2000px;  /* 添加最大宽度限制 */
    width: 95%;  /* 添加宽度百分比 */
}

/* 主容器样式 */
.main-container {
    display: flex;
    gap: clamp(20px, 2vw, 40px);  /* 使用clamp实现响应式间距 */
    margin: clamp(20px, 2vw, 40px);  /* 使用clamp实现响应式边距 */
    justify-content: center;  /* 居中对齐 */
    max-width: 100%;
}

/* 左侧面板 */
.left-panel {
    width: clamp(360px, 25vw, 480px);  /* 使用clamp实现响应式宽度 */
    flex-shrink: 0;
}

/* 右侧面板 */
.right-panel {
    flex: 1;
    min-width: 0;
    max-width: clamp(1200px, 70vw, 1600px);  /* 增加最大宽度 */
}

/* 设置卡片和任务队列的共同样式 */
.setting-card,
.queue-card {
    border-radius: clamp(12px, 1vw, 16px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

/* 设置卡片 */
.setting-card {
    margin: 28px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.setting-card:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.setting-header {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.setting-header span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

/* 表项样式 */
.setting-card :deep(.el-form-item) {
    margin-bottom: 22px;
    display: flex;
    flex-direction: column;
}

.setting-card :deep(.el-form-item__label) {
    text-align: left;
    padding: 0 0 8px 0 !important;
    width: auto !important;
    line-height: 1.4;
    font-weight: 500;
    color: #606266;
}

.setting-card :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100%;
}

/* 输入和选择框统一样式 */
.prompt-input,
.setting-card :deep(.el-select) {
    width: 100%;
}

.setting-card :deep(.el-input__inner),
.setting-card :deep(.el-textarea__inner) {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.setting-card :deep(.el-textarea__inner) {
    resize: none;
    min-height: 80px;
    line-height: 1.6;
    padding: 12px;
}

/* 提交按钮容器 */
.submit-container {
    margin-bottom: 0 !important;
    display: flex;
    justify-content: center;
    width: 100%;
}

.submit-container :deep(.el-form-item__content) {
    display: flex;
    justify-content: center;
    margin: 0 !important;
}

.submit-btn {
    min-width: 140px;
    height: 40px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    margin: 0 auto;
    /* 添加水平居中 */
    background-color: #3F896E !important;
    border-color: #3F896E !important;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    background-color: #4B9E82 !important;
    border-color: #4B9E82 !important;
}

.submit-btn:active {
    background-color: #367B63 !important;
    border-color: #367B63 !important;
}

/* 禁用状态 */
.submit-btn.is-disabled {
    background-color: #909399 !important;
    border-color: #909399 !important;
}

/* loading状态 */
.submit-btn.is-loading {
    background-color: #4B9E82 !important;
    border-color: #4B9E82 !important;
}

/* 任务队列卡片 */
.queue-card {
    padding: 16px;
    background: #fff;
    border: 1px solid #EBEEF5;
    width: 100%;  /* 确保容器占满可用宽度 */
    box-sizing: border-box;  /* 确保padding不会增加总宽度 */
}

/* 确保表格占满容器宽度 */
.queue-card :deep(.el-table) {
    width: 100% !important;
    box-sizing: border-box;
}

/* 确保表格内容区域占满容器宽度 */
.queue-card :deep(.el-table__body),
.queue-card :deep(.el-table__header) {
    width: 100% !important;
    table-layout: fixed !important;  /* 使用固定表格布局 */
}

/* 确保表格包装器占满容器宽度 */
.queue-card :deep(.el-table__body-wrapper),
.queue-card :deep(.el-table__header-wrapper) {
    width: 100% !important;
}

/* 调整列宽比例 */
.queue-card :deep(.el-table .prompt-column) {
    min-width: 120px !important;
    width: 35% !important;
}

.queue-card :deep(.el-table .type-column) {
    min-width: 60px !important;
    width: 10% !important;
}

.queue-card :deep(.el-table .status-column) {
    min-width: 60px !important;
    width: 10% !important;
}

.queue-card :deep(.el-table .time-column) {
    min-width: 120px !important;
    width: 15% !important;
}

.queue-card :deep(.el-table .progress-column) {
    min-width: 180px !important;
    width: 30% !important;
}

.queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;
}

.queue-header span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.refresh-btn {
    padding: 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.refresh-btn:hover {
    color: #409EFF;
    background-color: #ecf5ff;
}

@media (prefers-color-scheme: dark) {
    .queue-header span {
        color: #E5EAF3;
    }

    .refresh-btn:hover {
        background-color: rgba(64, 158, 255, 0.1);
    }
}

/* PC端结果展示 */
.result-card {
    margin-bottom: clamp(28px, 2vw, 40px);
}

.result-col {
    margin-bottom: clamp(20px, 1.5vw, 30px);
}

.image-card {
    transition: all 0.3s ease;
}

.image-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.result-image {
    width: 100%;
    height: clamp(300px, 25vw, 400px);  /* 响应式图片高度 */
    border-radius: clamp(8px, 0.5vw, 12px);
}

.image-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 12px;
    padding: 0 10px;
}

.prompt-text {
    margin-top: 10px;
    font-size: 14px;
    color: #606266;
    padding: 0 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
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

.mobile-image {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
}

.prompt-badge {
    background: linear-gradient(135deg, #ecf5ff 0%, #e6f1ff 100%);
    color: #409eff;
    padding: 10px 18px;
    border-radius: 28px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    word-break: break-all;
}

.mobile-card-divider {
    height: 1px;
    background: linear-gradient(90deg, #ebeef5 0%, rgba(235, 238, 245, 0.4) 100%);
    margin: 24px 0;
}

.mobile-card-actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.action-row {
    display: flex;
    gap: 14px;
    justify-content: space-between;
}

.action-row .el-button {
    flex: 1;
    height: 40px;
}

/* 片位 */
.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 30px;
}

/* 响应 */
@media screen and (max-width: 768px) {
    .panel {
        margin: 12px;
    }

    .submit-btn {
        width: 100%;
    }

    .queue-card {
        margin-top: 24px;
    }

    .setting-card {
        margin: 16px;
        border-radius: 16px;
    }

    .setting-card :deep(.el-form-item__label) {
        float: none;
        display: block;
        text-align: left;
        padding-bottom: 8px;
    }

    .setting-card :deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    .submit-btn {
        width: 100%;
    }

    .setting-card :deep(.el-form-item) {
        margin-bottom: 16px;
    }

    .setting-card :deep(.el-form-item__label) {
        padding-bottom: 6px;
    }

    .main-container {
        flex-direction: column;
        margin: 12px;
        gap: 12px;
    }

    .left-panel {
        width: 100%;
    }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
    .panel {
        background: rgba(30, 30, 30, 0.95);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .mobile-card {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .prompt-badge {
        background: linear-gradient(145deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
        color: #7eb6ff;
    }

    .mobile-card-divider {
        background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.05) 20%,
                rgba(255, 255, 255, 0.05) 80%,
                transparent);
    }

    .image-slot {
        background: rgba(40, 40, 40, 0.95);
        color: #909399;
    }

    .prompt-text {
        color: #909399;
    }

    .queue-card {
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .queue-card {
        border-color: rgba(255, 255, 255, 0.05);
        background: rgba(40, 40, 40, 0.95);
    }

    .queue-card :deep(.el-collapse-item__header) {
        background: rgba(40, 40, 40, 0.95);
        border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .queue-card :deep(.el-collapse-item__wrap) {
        background: rgba(40, 40, 40, 0.95);
        border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .setting-card {
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .setting-header span {
        color: #E5EAF3;
    }

    .setting-card :deep(.el-form-item__label) {
        color: #A3ADB8;
    }

    .setting-card :deep(.el-input__inner),
    .setting-card :deep(.el-textarea__inner) {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
        color: #E5EAF3;
    }

    .setting-card :deep(.el-input__inner:focus),
    .setting-card :deep(.el-textarea__inner:focus) {
        border-color: #409EFF;
    }

    .setting-card :deep(.el-select .el-input.is-focus .el-input__inner) {
        border-color: #409EFF;
    }

    .setting-card :deep(.el-select .el-input__inner) {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
        color: #E5EAF3;
    }

    .setting-card :deep(.el-select .el-input.is-focus .el-input__inner) {
        border-color: #409EFF;
    }
}

/* 任务列表操作按钮样式 */
.queue-card :deep(.el-button-group) {
    display: flex;
    gap: 20px;
    justify-content: center;
    padding: 0;
}

.queue-card :deep(.el-button-group .el-button) {
    border: none;
    padding: 0;
    margin: 0;
    font-size: 13px;
    color: #409EFF;
    min-width: 32px;
    text-align: center;
    transition: all 0.3s ease;
}

.queue-card :deep(.el-button-group .el-button:hover) {
    color: #66b1ff;
    transform: translateY(-1px);
}

/* 进列样式 */
.el-table-column--progress {
    padding-right: 20px;
}

/* 移动端任务列样式 */
.mobile-queue {
    padding: 12px;
}

.mobile-queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.queue-title {
    font-size: 16px;
    font-weight: 500;
}

/* 任务卡片样式 */
.mobile-task-card {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #EBEEF5;
    transition: all 0.3s ease;
}

.task-expanded {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    border-color: #409EFF;
}

.task-main {
    padding: 12px;
}

/* 状态栏样式 */
.task-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-tags {
    display: flex;
    gap: 4px;
}

.task-time {
    font-size: 12px;
    color: #909399;
}

/* 任务内容样式 */
.task-content {
    display: flex;
    gap: 12px;
    margin-top: 12px;
}

.task-info {
    flex: 1;
    min-width: 0;
}

.task-prompt {
    font-size: 14px;
    color: #303133;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.task-preview {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.preview-thumbnail {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    background-color: #f5f7fa;
}

/* 操作区域样式 */
.task-actions {
    padding: 8px;
    border-top: 1px solid #EBEEF5;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-group {
    display: flex;
    justify-content: center;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

/* 移动端深色模式适配 */
@media (prefers-color-scheme: dark) {
    .mobile-task-card {
        background: rgba(40, 40, 40, 0.95);
        border-color: rgba(255, 255, 255, 0.05);
    }

    .task-prompt {
        color: #E5EAF3;
    }

    .task-actions {
        border-top-color: rgba(255, 255, 255, 0.05);
    }

    .preview-thumbnail {
        background-color: rgba(40, 40, 40, 0.95);
    }
}

/* PC端展开行样式 */
.expanded-row {
    padding: 20px;
    background: #f8f9fb;
    border-radius: 8px;
    margin: 0 20px;
}

.expanded-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 预览图片样式 */
.expanded-image {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    height: 160px;
}

.preview-image {
    max-width: 160px;
    max-height: 160px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    cursor: default;
    user-select: none;
    -webkit-user-drag: none;
}

/* 提示词样式 */
.expanded-prompt {
    margin-bottom: 12px;
}

.expanded-prompt .label {
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
}

.expanded-prompt .content {
    color: #303133;
    line-height: 1.4;
    word-break: break-all;
    background: #fff;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ebeef5;
}

/* 按钮组样式 */
.expanded-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    justify-content: center;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.action-btn {
    min-width: 45px !important;
    padding: 4px 12px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    border-radius: 4px !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    height: 32px !important;
    border: none !important;
    font-size: 13px !important;
    white-space: nowrap !important;
}

.action-btn i {
    margin-right: 2px !important;
    font-size: 16px !important;
}

/* 按钮颜色样式 */
.expanded-actions .upscale {
    color: #E6A23C !important;
    background-color: rgba(230, 162, 60, 0.1) !important;
    border: 1px solid rgba(230, 162, 60, 0.2) !important;
}

.expanded-actions .upscale:hover {
    color: #ebb563 !important;
    background-color: rgba(230, 162, 60, 0.2) !important;
}

.expanded-actions .variation {
    color: #909399 !important;
    background-color: rgba(144, 147, 153, 0.1) !important;
    border: 1px solid rgba(144, 147, 153, 0.2) !important;
}

.expanded-actions .variation:hover {
    color: #a6a9ad !important;
    background-color: rgba(144, 147, 153, 0.2) !important;
}

.expanded-actions .zoom {
    color: #409EFF !important;
    background-color: rgba(64, 158, 255, 0.1) !important;
    border: 1px solid rgba(64, 158, 255, 0.2) !important;
}

.expanded-actions .zoom:hover {
    color: #66b1ff !important;
    background-color: rgba(64, 158, 255, 0.2) !important;
}

.expanded-actions .pan {
    color: #67C23A !important;
    background-color: rgba(103, 194, 58, 0.1) !important;
    border: 1px solid rgba(103, 194, 58, 0.2) !important;
}

.expanded-actions .pan:hover {
    color: #85ce61 !important;
    background-color: rgba(103, 194, 58, 0.2) !important;
}

.expanded-actions .bookmark {
    color: #F56C6C !important;
    background-color: rgba(245, 108, 108, 0.1) !important;
    border: 1px solid rgba(245, 108, 108, 0.2) !important;
}

.expanded-actions .bookmark:hover {
    color: #f78989 !important;
    background-color: rgba(245, 108, 108, 0.2) !important;
}

/* 移动端按钮样式保持不变 */
.mobile-action-btn {
    min-width: 40px !important;
    height: 24px !important;
    padding: 0 8px !important;
    font-size: 12px !important;
    border-radius: 12px !important;
}

/* 隐藏滚动条但保持功能 */
.expanded-actions::-webkit-scrollbar {
    display: none;
}

.expanded-actions {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* 返回顶部按钮样式 */
.mobile-backtop {
    background-color: #3D866B !important;
    box-shadow: 0 3px 8px rgba(61, 134, 107, 0.3) !important;
    border: none !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s ease !important;
    z-index: 2000 !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
}

.mobile-backtop i {
    color: #fff !important;
    font-size: 16px !important;
}

.mobile-backtop:hover {
    background-color: #4a9d80 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(61, 134, 107, 0.4) !important;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    .mobile-backtop {
        background-color: rgba(61, 134, 107, 0.95) !important;
        box-shadow: 0 3px 8px rgba(61, 134, 107, 0.25) !important;
    }

    .mobile-backtop:hover {
        background-color: rgba(74, 157, 128, 0.95) !important;
        box-shadow: 0 4px 12px rgba(61, 134, 107, 0.35) !important;
    }
}

/* 确保主容器可以滚动 */
.el-main {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
}

/* 图片预览相关样式 */
.preview-image {
    cursor: pointer !important;
    transition: transform 0.3s ease !important;
}

.preview-image:hover {
    transform: scale(1.02) !important;
}

.preview-thumbnail {
    cursor: pointer !important;
    transition: transform 0.3s ease !important;
}

.preview-thumbnail:hover {
    transform: scale(1.05) !important;
}

/* 图片预览对话框样式 */
.preview-dialog {
    background: rgba(0, 0, 0, 0.9) !important;
    margin: 0 !important;
    width: 100% !important;
    height: 100% !important;
}

:deep(.preview-dialog .el-dialog__header) {
    display: none;
}

:deep(.preview-dialog .el-dialog__body) {
    padding: 0;
    height: 100vh !important;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.9);
    overflow: hidden;
    margin: 0 !important;
}

.preview-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: zoom-out;
    padding: 10px;
}

.preview-close {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2002;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-close i {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
}

.preview-close:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: rotate(90deg);
    border-color: rgba(255, 255, 255, 0.2);
}

.preview-full-image {
    width: 400px;
    height: 400px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    cursor: default;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
    .preview-full-image {
        width: 300px;
        height: 300px;
    }

    .preview-container {
        padding: 10px;
    }
}

/* 修复 el-dialog 的全屏样式 */
:deep(.preview-dialog.el-dialog) {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
}

/* 确保内容区域占满整个高度 */
:deep(.preview-dialog .el-dialog__wrapper) {
    height: 100vh !important;
    overflow: hidden !important;
}

/* 分页样式 */
.pagination-container {
    padding: 15px;
    display: flex;
    justify-content: flex-end;
}

.mobile-pagination {
    padding: 10px;
    display: flex;
    justify-content: center;
}

/* 高级设置样式 */
.el-collapse {
    margin-bottom: 20px;
    border: none;
}

.el-collapse-item {
    background: #f8f9fb;
    border-radius: 8px;
    margin-bottom: 10px;
}

:deep(.el-collapse-item__header) {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    background: transparent;
    border-bottom: none;
    padding: 0 15px;
}

:deep(.el-collapse-item__content) {
    padding: 10px 15px;
}

/* 滑块样式 */
:deep(.el-slider) {
    width: 100%;
}

/* 复选框组样式 */
.el-checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
}

/* 高级设置按钮样式 */
.advanced-settings-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    padding: 10px;
    color: #3F896E;
    font-size: 14px;
    border: 1px dashed #3F896E;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.advanced-settings-btn:hover {
    background-color: rgba(63, 137, 110, 0.1);
}

.advanced-settings-btn i {
    font-size: 16px;
}

/* 高级设置抽屉样式 */
:deep(.advanced-settings-drawer) {
    .el-drawer__header {
        margin: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #EBEEF5;

        .el-drawer__title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2329;
        }

        .el-drawer__close-btn {
            font-size: 20px;
            color: #909399;
        }
    }

    .el-drawer__body {
        padding: 0;
        height: calc(100% - 61px);
        overflow: hidden;
    }
}

/* 高级设置表单容器 */
.advanced-settings-form {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* 表单内容区 */
.form-content {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #E4E7ED;
        border-radius: 2px;
    }
}

/* 表单项分组 */
.settings-group {
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 0;
    }
}

.group-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    i {
        margin-right: 8px;
        font-size: 16px;
        color: #3F896E;
    }
}

/* 表单项样式 */
.advanced-settings-form :deep(.el-form-item) {
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
}

.advanced-settings-form :deep(.el-form-item__label) {
    font-size: 13px;
    color: #606266;
    line-height: 1.4;
    padding-bottom: 8px;
    text-align: left !important;
    /* 强制标签左对齐 */
    padding-right: 0;
    /* 移除右侧padding */
    float: none;
    /* 取消浮动 */
    display: block;
    /* 让标签独占一行 */
}

.advanced-settings-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    /* 移除左侧margin */
    text-align: left;
    /* 内容左对齐 */
}

/* 修改表单布局 */
.advanced-settings-form :deep(.el-form) {
    .el-form-item {
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }
}

/* Select 下拉框样式 */
.advanced-settings-form :deep(.el-select) {
    width: 100%;
    text-align: left;
}

/* 数字输入框样式 */
.advanced-settings-form :deep(.el-input-number) {
    width: 100%;
    text-align: left;
}

/* 滑块组件样式 */
.advanced-settings-form :deep(.el-slider) {
    margin: 8px 0;
    width: 100%;
}

.advanced-settings-form :deep(.el-slider__runway) {
    height: 4px;
    background-color: #E4E7ED;
}

.advanced-settings-form :deep(.el-slider__bar) {
    height: 4px;
    background-color: #3F896E;
}

.advanced-settings-form :deep(.el-slider__button) {
    width: 14px;
    height: 14px;
    border: 2px solid #3F896E;

    &:hover {
        transform: scale(1.2);
    }
}

/* 复选框组样式 */
.advanced-settings-form :deep(.el-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    text-align: left;
}

.advanced-settings-form :deep(.el-checkbox) {
    margin: 0;

    .el-checkbox__label {
        font-size: 13px;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #3F896E;
        border-color: #3F896E;
    }
}

/* 底部操作栏 */
.form-footer {
    padding: 16px 24px;
    border-top: 1px solid #EBEEF5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
}

.footer-left {
    color: #909399;
    font-size: 13px;
}

.footer-right {
    display: flex;
    gap: 12px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    :deep(.advanced-settings-drawer) {
        background: #1a1a1a;

        .el-drawer__header {
            border-bottom-color: rgba(255, 255, 255, 0.05);

            .el-drawer__title {
                color: #E5EAF3;
            }
        }
    }

    .group-title {
        color: #E5EAF3;
    }

    .advanced-settings-form :deep(.el-form-item__label) {
        color: #A3ADB8;
    }

    .advanced-settings-form :deep(.el-input__inner) {
        background: #2b2b2b;
        border-color: rgba(255, 255, 255, 0.05);
        color: #E5EAF3;

        &:hover {
            border-color: rgba(255, 255, 255, 0.1);
        }
    }

    .advanced-settings-form :deep(.el-slider__runway) {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .form-footer {
        background: #232323;
        border-top-color: rgba(255, 255, 255, 0.05);
    }
}

/* 添加到 style 部分 */
.locked-row {
    cursor: not-allowed !important;
    opacity: 0.8;
}

.locked-row:hover {
    background-color: inherit !important;
}

/* 添加到移动端样式部分 */
.task-locked {
    cursor: not-allowed;
    opacity: 0.8;
}

.task-locked:active {
    transform: none !important;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    .task-locked {
        opacity: 0.6;
    }
}

/* 添加到移动端样式部分 */
.expand-disabled {
    cursor: not-allowed !important;
    opacity: 0.5 !important;
}

/* 添加到移动端样式部分 */
.expand-disabled:hover {
    background-color: inherit !important;
}

/* 修改锁定行样式 */
.locked-row {
    cursor: not-allowed !important;
    opacity: 0.8;
}

.locked-row:hover {
    background-color: inherit !important;
}

/* 禁用展开箭头 */
.expand-disabled :deep(.el-table__expand-icon) {
    cursor: not-allowed !important;
    pointer-events: none;
    opacity: 0.5;
}

/* 确保展开箭头不会旋转 */
.expand-disabled :deep(.el-table__expand-icon .el-icon) {
    transform: rotate(0deg) !important;
    transition: none !important;
}

/* 移除展开箭头的hover效果 */
.expand-disabled :deep(.el-table__expand-icon:hover) {
    background-color: transparent !important;
}

/* 添加样式 */
.locked-row {
    cursor: not-allowed !important;
    opacity: 0.8;
}

.locked-row:hover {
    background-color: inherit !important;
}

/* 隐藏展开箭头 */
.hide-expand :deep(.el-table__expand-column) {
    display: none;
}

/* 隐藏锁定行的展开图标 */
.hide-expand :deep(.el-table__expand-icon) {
    visibility: hidden;
}

/* 修改锁定行展开图标样式 */
.locked-row :deep(.el-table__expand-icon) {
    cursor: not-allowed !important;
    pointer-events: none !important;
    /* 禁用鼠标事件 */
    opacity: 0.5;
}

/* 确保锁定行展开图标不会旋转 */
.locked-row :deep(.el-table__expand-icon .el-icon) {
    transform: rotate(0deg) !important;
    transition: none !important;
}

/* 添加 Inpaint 按钮样式 */
.expanded-actions .inpaint {
    color: #9254de !important;
    background-color: rgba(146, 84, 222, 0.1) !important;
    border: 1px solid rgba(146, 84, 222, 0.2) !important;
}

.expanded-actions .inpaint:hover {
    color: #ab7ae0 !important;
    background-color: rgba(146, 84, 222, 0.2) !important;
}

/* 添加新的自定义对话框样式 */
.custom-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.custom-dialog {
    width: 500px;  /* 从180px改为260px */
    height: 80vh;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.custom-dialog-header {
    padding: 10px 16px;  /* 从8px 12px改为10px 16px */
    background: #f8f9fa;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.custom-dialog-header span {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
}

.custom-dialog-header i {
    cursor: pointer;
    font-size: 16px;
    color: #909399;
}

.custom-dialog-body {
    flex: 1;
    padding: 12px;  /* 从8px改为12px */
    overflow: hidden;
}

.custom-dialog-footer {
    padding: 10px 16px;  /* 从8px改为10px 16px */
    background: #f8f9fa;
    border-top: 1px solid #EBEEF5;
    display: flex;
    justify-content: flex-end;
    gap: 10px;  /* 从8px改为10px */
}

/* 修改编辑器容器样式 */
.image-editor-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.image-canvas-container {
    flex: 1;
    min-height: 0;
    border: 1px dashed #e4e7ed;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    overflow: hidden;
}

.image-canvas-container canvas {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
    .custom-dialog {
        width: 80%;  /* 从75%改为80% */
        height: 90vh;
    }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    .custom-dialog {
        background: #1a1a1a;
    }

    .custom-dialog-header {
        background: #232323;
        border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .custom-dialog-header span {
        color: #E5EAF3;
    }

    .custom-dialog-body {
        background: #1a1a1a;
    }

    .custom-dialog-footer {
        background: #232323;
        border-top-color: rgba(255, 255, 255, 0.05);
    }

    .image-canvas-container {
        background: #232323;
        border-color: rgba(255, 255, 255, 0.1);
    }
}

/* 4K屏幕适配 */
@media screen and (min-width: 2560px) {
    .panel {
        max-width: 2400px;  /* 更大屏幕下的最大宽度 */
    }

    .main-container {
        gap: 60px;
        margin: 40px;
    }

    .left-panel {
        width: 520px;  /* 4K下的固定宽度 */
    }

    .right-panel {
        max-width: 1800px;  /* 4K下的最大宽度 */
    }

    /* 调整字体大小 */
    .setting-header span,
    .queue-header span {
        font-size: 1.25rem;
    }

    .el-form-item__label,
    .el-input__inner,
    .el-textarea__inner {
        font-size: 1rem !important;
    }

    /* 调整按钮大小 */
    .submit-btn {
        min-width: 160px;
        height: 48px;
        font-size: 1.1rem;
    }

    /* 调整表格大小 */
    .el-table {
        font-size: 1rem;
    }

    /* 调整分页大小 */
    .el-pagination {
        font-size: 1rem;
    }

    /* 调整图片网格 */
    .el-row {
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
}

/* 超宽屏幕适配 */
@media screen and (min-width: 3440px) {
    .panel {
        max-width: 3000px;
    }

    .main-container {
        gap: 80px;
        margin: 60px;
    }

    .left-panel {
        width: 600px;
    }

    .right-panel {
        max-width: 2200px;
    }

    /* 调整图片网格 */
    .el-row {
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }

    .result-image {
        height: clamp(400px, 30vw, 500px);
    }
}

/* 任务列表样式调整 */
.queue-card :deep(.el-table) {
    width: 100% !important;
}

/* 任务列表列宽调整 */
.queue-card :deep(.el-table__header-wrapper),
.queue-card :deep(.el-table__body-wrapper) {
    width: 100%;
}

/* ID列 */
.queue-card :deep(.el-table .task-id-column) {
    min-width: 80px !important;
    max-width: 120px !important;
    width: 8% !important;
}

/* 提示词列 */
.queue-card :deep(.el-table .prompt-column) {
    min-width: 120px !important;
    max-width: 300px !important;
    width: 25% !important;
}

/* 类型列 */
.queue-card :deep(.el-table .type-column) {
    min-width: 60px !important;
    max-width: 100px !important;
    width: 7% !important;
}

/* 状态列 */
.queue-card :deep(.el-table .status-column) {
    min-width: 60px !important;
    max-width: 100px !important;
    width: 7% !important;
}

/* 时间列 */
.queue-card :deep(.el-table .time-column) {
    min-width: 120px !important;
    max-width: 160px !important;
    width: 12% !important;
}

/* 进度列 */
.queue-card :deep(.el-table .progress-column) {
    min-width: 180px !important;
    max-width: 400px !important;
    width: 20% !important;
}

/* 小屏幕适配 (<=1366px) */
@media screen and (max-width: 1366px) {
    .queue-card :deep(.el-table .task-id-column) {
        min-width: 60px !important;
        width: 5% !important;
    }

    .queue-card :deep(.el-table .prompt-column) {
        min-width: 80px !important;
        width: 18% !important;
    }

    .queue-card :deep(.el-table .type-column) {
        min-width: 45px !important;
        width: 4% !important;
    }

    .queue-card :deep(.el-table .status-column) {
        min-width: 45px !important;
        width: 4% !important;
    }

    .queue-card :deep(.el-table .time-column) {
        min-width: 85px !important;
        width: 8% !important;
    }

    .queue-card :deep(.el-table .progress-column) {
        min-width: 120px !important;
        width: 12% !important;
    }

    /* 调整表格内容的内边距 */
    .queue-card :deep(.el-table .cell) {
        padding-left: 4px !important;
        padding-right: 4px !important;
    }

    /* 调整字体大小 */
    .queue-card :deep(.el-table) {
        font-size: 12px !important;
    }

    /* 调整表格内部元素间距 */
    .queue-card :deep(.el-table td, .el-table th) {
        padding: 6px 0 !important;
    }
}

/* 超小屏幕适配 (<=1024px) */
@media screen and (max-width: 1024px) {
    .queue-card :deep(.el-table .task-id-column) {
        min-width: 50px !important;
        width: 4% !important;
    }

    .queue-card :deep(.el-table .prompt-column) {
        min-width: 80px !important;
        width: 20% !important;
    }

    .queue-card :deep(.el-table .type-column) {
        min-width: 40px !important;
        width: 3% !important;
    }

    .queue-card :deep(.el-table .status-column) {
        min-width: 40px !important;
        width: 3% !important;
    }

    .queue-card :deep(.el-table .time-column) {
        min-width: 75px !important;
        width: 6% !important;
    }

    .queue-card :deep(.el-table .progress-column) {
        min-width: 100px !important;
        width: 10% !important;
    }

    /* 进一步减小内边距 */
    .queue-card :deep(.el-table .cell) {
        padding-left: 2px !important;
        padding-right: 2px !important;
    }

    /* 调整表格内部元素间距 */
    .queue-card :deep(.el-table td, .el-table th) {
        padding: 4px 0 !important;
    }

    /* 调整进度条组件大小 */
    .queue-card :deep(.el-progress) {
        width: 95% !important;
    }

    .queue-card :deep(.el-progress-bar) {
        padding-right: 20px !important;
    }

    .queue-card :deep(.el-progress__text) {
        font-size: 11px !important;
    }
}

/* 调整表格内的标签大小 */
@media screen and (max-width: 1366px) {
    .queue-card :deep(.el-tag) {
        height: 20px !important;
        line-height: 18px !important;
        padding: 0 4px !important;
        font-size: 11px !important;
    }

    .queue-card :deep(.el-button--mini) {
        padding: 4px 8px !important;
        font-size: 11px !important;
    }
}

/* 大屏幕适配 (>=1920px) */
@media screen and (min-width: 1920px) {
    .queue-card :deep(.el-table .prompt-column) {
        width: 30% !important;
    }

    .queue-card :deep(.el-table .progress-column) {
        width: 25% !important;
    }
}

/* 4K屏幕适配 (>=2560px) */
@media screen and (min-width: 2560px) {
    .queue-card :deep(.el-table .prompt-column) {
        width: 35% !important;
        max-width: 500px !important;
    }

    .queue-card :deep(.el-table .progress-column) {
        width: 30% !important;
        max-width: 500px !important;
    }
}

/* 超宽屏幕适配 (>=3440px) */
@media screen and (min-width: 3440px) {
    .queue-card :deep(.el-table .prompt-column) {
        width: 40% !important;
        max-width: 600px !important;
    }

    .queue-card :deep(.el-table .progress-column) {
        width: 35% !important;
        max-width: 600px !important;
    }
}

/* 修改绘制遮罩的样式 */
.image-canvas-container canvas {
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent !important;  /* 移除灰色蒙版 */
        pointer-events: none;
    }
}

/* 修改选择区域的样式 */
.selection-area {
    position: absolute;
    border: 2px solid #9254de;
    background: transparent !important;  /* 确保选择区域内没有蒙版 */
    pointer-events: none;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    .image-editor-dialog {
        .image-canvas-container {
            background: #1a1a1a !important;
            border-color: rgba(255, 255, 255, 0.1) !important;

            canvas {
                background: #2b2b2b !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
            }
        }
    }
}
</style>