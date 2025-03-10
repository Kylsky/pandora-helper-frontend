<template>
  <el-container class="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
    <el-main ref="mainContainer" class="!p-0">
      <div class="w-full h-full">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-0 relative">
          <!-- 垂直居中的伸缩按钮 -->
          <transition name="fade">
            <div v-if="isPanelCollapsed && !isMobile" class="draw-page-fixed-btn fixed left-0 top-1/2 -translate-y-1/2 z-[2500]">
              <button
                @click="togglePanel"
                class="flex flex-col items-center justify-center w-12 h-28 rounded-r-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/70 dark:border-gray-700/70 group"
                title="展开绘图设置面板"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <svg class="w-5 h-5 mb-1 transition-transform duration-300 group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg class="w-5 h-5 mb-1 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
                <!-- <div class="vertical-text-improved mt-2 text-xs font-medium tracking-wide">绘图设置</div> -->
              </button>
            </div>
          </transition>

          <!-- 移动端切换按钮 -->
          <div v-if="isMobile" class="fixed bottom-6 left-6 z-[2500]">
            <button
              @click="togglePanel"
              class="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/70 dark:border-gray-700/70 group"
            >
              <svg v-if="!isPanelCollapsed" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </button>
          </div>

          <!-- 左侧面板：创建图像设置 -->
          <div 
            class="left-panel-transition md:col-span-3 h-screen overflow-auto relative"
            :class="{ 
              'md:-translate-x-full md:absolute md:opacity-0 md:pointer-events-none': isPanelCollapsed && !isMobile,
              'fixed inset-0 z-[2000] bg-white/95 dark:bg-gray-800/95': isMobile && !isPanelCollapsed,
              'hidden': isMobile && isPanelCollapsed
            }"
          >
            <div class="p-4 md:p-6">
              <!-- 创建表单 -->
              <div class="relative">
                <PromptForm 
                  :loading="loading"
                  :initial-form-data="formData"
                  @submit="handleFormSubmit"
                  @show-settings="showAdvancedSettings = true"
                  @preview="handlePreviewImage"
                />
                <!-- 面板收缩按钮 - 桌面端 -->
                <button
                  v-if="!isMobile"
                  @click="togglePanel"
                  class="absolute top-3 right-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-600 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 group transform hover:-translate-x-1 z-20"
                  title="收起设置"
                >
                  <div class="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span class="absolute right-full mr-2 opacity-0 group-hover:opacity-100 whitespace-nowrap text-xs font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm transition-opacity duration-300 pointer-events-none">收起设置</span>
                </button>
                <!-- 移动端关闭按钮 -->
                <button
                  v-if="isMobile && !isPanelCollapsed"
                  @click="togglePanel"
                  class="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-600 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 z-20"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧面板：绘图结果 -->
          <div 
            class="right-panel-transition transition-all duration-300 bg-gray-50 dark:bg-gray-800"
            :class="{ 
              'md:col-span-12': isPanelCollapsed && !isMobile, 
              'md:col-span-9': !isPanelCollapsed && !isMobile,
              'mt-0': isMobile
            }"
          >
            <div class="p-4 pb-20">
              <!-- 任务列表 -->
              <TaskQueue 
                ref="taskQueue"
                :tasks="taskQueue" 
                :status="queueStatus"
                :external-page="pagination.current"
                :external-page-size="pagination.pageSize"
                :total-items="pagination.total"
                :is-panel-collapsed="isPanelCollapsed"
                @preview="handlePreviewImage"
                @edit="handleEditImage"
                @download="handleDownloadImage"
                @copy="handleCopyImage"
                @delete="handleDeleteTask"
                @mjAction="handleMjAction"
                @varyRegion="handleVaryRegion"
                @page-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <!-- 使用抽离的子组件 -->
    <ImageViewer 
      :visible="showViewer" 
      :image-url="previewUrl" 
      @close="closeViewer" 
    />

    <ImageEditor
      :visible="showImageEditor"
      :current-task="currentTask"
      @close="handleEditorClose"
      @confirm="handleEditorConfirm"
      ref="imageEditor"
    />

    <SettingsDrawer
      :visible.sync="showAdvancedSettings"
      :is-mobile="isMobile"
      :init-form-data="formData"
      @apply="handleSettingsApply"
    />
  </el-container>
</template>

<script>
import ImageViewer from './draw/ImageViewer.vue';
import ImageEditor from './draw/ImageEditor.vue';
import SettingsDrawer from './draw/SettingsDrawer.vue';
import TaskQueue from './draw/TaskQueue.vue';
import PromptForm from './draw/PromptForm.vue';
import drawPageLogic from './draw/DrawPageLogic.js';

export default {
  name: 'DrawPage',
  components: {
    ImageViewer,
    ImageEditor,
    SettingsDrawer,
    TaskQueue,
    PromptForm
  },
  mixins: [drawPageLogic]
};
</script>

<style>
/* 页面全局样式 */
.el-drawer__header {
  margin-bottom: 0 !important;
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(229, 231, 235, 0.3) !important;
  color: white !important;
}

.dark {
  color-scheme: dark;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* 面板切换动画 */
.left-panel-transition {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.right-panel-transition {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  height: 100vh;
  overflow: auto;
  width: 100%;  /* 确保宽度100%，适应网格系统的变化 */
}

.dark .right-panel-transition {
  background-color: rgba(17, 24, 39, 0.95);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}

/* 优化深色模式下的全局配色和效果 */
.dark .el-container {
  background: linear-gradient(to bottom right, #111827, #1e293b, #111827);
}

.dark .el-main {
  color: rgba(229, 231, 235, 0.9);
}

.dark button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 深色模式下表单元素优化 */
.dark input, 
.dark textarea, 
.dark select, 
.dark .el-input__inner {
  background-color: rgba(30, 41, 59, 0.8) !important;
  border-color: rgba(75, 85, 99, 0.5) !important;
  color: rgba(229, 231, 235, 0.9) !important;
}

.dark input:focus, 
.dark textarea:focus, 
.dark select:focus,
.dark .el-input__inner:focus {
  border-color: rgba(59, 130, 246, 0.7) !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25) !important;
}

/* 深色模式下卡片和容器优化 */
.dark .el-card {
  background-color: rgba(30, 41, 59, 0.6) !important;
  border-color: rgba(55, 65, 81, 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
}

/* 垂直文字 */
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  letter-spacing: 1px;
}

/* 改进版垂直文字 */
.vertical-text-improved {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  letter-spacing: 2px;
  color: rgba(59, 130, 246, 0.9);
  text-shadow: 0 0 1px rgba(59, 130, 246, 0.2);
}

.dark .vertical-text-improved {
  color: rgba(96, 165, 250, 0.9);
  text-shadow: 0 0 2px rgba(96, 165, 250, 0.4);
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 按钮动画 */
@keyframes pulse-light {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3); }
  70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

@keyframes pulse-dark {
  0% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(96, 165, 250, 0); }
  100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0); }
}

.fixed button {
  animation: pulse-light 3s infinite;
}

.dark .fixed button {
  animation: pulse-dark 3s infinite;
}

/* 悬停时暂停动画 */
.fixed button:hover {
  animation-play-state: paused;
}

/* 深色模式下的过渡效果优化 */
.dark * {
  transition-duration: 0.3s;
}

/* 深色模式焦点状态增强 */
.dark *:focus-visible {
  outline: 2px solid rgba(96, 165, 250, 0.6) !important;
  outline-offset: 2px !important;
}

/* 确保伸缩按钮始终可见 */
.draw-page-fixed-btn {
  position: fixed !important;
  z-index: 2500 !important; /* 确保高于NaviPage的所有元素 */
  left: 0 !important; /* 默认在最左边 */
  pointer-events: auto !important;
}

.draw-page-fixed-btn button {
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2) !important;
}

/* 仅当在NaviPage中嵌套时应用侧边栏调整 */
/* 通过ID 'navi' 检测是否在NaviPage环境中 */
#navi .draw-page-fixed-btn,
body:has(#navi) .draw-page-fixed-btn {
  /* 当在NaviPage环境中时，按钮位置基于侧边栏宽度 */
  @media screen and (min-width: 769px) {
    left: 66px !important; /* 默认折叠状态 */
  }
}

/* 处理NaviPage中的侧边栏展开状态 */
#navi .el-aside:not([style*="width: 66px"]) ~ .el-main .draw-page-fixed-btn,
body:has(#navi .el-aside:not([style*="width: 66px"])) .draw-page-fixed-btn {
  @media screen and (min-width: 769px) {
    left: 240px !important; /* 当NaviPage侧边栏展开时 */
  }
}

/* 使用更高层级的选择器，确保不被其他组件覆盖 */
body .draw-page-fixed-btn {
  visibility: visible !important;
  opacity: 1 !important;
}
</style> 