<template>
  <div @click.stop>
    <!-- 图像结果网格 - 减小间距和内边距 -->
    <div v-if="!isLoading" class="grid grid-cols-3 gap-2 pb-1">
      <div v-for="(task, index) in paginatedTasks" :key="task.id || index"
        class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:translate-y-[-2px]">

        <!-- 图片区域 - 调整高宽比 -->
        <div class="relative aspect-ratio-custom bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 cursor-pointer overflow-hidden rounded-t-lg"
          @click="handlePreview(task)">
          <img v-if="task.imageUrl && !['FAILURE', 'MODAL'].includes(getTaskStatus(task))" :src="task.imageUrl"
            class="w-full h-full object-contain transition-transform duration-500 hover:scale-105 rounded-lg" />
          <div v-else-if="!['FAILURE', 'MODAL'].includes(getTaskStatus(task))"
            class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <svg class="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
              </path>
            </svg>
          </div>


          <!-- 进度条覆盖层 -->
          <div v-if="getTaskStatus(task) === 'PENDING'"
            class="absolute inset-0 bg-gray-900/40 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div class="w-7 h-7 border-2 border-blue-400 dark:border-blue-300 border-t-transparent rounded-full animate-spin mb-1 shadow-md shadow-blue-500/10"></div>
            <span class="text-xs text-white font-medium px-2 py-0.5 rounded-full bg-gray-800/40 backdrop-blur-sm">处理中 {{ task.progress || '' }}</span>
          </div>

          <!-- IN_PROGRESS 状态进度条覆盖层 -->
          <div v-if="getTaskStatus(task) === 'IN_PROGRESS'"
            class="absolute inset-0 bg-gray-900/40 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div class="relative w-32 h-2.5 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden shadow-inner">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-full relative" 
                   :style="{ width: getProgressPercentage(task) }">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style="animation: shimmer 2s infinite;"></div>
              </div>
            </div>
            <span class="text-xs text-white font-medium mt-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 backdrop-blur-sm">{{ getProgressPercentage(task) }}</span>
          </div>

          <!-- SUBMITTED 状态覆盖层 -->
          <div v-if="getTaskStatus(task) === 'SUBMITTED'"
            class="absolute inset-0 bg-gray-900/40 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div class="relative mb-2">
              <!-- 文档图标 -->
              <div class="w-10 h-12 bg-white dark:bg-gray-200 rounded-md relative shadow-lg transform transition-transform duration-1000" style="animation: bounce 2s ease-in-out infinite alternate;">
                <!-- 文档折角 -->
                <div class="absolute top-0 right-0 w-0 h-0 border-t-0 border-r-[10px] border-b-[10px] border-l-0 border-r-white dark:border-r-gray-200 border-b-gray-300 dark:border-b-gray-400"></div>
                <!-- 文档线条 -->
                <div class="absolute top-3 left-2 right-2 h-1 bg-gray-300 dark:bg-gray-400 rounded"></div>
                <div class="absolute top-5 left-2 right-2 h-1 bg-gray-300 dark:bg-gray-400 rounded"></div>
                <div class="absolute top-7 left-2 right-4 h-1 bg-gray-300 dark:bg-gray-400 rounded"></div>
              </div>
              <!-- 勾选标记 -->
              <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center opacity-0 transform scale-0 shadow-lg shadow-green-500/20" style="animation: 0.5s ease-out 0.5s forwards appear-scale;">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <span class="text-xs text-white font-medium mt-3 px-2.5 py-0.5 rounded-full bg-green-500/20 backdrop-blur-sm">已提交</span>
            <span class="text-xs text-white/80 mt-1">等待处理中...</span>
          </div>

          <!-- 等待中覆盖层 -->
          <div v-if="getTaskStatus(task) === 'MODAL'"
            class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 dark:bg-gray-800/60 backdrop-blur-sm">
            <div class="relative flex justify-center items-center mb-3">
              <div class="absolute w-9 h-9 border-4 border-blue-400/30 dark:border-blue-300/30 rounded-full shadow-lg shadow-blue-500/10"></div>
              <div class="absolute w-9 h-9 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin"></div>
              <div class="absolute w-7 h-7 border-4 border-transparent border-r-indigo-500 dark:border-r-indigo-400 rounded-full animate-spin" style="animation-duration: 0.8s;"></div>
              <div class="absolute w-5 h-5 border-2 border-transparent border-b-violet-500 dark:border-b-violet-400 rounded-full animate-spin" style="animation-duration: 1.2s;"></div>
              <div class="w-2 h-2 bg-white dark:bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <span class="text-base text-white font-medium px-3 py-0.5 rounded-full bg-indigo-500/20 backdrop-blur-sm">等待中</span>
            <span class="text-xs text-white/90 mt-2 px-3 text-center">任务已提交，正在等待处理...</span>
          </div>

          <!-- NOT_START 状态覆盖层 -->
          <div v-if="getTaskStatus(task) === 'NOT_START'"
            class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 dark:bg-gray-800/60 backdrop-blur-sm">
            <div class="relative mb-3">
              <!-- 时钟表盘 -->
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 relative flex items-center justify-center shadow-lg">
                <!-- 时针 -->
                <div class="absolute w-[1.5px] h-3 bg-gray-700 dark:bg-gray-300 rounded origin-bottom transform rotate-45" style="animation: rotate360 10s linear infinite;"></div>
                <!-- 分针 -->
                <div class="absolute w-[1px] h-4 bg-gray-700 dark:bg-gray-300 rounded origin-bottom transform rotate-180" style="animation: rotate360 2s linear infinite;"></div>
                <!-- 中心点 -->
                <div class="absolute w-1.5 h-1.5 bg-gray-700 dark:bg-gray-300 rounded-full"></div>
              </div>
              <!-- 脉冲环 -->
              <div class="absolute inset-0 rounded-full border-2 border-blue-400/40 dark:border-blue-300/40 animate-ping" style="animation-duration: 2s;"></div>
            </div>
            <span class="text-base text-white font-medium px-3 py-0.5 rounded-full bg-gray-500/20 backdrop-blur-sm">未开始</span>
            <span class="text-xs text-white/90 mt-2 px-3 text-center">任务已创建，等待启动...</span>
          </div>

          <!-- 失败状态覆盖层 -->
          <div v-if="getTaskStatus(task) === 'FAILURE'"
            class="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 dark:bg-red-900/30 backdrop-blur-sm">
            <div class="w-12 h-12 text-red-500 dark:text-red-400 mb-3 transform transition-all" style="animation: shake 0.5s ease-in-out;">
              <svg class="w-full h-full drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                </path>
              </svg>
            </div>
            <span class="text-base text-white font-medium px-3 py-0.5 rounded-full bg-red-500/30 backdrop-blur-sm" style="animation: fadeIn 0.3s 0.2s forwards;">任务失败</span>
            <span v-if="task.failReason" class="text-xs text-white/90 mt-2 px-3 text-center max-w-[200px] bg-gray-900/30 backdrop-blur-sm rounded-md py-1" style="animation: fadeIn 0.3s 0.4s forwards;">{{ task.failReason }}</span>
          </div>
        </div>

        <!-- 底部操作栏 - 减小内边距 -->
        <div class="p-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm">
          <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <svg class="w-3 h-3 mr-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ formatTime(getTaskSubmitTime(task)) }}
          </div>

          <div class="flex space-x-1.5">
            <button v-if="hasRerollButton(task)" @click="handleReroll(task)"
              class="action-icon-button text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full p-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
            </button>
            <button v-if="task.imageUrl && getTaskStatus(task) === 'SUCCESS'" @click="handleCopy(task)"
              class="action-icon-button text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full p-1 tooltip-container">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                </path>
              </svg>
              <!-- 添加提示框显示 prompt -->
              <div class="tooltip-content" v-if="getTaskPrompt(task)" @mouseenter="keepTooltipVisible($event)"
                @mouseleave="hideTooltip($event)">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner">
                  <span class="tooltip-title">
                    提示词
                    <svg class="inline-block w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                      </path>
                    </svg>
                  </span>
                  <div class="tooltip-prompt" :title="getTaskPrompt(task)">{{ truncateText(getTaskPrompt(task)) }}</div>
                </div>
              </div>
            </button>
            <button v-if="task.imageUrl && getTaskStatus(task) === 'SUCCESS'" @click="handleDownload(task)"
              class="action-icon-button text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full p-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
            <button @click="handleDelete(task)"
              class="action-icon-button text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                </path>
              </svg>
            </button>
          </div>
        </div>

        <!-- MJ操作按钮区域 - 减小内边距和间距 -->
        <div v-if="task.buttons && task.buttons.length" class="p-2 pt-1 flex flex-wrap gap-1 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <!-- 放大操作下拉菜单 -->
          <div class="relative dropdown-container" data-category="upsample" v-if="getCategoryButtons(task.buttons, 'upsample').length"
            @mouseleave="startCloseDropdown(task.id, 'upsample')">
            <button class="action-button bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 shadow-sm" :data-task-id="task.id" data-category="upsample"
              @mouseenter="toggleDropdown(task.id, 'upsample', true)">
              <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
              <span>放大</span>
              <svg class="w-3 h-3 ml-0.5 text-xs opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="dropdown-content" v-show="isDropdownOpen(task.id, 'upsample')"
              @mouseenter="cancelCloseDropdown(task.id, 'upsample')" @mouseleave="closeDropdown(task.id, 'upsample')"
              :data-dropdown-id="task.id + '-upsample'">
              <div class="py-1">
                <button v-for="(btn, btnIndex) in getCategoryButtons(task.buttons, 'upsample')" :key="btnIndex"
                  @click.stop="handleMjAction(task, btn)" class="dropdown-item hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400">
                  <span v-if="btn.emoji" class="mr-1">{{ getEmoji(btn) }}</span>
                  {{ getActionName(btn) || btn.label }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 变换操作下拉菜单 -->
          <div class="relative dropdown-container" data-category="variation" v-if="getCategoryButtons(task.buttons, 'variation').length"
            @mouseleave="startCloseDropdown(task.id, 'variation')">
            <button class="action-button bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50 shadow-sm" :data-task-id="task.id" data-category="variation"
              @mouseenter="toggleDropdown(task.id, 'variation', true)">
              <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              <span>变换</span>
              <svg class="w-3 h-3 ml-0.5 text-xs opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="dropdown-content" v-show="isDropdownOpen(task.id, 'variation')"
              @mouseenter="cancelCloseDropdown(task.id, 'variation')" @mouseleave="closeDropdown(task.id, 'variation')"
              :data-dropdown-id="task.id + '-variation'">
              <div class="py-1">
                <button v-for="(btn, btnIndex) in getCategoryButtons(task.buttons, 'variation')" :key="btnIndex"
                  @click.stop="handleMjAction(task, btn)" class="dropdown-item hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400">
                  <span v-if="btn.emoji" class="mr-1">{{ getEmoji(btn) }}</span>
                  {{ getActionName(btn) || btn.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 移动操作下拉菜单 -->
          <div class="relative dropdown-container" data-category="pan" v-if="getCategoryButtons(task.buttons, 'pan').length"
            @mouseleave="startCloseDropdown(task.id, 'pan')">
            <button class="action-button bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800/50 shadow-sm" :data-task-id="task.id" data-category="pan"
              @mouseenter="toggleDropdown(task.id, 'pan', true)">
              <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>移动</span>
              <svg class="w-3 h-3 ml-0.5 text-xs opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="dropdown-content" v-show="isDropdownOpen(task.id, 'pan')"
              @mouseenter="cancelCloseDropdown(task.id, 'pan')" @mouseleave="closeDropdown(task.id, 'pan')">
              <div class="py-1">
                <button v-for="(btn, btnIndex) in getCategoryButtons(task.buttons, 'pan')" :key="btnIndex"
                  @click.stop="handleMjAction(task, btn)" class="dropdown-item hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400">
                  <span v-if="btn.emoji" class="mr-1">{{ getEmoji(btn) }}</span>
                  {{ getActionName(btn) || btn.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="relative dropdown-container" data-category="zoom_out" v-if="getCategoryButtons(task.buttons, 'zoom_out').length"
            @mouseleave="startCloseDropdown(task.id, 'zoom_out')">
            <button class="action-button bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/50 shadow-sm" :data-task-id="task.id" data-category="zoom_out"
              @mouseenter="toggleDropdown(task.id, 'zoom_out', true)">
              <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>扩散</span>
              <svg class="w-3 h-3 ml-0.5 text-xs opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="dropdown-content" v-show="isDropdownOpen(task.id, 'zoom_out')"
              @mouseenter="cancelCloseDropdown(task.id, 'zoom_out')" @mouseleave="closeDropdown(task.id, 'zoom_out')">
              <div class="py-1">
                <button v-for="(btn, btnIndex) in getCategoryButtons(task.buttons, 'zoom_out')" :key="btnIndex"
                  @click.stop="handleMjAction(task, btn)" class="dropdown-item hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400">
                  <span v-if="btn.emoji" class="mr-1">{{ getEmoji(btn) }}</span>
                  {{ getActionName(btn) || btn.label }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 加载状态 - 改为只占据内容区域 -->
    <div v-if="isLoading" class="relative w-full min-h-[calc(100vh-10rem)] flex items-center justify-center z-50 rounded-xl mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div class="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-lg dark:shadow-gray-900/30 border border-gray-100/50 dark:border-gray-700/50 transform transition-all duration-500 max-w-md">
        <div class="flex flex-col items-center justify-center">
          <!-- Tailwind 实现的加载动画 -->
          <div class="relative w-[72px] h-[72px] flex items-center justify-center mb-4">
            <!-- 外环 -->
            <div class="absolute inset-0 rounded-full border-[3px] border-transparent border-l-blue-500 dark:border-l-blue-400 border-t-blue-500/30 dark:border-t-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(96,165,250,0.15)] animate-[spin_2s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
            
            <!-- 中环 -->
            <div class="absolute w-3/4 h-3/4 top-[12.5%] left-[12.5%] rounded-full border-[3px] border-transparent border-r-indigo-500 dark:border-r-indigo-400 border-b-indigo-500/30 dark:border-b-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] dark:shadow-[0_0_15px_rgba(129,140,248,0.15)] animate-[spin_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]"></div>
            
            <!-- 内环 -->
            <div class="absolute w-1/2 h-1/2 top-1/4 left-1/4 rounded-full border-[3px] border-transparent border-t-violet-500 dark:border-t-violet-400 border-l-violet-500/30 dark:border-l-violet-400/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] dark:shadow-[0_0_15px_rgba(167,139,250,0.15)] animate-[spin_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
            
            <!-- 核心 -->
            <div class="absolute w-[30%] h-[30%] rounded-full bg-gradient-to-br from-blue-500 to-violet-500 dark:from-blue-400 dark:to-violet-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_15px_rgba(129,140,248,0.5)] animate-pulse"></div>
          </div>
          
          <h3 class="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">正在加载</h3>
          <p class="text-gray-500 dark:text-gray-400">请稍候，正在获取图像数据...</p>
        </div>
      </div>
    </div>

    <!-- 空状态提示 - 垂直居中 -->
    <div v-if="!isLoading && !tasks.length" class="empty-state">
      <div class="empty-state-card transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
        <div class="empty-state-icon">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
            </path>
          </svg>
        </div>
        <h3 class="empty-state-heading text-gray-600 dark:text-gray-300">暂无图像</h3>
        <p class="empty-state-text">在左侧输入提示词开始生成图像</p>
      </div>
    </div>

    <!-- 分页控制 - 上移分页组件 -->
    <div class="pagination-component fixed bottom-6 right-6 z-50">
      <nav
        class="inline-flex items-center gap-1 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        role="navigation" aria-label="分页">
        <!-- 上一页按钮 -->
        <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
          class="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 z-30 bg-transparent focus:outline-none transform hover:scale-105"
          :class="{ 'opacity-40 cursor-not-allowed': currentPage === 1 }" aria-label="上一页">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- 页码按钮组 -->
        <div class="flex items-center gap-1 z-30">
          <template v-for="page in getPageRange()">
            <button v-if="page !== '...'" :key="page" @click="handlePageChange(page)"
              class="flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full text-sm font-medium transition-all duration-200 border-0 bg-transparent focus:outline-none transform hover:scale-105"
              :class="[
                currentPage === page
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-600/30 scale-105 z-40'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30',
                Math.abs(currentPage - page) <= 1 && currentPage !== page ? 'text-blue-500 dark:text-blue-400' : ''
              ]">
              {{ page }}
            </button>
            <span v-else :key="'ellipsis-' + page"
              class="flex items-center justify-center w-8 h-8 text-gray-400 dark:text-gray-500 text-xs tracking-wider select-none">
              •••
            </span>
          </template>
        </div>

        <!-- 下一页按钮 -->
        <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages"
          class="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 z-30 bg-transparent focus:outline-none transform hover:scale-105"
          :class="{ 'opacity-40 cursor-not-allowed': currentPage === totalPages }" aria-label="下一页">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import config from '@/configs/config';
export default {
  name: 'TaskQueue',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'idle' // 'idle', 'active', 'error'
    },
    // 可选的外部分页参数
    externalPage: {
      type: Number,
      default: 0
    },
    externalPageSize: {
      type: Number,
      default: 0
    },
    // 添加总数据量属性
    totalItems: {
      type: Number,
      default: 0
    },
    // 添加加载状态属性
    loading: {
      type: Boolean,
      default: false
    },
    // 添加面板收缩状态
    isPanelCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropdowns: {}, // 存储下拉菜单的开关状态
      closeTimers: {}, // 存储关闭计时器
      currentPage: 1,
      itemsPerPage: 6, // 每页显示6张图片
      isLoadingDebounced: false, // 添加防抖后的加载状态
      loadingDebounceTimer: null, // 防抖定时器
      pollingTasks: {}, // 存储正在轮询的任务ID
      pollingIntervals: {}, // 存储轮询的定时器
      aspectRatio: "5/4", // 默认宽高比
      cardStyles: {}, // 存储计算后的卡片样式
      scrollTimer: null // 滚动事件防抖定时器
    };
  },
  watch: {
    // 监听外部分页变化
    externalPage(newVal) {
      if (newVal > 0 && newVal !== this.currentPage) {
        this.currentPage = newVal;
      }
    },
    // 监听面板收缩状态变化，重新计算卡片宽高比
    isPanelCollapsed() {
      // 延迟计算，等待DOM渲染完成
      this.$nextTick(() => {
        this.calculateAspectRatio();
      });
    },
    // 监听loading状态变化，使用防抖处理
    loading(newVal) {
      // 如果变为加载状态，立即显示
      if (newVal) {
        this.isLoadingDebounced = true;
        clearTimeout(this.loadingDebounceTimer);
      } else {
        // 如果从加载状态变为非加载状态，延迟500ms再隐藏loading
        clearTimeout(this.loadingDebounceTimer);
        this.loadingDebounceTimer = setTimeout(() => {
          this.isLoadingDebounced = false;
        }, 500);
      }
    },
    // 监听任务列表变化，处理新的任务
    tasks: {
      handler(newTasks) {
        // 只清理已不在列表中的任务轮询
        if (Object.keys(this.pollingTasks).length > 0) {
          console.log('检查并清理不存在的任务轮询');
          const taskIds = newTasks.map(task => task.id || task.taskId).filter(id => id);

          Object.keys(this.pollingTasks).forEach(taskId => {
            if (!taskIds.includes(taskId)) {
              console.log(`任务 ${taskId} 已不在列表中，停止轮询`);
              this.stopPollingTask(taskId);
            }
          });
        }
      },
      deep: true
    }
  },
  computed: {
    // 计算加载状态，使用防抖后的状态
    isLoading() {
      return this.isLoadingDebounced || this.status === 'active';
    },
    // 计算任务列表 - 直接返回后端分页的数据
    paginatedTasks() {
      // 使用后端分页时直接返回任务数组
      return this.tasks;
    },
    // 计算总页数，确保至少有1页
    totalPages() {
      // 如果提供了总条目数，则使用它
      if (this.totalItems > 0) {
        return Math.max(1, Math.ceil(this.totalItems / (this.externalPageSize || this.itemsPerPage)));
      }
      // 否则使用本地数组长度
      return Math.max(1, Math.ceil(this.tasks.length / this.itemsPerPage));
    }
  },
  mounted() {
    // 添加全局点击事件监听，用于关闭所有下拉菜单
    document.addEventListener('click', this.closeAllDropdowns);

    // 添加窗口大小变化监听，用于重新检测下拉菜单位置
    window.addEventListener('resize', this.handleResize);
    
    // 添加滚动事件监听
    window.addEventListener('scroll', this.handleScroll);

    // 初始化加载状态
    this.isLoadingDebounced = this.loading;

    // 计算屏幕比例并设置卡片宽高比
    this.calculateAspectRatio();
    
    // 在DOM更新后应用样式
    this.$nextTick(() => {
      this.applyAspectRatioStyles();
    });
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.closeAllDropdowns);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);

    // 清除所有计时器
    Object.keys(this.closeTimers).forEach(key => {
      clearTimeout(this.closeTimers[key]);
    });

    // 清除加载状态防抖计时器
    clearTimeout(this.loadingDebounceTimer);

    // 清除所有轮询定时器
    Object.keys(this.pollingIntervals).forEach(taskId => {
      clearInterval(this.pollingIntervals[taskId]);
    });
    this.pollingTasks = {};
    this.pollingIntervals = {};
  },
  methods: {
    // 分页相关方法
    handlePageChange(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // 关闭所有打开的下拉菜单
        this.closeAllDropdowns();
        // 向父组件发出分页变更事件
        this.$emit('page-change', page);
      }
    },

    // 获取分页显示范围
    getPageRange() {
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;

      // 如果总页数小于等于7，显示所有页码
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      // 否则使用省略号来缩短显示
      let range = [];

      // 始终显示第一页
      range.push(1);

      // 当前页接近开始
      if (currentPage <= 3) {
        range.push(2, 3, 4, '...', totalPages);
      }
      // 当前页接近结束
      else if (currentPage >= totalPages - 2) {
        range.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      }
      // 当前页在中间
      else {
        range.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }

      return range;
    },

    formatTime(timestamp) {
      if (!timestamp) return '';

      try {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } catch (e) {
        return '';
      }
    },

    getTaskStatus(task) {
      // 从新的数据结构中获取状态
      let status;
      if (task.displays && task.displays.status) {
        status = task.displays.status;
      } else {
        status = task.status || 'PENDING';
      }

      // 检查是否是NOT_START状态
      // 具体条件可以根据实际需求调整
      if (status === 'NOT_START' ||
        (task.createTime && !task.submitTime && !status) ||
        (task.status === 'CREATED' && !task.submitTime)) {
        return 'NOT_START';
      }

      return status;
    },

    getTaskSubmitTime(task) {
      // 从新的数据结构中获取提交时间
      if (task.displays && task.displays.submitTime) {
        return new Date(task.displays.submitTime);
      }
      return task.submitTime;
    },

    handlePreview(task) {
      if (task.imageUrl && !['FAILURE', 'MODAL'].includes(this.getTaskStatus(task))) {
        this.$emit('preview', task.imageUrl);
      }
    },

    handleDownload(task) {
      this.$emit('download', task);
    },

    handleCopy(task) {
      this.$emit('copy', task);
    },

    handleDelete(task) {
      // 获取任务ID
      const taskId = task.id || task.taskId;
      if (!taskId) {
        this.$message.error('任务ID不存在，无法删除');
        return;
      }

      // 确认删除
      this.$confirm('确定要删除该图像吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 显示加载状态
        const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        // Authorize
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        // 调用删除API,http方法为 delete
        fetch(`${config.apiBaseUrl}/mj/deleteByTaskId?taskId=${taskId}`, { headers, method: 'DELETE' })
          .then(response => {
            // 检查HTTP响应状态
            if (!response.ok) {
              throw new Error(`HTTP错误，状态码: ${response.status}`);
            }
            return response.json();
          })
          .then(result => {
            loading.close();

            // 检查返回数据格式是否符合预期
            if (result === undefined || result === null) {
              throw new Error('服务器返回数据为空');
            }

            // 首先判断status
            if (result.status === true) {
              // 然后判断data是否为true
              if (result.data === true) {
                this.$message.success('删除成功');

                // 确保所有弹窗都关闭
                this.$nextTick(() => {
                  const messageBoxes = document.querySelectorAll('.el-message-box__wrapper');
                  if (messageBoxes.length > 0) {
                    messageBoxes.forEach(box => {
                      document.body.removeChild(box);
                    });
                  }
                });

                // 通知父组件删除成功
                this.$emit('delete-success', task);

                // 同时也触发原有的delete事件，保持向后兼容
                // 增加confirmed=true的标记，表示这是已经确认过的删除操作，不需要再次确认
                this.$emit('delete', task, true);

                // 刷新当前页面数据
                this.handlePageChange(this.currentPage);

              } else {
                this.$message.warning('删除操作未完成');
                this.$emit('delete-fail', task);
              }
            } else {
              this.$message.error(result.msg || '删除失败');
              this.$emit('delete-fail', task);
            }
          })
          .catch(error => {
            loading.close();
            console.error('删除失败:', error);
            this.$message.error(`删除请求发生错误: ${error.message || '未知错误'}`);
            this.$emit('delete-fail', task, error);
          });
      }).catch(() => {
        // 用户取消删除
        this.$message.info('已取消删除');
      });
    },

    handleMjAction(task, btn) {
      // 先关闭所有下拉菜单
      this.closeAllDropdowns();

      // 获取任务ID
      const taskId = task.id || task.taskId;
      if (!taskId) {
        console.error('无法获取任务ID，无法开始轮询');
        return;
      }

      // 首先检查是否是局部重绘(Vary Region)操作
      if (btn.label && btn.label.includes('Vary (Region)')) {
        console.log('触发局部重绘操作');
        // 触发局部重绘专用事件，让父组件处理局部重绘的弹窗
        this.$emit('varyRegion', task, btn);
        return;
      }

      // 然后异步执行操作
      this.$nextTick(() => {
        // 将页面重置为第一页
        if (this.currentPage !== 1) {
          this.currentPage = 1;
          this.$emit('page-change', 1);
        }

        console.log(`触发MJ操作: ${btn.label || '未知操作'} 任务ID: ${taskId}`);

        // 触发MJ操作事件
        this.$emit('mjAction', task, btn);

        // 启动轮询来检查任务状态
        this.startPollingTask(taskId);
      });
    },

    // 开始轮询任务状态
    startPollingTask(taskId) {
      if (!taskId) return;

      // 如果已经在轮询这个任务，则不重复启动
      if (this.pollingTasks[taskId]) return;

      console.log(`开始轮询任务 ${taskId} 状态`);

      // 标记这个任务正在被轮询
      this.$set(this.pollingTasks, taskId, true);

      // 创建定时器，每3秒检查一次任务状态
      const intervalId = setInterval(() => {
        this.fetchTaskStatus(taskId);
      }, 3000);

      // 存储定时器ID，以便之后清除
      this.$set(this.pollingIntervals, taskId, intervalId);

      // 先立即执行一次
      this.fetchTaskStatus(taskId);

      // 设置最大轮询时间（10分钟），防止无限轮询
      setTimeout(() => {
        console.log(`任务 ${taskId} 已达到最大轮询时间，停止轮询`);
        this.stopPollingTask(taskId);
      }, 10 * 60 * 1000);
    },

    // 停止轮询特定任务
    stopPollingTask(taskId) {
      if (!taskId || !this.pollingTasks[taskId]) return;

      console.log(`停止轮询任务 ${taskId} 状态`);

      // 清除定时器
      clearInterval(this.pollingIntervals[taskId]);

      // 移除标记和定时器ID
      this.$delete(this.pollingTasks, taskId);
      this.$delete(this.pollingIntervals, taskId);
    },

    // 获取任务状态
    fetchTaskStatus(taskId) {
      if (!taskId) return;

      // 构建API URL
      const url = `${config.apiBaseUrl}/mj/task/${taskId}/fetch`;
      // Authrozation
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      // 发起请求
      fetch(url, { headers })
        .then(response => {
          if (!response.ok) {
            throw new Error(`状态码: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          if (result && result.status === true && result.data) {
            const taskData = result.data;

            // 更新任务状态
            this.$emit('task-updated', taskData);

            // 如果任务已完成或失败，停止轮询
            const status = taskData.displays?.status || taskData.status;
            if (status && !['SUBMITTED', 'IN_PROGRESS', 'PENDING', 'NOT_START'].includes(status)) {
              this.stopPollingTask(taskId);
            }

            // 查找并更新本地任务列表中的对应任务
            const taskIndex = this.tasks.findIndex(task => (task.id === taskId || task.taskId === taskId));
            if (taskIndex !== -1) {
              // 使用Vue的响应式更新方法
              this.$set(this.tasks, taskIndex, { ...this.tasks[taskIndex], ...taskData });

              // 输出日志，方便调试
              console.log(`已更新任务 ${taskId} 状态: ${status}`);
            } else {
              console.log(`找不到任务 ${taskId} 在当前列表中，无法更新本地状态`);
            }
          } else {
            console.warn(`获取任务 ${taskId} 状态返回无效数据:`, result);
          }
        })
        .catch(error => {
          console.error(`获取任务 ${taskId} 状态失败:`, error);
          // 出错时也停止轮询，避免持续失败
          this.stopPollingTask(taskId);
        });
    },

    getEmoji(btn) {
      if (!btn) return '';
      const customId = btn.customId;
      if (!customId) return '';

      const parts = customId.split('::');
      if (parts.length < 3) return '';
      // const actionType = parts[2];
      // const label = btn.label;
      const emoji = btn.emoji;
      if (emoji.includes('upscale') || emoji.includes('Upsclae')) return '⏫';
      if (emoji.includes('variation')) return '💡';
      if (emoji.includes('reroll')) return '🔄';
      if (emoji.includes('outpaint')) return '🔄';
      if (emoji.includes('zoom')) return '🔍';
      if (emoji.includes('circle')) return '🔄';
      if (emoji.includes('square')) return '🔄';
      if (emoji.includes('circle')) return '🔄';
      if (emoji) return emoji;
      return '';
    },

    getActionName(btn) {
      const customId = btn.customId;
      if (!customId) return '操作';
      // console.log('customId', customId);
      // 解析customId获取操作类型
      // 格式通常为 MJ::JOB::操作类型::其他参数
      const parts = customId.split('::');
      if (parts.length < 3) return '操作';

      const actionType = parts[2];
      const bookMark = parts[1];
      const label = btn.label;
      if (bookMark.includes("BOOKMARK")) return "收藏";
      if (label.includes("Make Square")) return "设为正方形";
      if (label.includes("Vary (Region)")) return "局部重绘";
      if (label.includes("Upscale") && label.includes("2x")) return "放大 2X";
      if (label.includes("Upscale") && label.includes("4x")) return "放大 4X";
      if (label.includes("Make Variations")) return "变换";
      if (label.includes("Custom Zoom")) return "自定义放大";
      if (label.includes("Zoom")) return "放大 " + label.split(" ")[2];

      switch (actionType) {
        case 'upsample': return `放大 ${parts[3] || ''}`;
        case 'upsample_v6_2x_subtle': return '放大(细微)';
        case 'upsample_v6_2x_creative': return '放大(创意)';
        case 'upsample_v6r1_2x_subtle': return '放大(细微)';
        case 'upsample_v6r1_2x_creative': return '放大(创意)';
        case 'variation': return `变换 ${parts[3] || ''}`;
        case 'reroll': return '重新生成';
        case 'low_variation': return '变化(细微)';
        case 'high_variation': return '变化(强烈)';
        case 'pan_left': return '左移';
        case 'pan_right': return '右移';
        case 'pan_up': return '上移';
        case 'pan_down': return '下移';
        default: return actionType;
      }
    },

    getButtonCategory(btn) {
      if (!btn || !btn.customId) return 'other';
      const label = btn.label;

      const parts = btn.customId.split('::');
      const actionType = parts[2];
      if (actionType.includes('upsample')) return 'upsample';
      if (label.includes('Zoom')) return 'zoom_out';
      if (actionType.includes('variation') || label.includes('Vary')) return 'variation';
      if (actionType.includes('pan_') || label.includes("Make Square")) return 'pan';
      if (label.includes('重绘')) return 'reroll';


      return 'other';
    },

    getCategoryButtons(buttons, category) {
      if (!buttons || !buttons.length) return [];
      return buttons.filter(btn => this.getButtonCategory(btn) === category);
    },

    // 下拉菜单控制
    toggleDropdown(taskId, category, isOpen = null) {
      const key = `${taskId}-${category}`;
      // console.log('toggleDropdown', taskId, category, isOpen);
      // 设置当前下拉菜单的状态
      if (isOpen !== null) {
        this.$set(this.dropdowns, key, isOpen);
      } else {
        this.$set(this.dropdowns, key, !this.dropdowns[key]);
      }

      // 关闭其他下拉菜单
      Object.keys(this.dropdowns).forEach(k => {
        if (k !== key && this.dropdowns[k]) {
          this.$set(this.dropdowns, k, false);
        }
      });

      // 添加和移除层级类
      this.$nextTick(() => {
        // 重置所有下拉容器的类
        const allContainers = this.$el.querySelectorAll('.dropdown-container');
        allContainers.forEach(container => {
          container.classList.remove('dropdown-active');
        });

        // 为当前打开的下拉添加高层级类
        if (isOpen !== false && (isOpen === true || this.dropdowns[key])) {
          const currentContainer = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`).closest('.dropdown-container');
          if (currentContainer) {
            currentContainer.classList.add('dropdown-active');

            // 也为父元素添加高层级
            const buttonArea = currentContainer.closest('.p-2.pt-1.flex.flex-wrap.gap-1');
            if (buttonArea) {
              buttonArea.classList.add('dropdown-active');
            }

            // 检测是否需要向上展示下拉菜单
            this.checkDropdownPosition(taskId, category);
          }
        }
      });
    },

    // 检测下拉菜单位置并决定是向上还是向下展示
    checkDropdownPosition(taskId, category) {
      this.$nextTick(() => {
        const buttonElement = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`);
        const dropdownElement = buttonElement?.closest('.dropdown-container')?.querySelector('.dropdown-content');

        if (buttonElement && dropdownElement) {
          const buttonRect = buttonElement.getBoundingClientRect();
          const dropdownHeight = dropdownElement.scrollHeight;
          const dropdownWidth = dropdownElement.scrollWidth;
          const windowHeight = window.innerHeight;
          const windowWidth = window.innerWidth;
          const spaceBelow = windowHeight - buttonRect.bottom;
          // const spaceRight = windowWidth - buttonRect.left;

          // 检测页面底部空间是否足够
          // 如果下方空间不足以显示下拉菜单，则向上展示
          if (spaceBelow < dropdownHeight + 10) { // 添加10px的缓冲
            dropdownElement.classList.add('dropdown-up');
            
            // 检查上方空间是否也不足，如果是则调整样式使菜单高度适应
            const spaceAbove = buttonRect.top;
            if (spaceAbove < dropdownHeight + 10) {
              // 设置最大高度为可用空间减去缓冲
              dropdownElement.style.maxHeight = `${spaceAbove - 10}px`;
            }
          } else {
            dropdownElement.classList.remove('dropdown-up');
            
            // 检查是否有任何底部固定元素（如分页组件）会与下拉菜单重叠
            const paginationElement = document.querySelector('.pagination-component');
            if (paginationElement) {
              const paginationRect = paginationElement.getBoundingClientRect();
              // 如果分页组件会与下拉菜单重叠
              if (buttonRect.bottom + dropdownHeight > paginationRect.top) {
                dropdownElement.classList.add('dropdown-up');
              }
            }
            
            // 检查是否有其他伸展按钮或UI元素会与下拉菜单重叠
            const expandButtons = document.querySelectorAll('.expand-button, .el-button--circle, .pagination-component, [class*="expand"], [class*="float"], [class*="fixed"], [class*="btn"], button[class*="fixed"], .action-button, .floating-button');
            expandButtons.forEach(button => {
              if (!button.contains(buttonElement)) { // 避免检测自身
                const buttonExpandRect = button.getBoundingClientRect();
                // 检测是否会发生重叠
                if (this.checkOverlap(
                  {left: buttonRect.left, right: buttonRect.left + dropdownWidth, top: buttonRect.bottom, bottom: buttonRect.bottom + dropdownHeight},
                  {left: buttonExpandRect.left, right: buttonExpandRect.right, top: buttonExpandRect.top, bottom: buttonExpandRect.bottom}
                )) {
                  dropdownElement.classList.add('dropdown-up');
                }
              }
            });
          }
          
          // 检测左右方向的溢出
          // 右侧溢出处理
          if (buttonRect.left + dropdownWidth > windowWidth) {
            dropdownElement.classList.add('dropdown-right-aligned');
          } else {
            dropdownElement.classList.remove('dropdown-right-aligned');
          }
          
          // 左侧溢出处理
          if (buttonRect.right - dropdownWidth < 0) {
            dropdownElement.classList.add('dropdown-left-aligned');
          } else {
            dropdownElement.classList.remove('dropdown-left-aligned');
          }
        }
      });
    },
    
    // 检测两个矩形是否重叠
    checkOverlap(rect1, rect2) {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },

    isDropdownOpen(taskId, category) {
      const key = `${taskId}-${category}`;
      return !!this.dropdowns[key];
    },

    // 启动延时关闭
    startCloseDropdown(taskId, category) {
      const key = `${taskId}-${category}`;
      this.closeTimers[key] = setTimeout(() => {
        this.$set(this.dropdowns, key, false);
      }, 300); // 300ms的延迟
    },

    // 取消延时关闭
    cancelCloseDropdown(taskId, category) {
      const key = `${taskId}-${category}`;
      if (this.closeTimers[key]) {
        clearTimeout(this.closeTimers[key]);
        delete this.closeTimers[key];
      }
    },

    // 立即关闭特定下拉菜单
    closeDropdown(taskId, category) {
      const key = `${taskId}-${category}`;
      this.$set(this.dropdowns, key, false);

      // 移除高层级类
      this.$nextTick(() => {
        const currentContainer = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`)?.closest('.dropdown-container');
        if (currentContainer) {
          currentContainer.classList.remove('dropdown-active');

          // 检查是否所有下拉菜单都已关闭，如果是则移除按钮区域的高层级类
          const anyOpen = Object.values(this.dropdowns).some(isOpen => isOpen);
          if (!anyOpen) {
            const buttonArea = currentContainer.closest('.p-2.pt-1.flex.flex-wrap.gap-1');
            if (buttonArea) {
              buttonArea.classList.remove('dropdown-active');
            }
          }
        }
      });
    },

    closeAllDropdowns() {
      // 清除所有下拉菜单
      Object.keys(this.dropdowns).forEach(key => {
        if (this.dropdowns[key]) {
          this.$set(this.dropdowns, key, false);
        }
      });

      // 清除所有计时器
      Object.keys(this.closeTimers).forEach(key => {
        clearTimeout(this.closeTimers[key]);
        delete this.closeTimers[key];
      });

      // 移除所有高层级类
      this.$nextTick(() => {
        const allContainers = this.$el.querySelectorAll('.dropdown-container, .p-2.pt-1.flex.flex-wrap.gap-1');
        allContainers.forEach(container => {
          container.classList.remove('dropdown-active');
        });
      });
    },

    isRightAligned(taskId) {
      // 计算元素在网格中的位置，对于最右边列的元素，菜单需要右对齐
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return false;

      // 根据网格布局计算列位置
      // 假设一行3列，则索引为2, 5, 8...的元素在最右侧列
      const colPosition = taskIndex % 3;
      return colPosition === 2; // 第3列元素（索引为2）靠右对齐
    },

    // 检测元素是否应该向上展开（避免与分页组件重叠）
    isBottomAligned(taskId) {
      const taskEl = this.$el.querySelector(`[data-task-id="${taskId}"]`);
      if (!taskEl) return false;

      // 获取元素在页面中的位置
      const rect = taskEl.getBoundingClientRect();
      // 获取视窗高度
      const windowHeight = window.innerHeight;
      // 检查元素底部与视窗底部的距离
      // 如果距离小于150px（或自定义值），则认为靠近底部，应该向上展开
      const distanceToBottom = windowHeight - rect.bottom;

      // 获取分页组件的高度（如果有的话）
      const paginationEl = document.querySelector('.pagination-component'); // 根据实际选择器调整
      const paginationHeight = paginationEl ? paginationEl.offsetHeight : 0;

      // 判断是否会与分页组件重叠
      return distanceToBottom < (200 + paginationHeight); // 调整阈值以适应下拉菜单高度
    },

    // 设置下拉菜单的位置和样式
    setDropdownPosition(taskId) {
      this.$nextTick(() => {
        const dropdownEl = this.$el.querySelector(`[data-dropdown-id="${taskId}"]`);
        if (!dropdownEl) return;

        // 重置样式
        dropdownEl.classList.remove('right-aligned', 'bottom-aligned');

        // 判断是否需要右对齐
        if (this.isRightAligned(taskId)) {
          dropdownEl.classList.add('right-aligned');
        }

        // 判断是否需要向上展开
        if (this.isBottomAligned(taskId)) {
          dropdownEl.classList.add('bottom-aligned');
        }
      });
    },

    // 在打开下拉菜单时调用setDropdownPosition


    // 检测元素及其子元素是否包含事件目标
    contains(element, target) {
      return element === target || element.contains(target);
    },

    getDropdownPosition(taskId, category) {
      // 获取当前任务索引
      const taskIndex = this.tasks.findIndex(task => task.id === taskId || task.id && task.id.toString() === taskId);
      if (taskIndex === -1) return {};

      // 查找按钮元素位置
      const buttonElement = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`);
      if (!buttonElement) return { top: '0px', left: '0px' };

      // 获取按钮位置
      const rect = buttonElement.getBoundingClientRect();

      // 计算弹出层位置 - 改为正下方紧贴按钮
      let left = rect.left;
      let top = rect.bottom; // 紧贴按钮底部

      // 处理右侧元素，防止溢出
      const colPosition = taskIndex % 3;
      if (colPosition === 2) {
        left = rect.right - 160; // 160px是菜单宽度
      }

      // 防止右侧溢出视窗
      const windowWidth = window.innerWidth;
      if (left + 160 > windowWidth) {
        left = windowWidth - 165;
      }

      // 防止底部溢出
      const windowHeight = window.innerHeight;
      const menuHeight = 200; // 估计的菜单最大高度
      if (top + menuHeight > windowHeight) {
        top = rect.top - menuHeight; // 将菜单放在按钮上方
      }

      return {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        maxHeight: '200px',
        zIndex: 1000
      };
    },

    closeSpecificDropdown(taskId, category) {
      this.toggleDropdown(taskId, category, false);
    },

    // 处理窗口大小变化
    handleResize() {
      // 检查所有打开的下拉菜单
      Object.keys(this.dropdowns).forEach(key => {
        if (this.dropdowns[key]) {
          const [taskId, category] = key.split('-');
          if (taskId && category) {
            // 添加延迟，确保DOM已经完全更新
            setTimeout(() => {
              this.checkDropdownPosition(taskId, category);
            }, 50);
          }
        }
      });
      
      // 重新计算宽高比
      this.calculateAspectRatio();
      
      // 关闭所有不应再显示的下拉菜单
      this.ensureVisibleDropdowns();
    },
    
    // 确保只有可视的下拉菜单保持打开
    ensureVisibleDropdowns() {
      this.$nextTick(() => {
        Object.keys(this.dropdowns).forEach(key => {
          if (this.dropdowns[key]) {
            const [taskId, category] = key.split('-');
            if (taskId && category) {
              const buttonElement = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`);
              if (!buttonElement || !this.isElementInViewport(buttonElement)) {
                this.closeDropdown(taskId, category);
              }
            }
          }
        });
      });
    },
    
    // 检查元素是否在视口内
    isElementInViewport(el) {
      if (!el) return false;
      
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // 检查任务是否有重新生成按钮
    hasRerollButton(task) {
      if (!task.buttons || !task.buttons.length) return false;

      // 寻找自定义ID包含reroll的按钮
      return task.buttons.some(btn => btn.customId && btn.customId.includes('reroll'));
    },

    // 处理重新生成操作
    handleReroll(task) {
      // 寻找重新生成按钮
      const rerollButton = task.buttons.find(btn => btn.customId && btn.customId.includes('reroll'));
      if (rerollButton) {
        // 获取任务ID
        const taskId = task.id || task.taskId;
        if (!taskId) {
          console.error('无法获取任务ID，无法开始轮询');
          return;
        }

        // 回到第一页
        if (this.currentPage !== 1) {
          this.currentPage = 1;
          this.$emit('page-change', 1);
        }

        console.log(`触发重新生成操作，任务ID: ${taskId}`);

        // 直接使用 handleMjAction 处理，它会自动启动轮询
        this.handleMjAction(task, rerollButton);
      }
    },

    getTaskPrompt(task) {
      // 从不同可能的数据结构中获取提示词
      let prompt = '';
      if (task.promptFull) {
        prompt = task.promptFull;
      } else {
        // 如果有任何包含 prompt 字样的属性，尝试使用
        const promptKeys = Object.keys(task).filter(key =>
          key.toLowerCase().includes('prompt') && typeof task[key] === 'string');

        if (promptKeys.length > 0) {
          prompt = task[promptKeys[0]];
        }
      }

      // 确保提示词不包含会破坏布局的特殊字符序列
      return this.sanitizePrompt(prompt);
    },

    // 清理提示词中可能导致布局问题的内容
    sanitizePrompt(text) {
      if (!text) return '';

      // 移除可能导致显示问题的特殊字符序列
      return text;
    },

    // 处理长文本截断显示
    truncateText(text, maxLength = 200) { // 减少最大长度
      if (!text) return '';
      if (text.length <= maxLength) return text;

      // 找到合适的截断点，避免在单词中间截断
      const breakPoint = text.lastIndexOf(' ', maxLength);
      const truncatePoint = breakPoint > maxLength / 2 ? breakPoint : maxLength;

      return text.substring(0, truncatePoint) + '...';
    },

    // 保持提示框可见
    keepTooltipVisible(event) {
      // 给当前元素添加active类
      event.currentTarget.classList.add('active');
    },

    // 隐藏提示框
    hideTooltip(event) {
      // 移除active类
      event.currentTarget.classList.remove('active');
    },

    // 获取任务进度百分比
    getProgressPercentage(task) {
      // 尝试从不同可能的结构中获取进度
      let progress = '';

      if (task.displays && task.displays.process) {
        progress = task.displays.process;
      } else if (task.process) {
        progress = task.process;
      } else if (task.progress) {
        progress = task.progress;
      }

      // 如果进度是数字，确保它是百分比格式
      if (progress !== '' && !isNaN(progress)) {
        // 如果进度是小数（如0.65），转换为百分比
        if (parseFloat(progress) <= 1) {
          return (parseFloat(progress) * 100).toFixed(0) + '%';
        }
        // 如果已经是整数百分比（如65），确保加上%符号
        return parseInt(progress) + '%';
      }

      // 如果进度已经包含%符号或无法解析，直接返回
      return progress || '0%';
    },
    // 公共方法：刷新所有未完成任务的状态
    refreshAllTasks() {
      console.log('正在刷新所有未完成任务状态');

      // 计数器，用于统计未完成任务数量
      let pendingTaskCount = 0;

      // 查找所有未完成任务并单独更新状态
      this.tasks.forEach(task => {
        const taskId = task.id || task.taskId;
        if (!taskId) return;

        const status = task.status;
        if (status && ['SUBMITTED', 'IN_PROGRESS', 'PENDING', 'NOT_START','MODAL'].includes(status)) {
          console.log('status', status);

          pendingTaskCount++;

          // 对所有未完成任务，直接立即更新一次状态
          this.fetchTaskStatus(taskId);

          // 如果还没有设置轮询，则开始轮询
          if (!this.pollingTasks[taskId]) {
            this.startPollingTask(taskId);
          }
        }
      });

      console.log(`共发现 ${pendingTaskCount} 个未完成任务需要更新状态`);
    },

    // 公共方法：刷新指定任务的状态
    refreshTask(taskId) {
      if (!taskId) return;

      console.log(`正在刷新任务 ${taskId} 状态`);

      // 直接更新任务状态
      this.fetchTaskStatus(taskId);

      // 如果还没有设置轮询且任务在列表中，则启动轮询
      if (!this.pollingTasks[taskId]) {
        const task = this.tasks.find(t => (t.id === taskId || t.taskId === taskId));
        if (task) {
          const status = task.displays?.status || task.status;
          if (status && ['SUBMITTED', 'IN_PROGRESS', 'PENDING','MODAL'].includes(status)) {
            this.startPollingTask(taskId);
          }
        }
      }
    },

    // 计算屏幕比例并设置卡片宽高比
    calculateAspectRatio() {
      // 获取屏幕宽高
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // 计算屏幕宽高比
      const screenRatio = screenWidth / screenHeight;
      
      // 根据屏幕比例和面板状态调整卡片宽高比
      let newAspectRatio;
      let paddingBottom;
      
      // 展开设置时（左侧面板显示）- 图片高度降低，避免太高
      if (!this.isPanelCollapsed) {
        if (screenRatio > 1.8) { // 极宽屏
          newAspectRatio = "5/5.5"; // 降低高度，避免太高
          paddingBottom = "110%";
        } else if (screenRatio > 1.5) { // 宽屏
          newAspectRatio = "5/4"; // 降低高度，避免太高
          paddingBottom = "80%";
        } else if (screenRatio > 1.3) { // 普通屏幕
          newAspectRatio = "5/5.5"; // 降低高度，避免太高
          paddingBottom = "110%";
        } else if (screenRatio > 1) { // 接近方形的屏幕
          newAspectRatio = "4/4.5"; // 降低高度，避免太高
          paddingBottom = "112.5%";
        } else { // 竖屏
          newAspectRatio = "3/4"; // 降低高度，避免太高
          paddingBottom = "133.33%";
        }
      }
      // 关闭设置时（左侧面板隐藏）- 保持原来的设置
      else {
        if (screenRatio > 1.8) { // 极宽屏
          newAspectRatio = "20/9.5"; // 降低高度，避免滚动条
          paddingBottom = "47.5%";
        } else if (screenRatio > 1.5) { // 宽屏
          newAspectRatio = "16/9.5"; // 降低高度，避免滚动条
          paddingBottom = "59.375%";
        } else if (screenRatio > 1.3) { // 普通屏幕
          newAspectRatio = "5/3.5"; // 降低高度，避免滚动条
          paddingBottom = "70%";
        } else if (screenRatio > 1) { // 接近方形的屏幕
          newAspectRatio = "3/2.5"; // 降低高度，避免滚动条
          paddingBottom = "83.33%";
        } else { // 竖屏
          newAspectRatio = "1/1.5"; // 降低高度，避免滚动条
          paddingBottom = "150%";
        }
      }
      
      // 更新宽高比
      this.aspectRatio = newAspectRatio;
      
      // 直接在文档根元素上设置CSS变量
      document.documentElement.style.setProperty('--card-aspect-ratio', newAspectRatio);
      document.documentElement.style.setProperty('--card-padding-bottom', paddingBottom);
      
      console.log(`面板状态: ${this.isPanelCollapsed ? '收缩' : '展开'}, 屏幕宽高比: ${screenRatio.toFixed(2)}, 设置卡片宽高比: ${newAspectRatio}, padding-bottom: ${paddingBottom}`);
      
      // 更新页面上已有的卡片
      this.$nextTick(() => {
        this.applyAspectRatioStyles();
      });
    },

    // 在DOM更新后应用样式
    applyAspectRatioStyles() {
      // 触发重渲染或者强制样式计算
      // 这可能在某些浏览器中是必要的，以确保CSS变量被正确应用
      const elements = this.$el.querySelectorAll('.aspect-ratio-custom');
      if (elements.length) {
        // 触发重新计算
        elements[0].getBoundingClientRect();
      }
    },

    // 处理页面滚动
    handleScroll() {
      // 使用防抖动处理以提高性能
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }
      
      this.scrollTimer = setTimeout(() => {
        // 检查所有打开的下拉菜单
        Object.keys(this.dropdowns).forEach(key => {
          if (this.dropdowns[key]) {
            const [taskId, category] = key.split('-');
            if (taskId && category) {
              const buttonElement = this.$el.querySelector(`[data-task-id="${taskId}"][data-category="${category}"]`);
              
              // 如果按钮不在视图中，关闭菜单
              if (!buttonElement || !this.isElementInViewport(buttonElement)) {
                this.closeDropdown(taskId, category);
              } else {
                // 否则重新计算位置
                this.checkDropdownPosition(taskId, category);
              }
            }
          }
        });
      }, 100); // 100ms的防抖延迟
    },
  }
};
</script>

<style>
/* 全局样式重置，确保我们的加载动画不受 Element UI 影响 */
.pandora-spinner *,
.pandora-spinner *::before,
.pandora-spinner *::after {
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>

<style scoped>
@import '@/assets/taskQueue.css';

/* 为下拉菜单添加特定颜色样式 */
.dropdown-container[data-category="upsample"] .dropdown-content {
  border-color: rgba(59, 130, 246, 0.3); /* blue-500 透明度 30% */
}
.dropdown-container[data-category="variation"] .dropdown-content {
  border-color: rgba(16, 185, 129, 0.3); /* green-500 透明度 30% */
}
.dropdown-container[data-category="pan"] .dropdown-content {
  border-color: rgba(168, 85, 247, 0.3); /* purple-500 透明度 30% */
}
.dropdown-container[data-category="zoom_out"] .dropdown-content {
  border-color: rgba(245, 158, 11, 0.3); /* amber-500 透明度 30% */
}

/* 暗色模式下的边框颜色 */
.dark .dropdown-container[data-category="upsample"] .dropdown-content {
  border-color: rgba(96, 165, 250, 0.3); /* blue-400 透明度 30% */
}
.dark .dropdown-container[data-category="variation"] .dropdown-content {
  border-color: rgba(52, 211, 153, 0.3); /* green-400 透明度 30% */
}
.dark .dropdown-container[data-category="pan"] .dropdown-content {
  border-color: rgba(192, 132, 252, 0.3); /* purple-400 透明度 30% */
}
.dark .dropdown-container[data-category="zoom_out"] .dropdown-content {
  border-color: rgba(251, 191, 36, 0.3); /* amber-400 透明度 30% */
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes appear-scale {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes rotate360 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-2px); }
  40%, 80% { transform: translateX(2px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 下拉菜单样式 */
.dropdown-content {
  position: absolute;
  z-index: 1000;
  min-width: 160px;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(209, 213, 219, 0.4);
  overflow: hidden;
  top: calc(100% + 0.5rem);
  left: 0;
  transform-origin: top left;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  visibility: visible;
  transform: scale(0.95) translateY(-0.5rem);
  animation: fadeIn 0.2s ease forwards;
}

.dark .dropdown-content {
  background-color: rgba(31, 41, 55, 0.98);
  border-color: rgba(55, 65, 81, 0.4);
}

.dropdown-up {
  top: auto;
  bottom: calc(100% + 0.5rem);
  transform-origin: bottom left;
  transform: scale(0.95) translateY(0.5rem);
}

/* 添加左右对齐样式 */
.dropdown-right-aligned {
  left: auto;
  right: 0;
  transform-origin: top right;
}

.dropdown-left-aligned {
  left: 0;
  right: auto;
  transform-origin: top left;
}

/* 组合样式 */
.dropdown-up.dropdown-right-aligned {
  transform-origin: bottom right;
}

.dropdown-up.dropdown-left-aligned {
  transform-origin: bottom left;
}

/* 给下拉菜单添加z-index，确保在其他元素之上 */
.dropdown-container.dropdown-active .dropdown-content {
  z-index: 1050;
}

/* 添加滚动样式，当内容过多时可以滚动 */
.dropdown-content {
  max-height: 300px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

/* 自定义滚动条样式 */
.dropdown-content::-webkit-scrollbar {
  width: 4px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
}

.dropdown-content::-webkit-scrollbar-thumb {
  background-color: rgba(209, 213, 219, 0.5);
  border-radius: 4px;
}

.dark .dropdown-content::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

.dark .dropdown-content::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

/* Dropdown visibility control */
.dropdown-container .dropdown-content:not([v-show="false"]) {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.15s ease;
}

/* Empty state styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 10rem);
  width: 100%;
  text-align: center;
}

.empty-state-card {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 24rem;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.empty-state-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.empty-state-icon {
  margin-bottom: 1rem;
  color: rgba(209, 213, 219, 0.8);
}

.empty-state-heading {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(55, 65, 81, 0.9);
}

.empty-state-text {
  color: rgba(156, 163, 175, 0.9);
  font-size: 0.875rem;
}

.dark .empty-state-card {
  background-color: #1f2937;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
}

.dark .empty-state-icon {
  color: rgba(75, 85, 99, 0.8);
}

.dark .empty-state-heading {
  color: rgba(209, 213, 219, 0.9);
}

.dark .empty-state-text {
  color: rgba(156, 163, 175, 0.8);
}

/* 动画效果 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
