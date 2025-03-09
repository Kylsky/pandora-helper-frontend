<template>
  <div>
    <!-- 使用Teleport将遮罩传送到body -->
    <teleport to="body" :disabled="!isTeleportSupported">
      <div 
        v-if="localVisible" 
        class="fixed inset-0 bg-black bg-opacity-50 z-[9999] transition-opacity drawer-overlay"
        @click="updateVisible(false)"
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;">
      </div>
    </teleport>
    
    <!-- 抽屉主体 -->
    <div 
      class="fixed top-0 right-0 bottom-0 z-[10000] transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-xl flex flex-col drawer-body"
      :class="[
        localVisible ? 'translate-x-0' : 'translate-x-full',
        isMobile ? 'w-3/4' : 'w-[450px]'
      ]">
      
      <!-- 抽屉标题 -->
      <div class="flex-none flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
            <path d="M12 2v2"></path>
            <path d="M12 22v-2"></path>
            <path d="M20 12h-2"></path>
            <path d="M4 12H6"></path>
          </svg>
          <span class="text-base font-medium text-gray-800 dark:text-gray-100">高级绘图设置</span>
        </div>
        <button 
          @click="updateVisible(false)"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="relative flex-1 flex flex-col overflow-hidden">
        <!-- 内容滚动区域 -->
        <div class="absolute inset-0 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div class="p-4 md:p-6 space-y-6 md:space-y-8 pb-28">
            <!-- 基础设置组 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div class="flex items-center mb-4">
                <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span class="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">基础设置</span>
                <div class="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent ml-3"></div>
              </div>
              
              <div class="space-y-4">
                <!-- 版本选择 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">版本选择</label>
                  <div class="relative">
                    <select 
                      v-model="formData.version" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="--v 6.1">MJ V6.1 (最新)</option>
                      <option value="--v 6">MJ V6</option>
                      <option value="--v 5.2">MJ V5.2</option>
                      <option value="--v 5.1">MJ V5.1</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">选择 Midjourney 的版本，不同版本的绘图效果会有差异</p>
                </div>

                <!-- 文本权重 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">文本权重</label>
                  <div class="relative">
                    <select 
                      v-model="formData.imageWeight" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="">默认(0.25)</option>
                      <option value="--iw 0.5">0.5</option>
                      <option value="--iw 1">1.0</option>
                      <option value="--iw 2">2.0</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">调整提示词与图像之间的权重平衡</p>
                </div>
              </div>
            </div>

            <!-- 高级设置组 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div class="flex items-center mb-4">
                <svg class="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                </svg>
                <span class="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">高级设置</span>
                <div class="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent ml-3"></div>
              </div>
              
              <div class="space-y-4">
                <!-- 视角设置 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">视角</label>
                  <div class="relative">
                    <select 
                      v-model="formData.perspective" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="">默认</option>
                      <option value="first person">第一人称视角</option>
                      <option value="third person">第三人称视角</option>
                      <option value="top view">俯视角</option>
                      <option value="bottom view">仰视角</option>
                      <option value="side view">侧视角</option>
                      <option value="long shot">远景</option>
                      <option value="close-up">近景</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">控制观察场景的视角和距离</p>
                </div>

                <!-- 人物镜头 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">人物镜头</label>
                  <div class="relative">
                    <select 
                      v-model="formData.shot" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="">默认</option>
                      <option value="full body">全身镜头</option>
                      <option value="half body">半身镜头</option>
                      <option value="close-up shot">特写镜头</option>
                      <option value="extreme close-up">超近特写</option>
                      <option value="wide shot">全景镜头</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">调整人物在画面中的取景范围</p>
                </div>

                <!-- 灯光设置 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">灯光</label>
                  <div class="relative">
                    <select 
                      v-model="formData.lighting" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="">默认</option>
                      <option value="natural light">自然光</option>
                      <option value="soft light">柔和光</option>
                      <option value="hard light">强光</option>
                      <option value="backlight">逆光</option>
                      <option value="ambient light">环境光</option>
                      <option value="spotlight">聚光灯</option>
                      <option value="neon light">霓虹灯</option>
                      <option value="cinematic light">电影灯光</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">设置场景中的光源类型和效果</p>
                </div>

                <!-- 随机种子 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">随机种子</label>
                  <div class="flex items-center">
                    <input 
                      type="number" 
                      v-model.number="formData.seed" 
                      min="0" 
                      max="4294967295"
                      placeholder="输入随机种子"
                      class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                    />
                    <button 
                      @click="generateRandomSeed"
                      class="ml-1 p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-r-md transition-colors"
                      title="生成随机种子">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">设置相同的种子可以生成相似的图像</p>
                </div>
                
                <!-- 渲染质量 -->
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">渲染质量</label>
                  <div class="relative">
                    <select 
                      v-model="formData.quality" 
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      <option value="">默认(1.0)</option>
                      <option value="--quality 0.25">0.25 (低质量/快速)</option>
                      <option value="--quality 0.5">0.5</option>
                      <option value="--quality 2">2.0 (高质量/慢速)</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">较高的质量需要更长的渲染时间</p>
                </div>
                
                <!-- 风格强度滑块 -->
                <div class="w-full">
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">风格强度</label>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ getStylizeLabel(formData.stylize) }}</span>
                  </div>
                  <div class="flex items-center">
                    <div class="slider-container relative w-full flex-1 mr-3 h-10 flex items-center"
                      @mouseenter="sliderHovered = true" 
                      @mouseleave="sliderHovered = false"
                      @click="onSliderClick"
                      @touchstart="onSliderTouch">
                      <div class="slider-track h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full absolute"></div>
                      <div class="slider-progress h-2 rounded-full absolute left-0 bg-gradient-to-r from-blue-500 to-purple-500" 
                        :style="{width: `${formData.stylize/10}%`}"
                        :class="{'no-transition': isSliding}"></div>
                      <input
                        type="range"
                        v-model.number="formData.stylize"
                        min="0"
                        max="1000"
                        step="10"
                        class="slider-input w-full absolute opacity-0 cursor-pointer"
                        @input="onSliderInput"
                        @touchstart="onSliderInput"
                        @touchmove="onSliderInput"
                      >
                      <div class="slider-thumb absolute w-5 h-5 rounded-full bg-white dark:bg-gray-200 shadow-md border-2 border-purple-500 transform -translate-y-1/2 top-1/2 pointer-events-none" 
                        :class="{'scale-110': sliderHovered, 'scale-125': isSliding}"
                        :style="{left: `calc(${formData.stylize/10}% - 10px)`}">
                      </div>
                    </div>
                    <span class="min-w-[60px] text-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                      :class="{'ring-2 ring-purple-500 ring-opacity-50': isSliding}">
                      {{ formData.stylize }}
                    </span>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-2 px-1">
                    <span class="font-medium text-blue-600 dark:text-blue-400">写实风格</span>
                    <span class="font-medium text-purple-600 dark:text-purple-400">平衡</span>
                    <span class="font-medium text-pink-600 dark:text-pink-400">艺术风格</span>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">控制风格化的程度，值越高越偏向艺术风格</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 - 固定在抽屉底部 -->
      <div class="flex-none z-10 p-4 bg-white dark:bg-gray-800 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 shadow-md">
        <button
          class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center text-sm font-medium transition-colors"
          @click="resetToDefault">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          重置默认
        </button>
        
        <button
          class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow-sm hover:from-blue-600 hover:to-indigo-700 flex items-center text-sm font-medium transition-colors"
          @click="applySettings">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          应用设置
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    initFormData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localVisible: this.visible,
      isTeleportSupported: typeof Teleport !== 'undefined',
      defaultFormData: {
        version: '--v 6.1',
        imageWeight: '',
        perspective: '',
        shot: '',
        lighting: '',
        seed: '',
        quality: '',
        stylize: 100,
        aspectRatio: ''
      },
      formData: {
        version: '--v 6.1',
        imageWeight: '',
        perspective: '',
        shot: '',
        lighting: '',
        seed: '',
        quality: '',
        stylize: 100,
        aspectRatio: '',
        ...this.initFormData
      },
      aspectRatioOptions: [
        { value: "", label: "默认(1:1)", shortLabel: "1:1", shape: "1/1" },
        { value: "--ar 16:9", label: "16:9 宽屏", shortLabel: "16:9", shape: "16/9" },
        { value: "--ar 9:16", label: "9:16 竖屏", shortLabel: "9:16", shape: "9/16" },
        { value: "--ar 4:3", label: "4:3 标准", shortLabel: "4:3", shape: "4/3" },
        { value: "--ar 3:4", label: "3:4 竖向", shortLabel: "3:4", shape: "3/4" },
        { value: "--ar 3:2", label: "3:2 风景", shortLabel: "3:2", shape: "3/2" }
      ],
      sliderHovered: false,
      isSliding: false
    };
  },
  watch: {
    visible(newVal) {
      this.localVisible = newVal;
    },
    initFormData: {
      handler(newVal) {
        this.formData = {
          ...this.formData,
          ...newVal
        };
      },
      deep: true
    }
  },
  mounted() {
    // 添加全局鼠标释放事件监听
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchend', this.onMouseUp);
  },
  beforeUnmount() {
    // 移除事件监听器以防内存泄漏
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchend', this.onMouseUp);
  },
  methods: {
    updateVisible(val) {
      this.localVisible = val;
      this.$emit('update:visible', val);
    },
    applySettings() {
      // 触发事件并传递设置
      this.$emit('apply', this.formData);
      // 关闭抽屉
      this.updateVisible(false);
      
      // 显示成功信息
      this.showMessage('已应用设置', 'success');
    },
    resetToDefault() {
      this.formData = {...this.defaultFormData};
      this.showMessage('已重置为默认设置', 'success');
    },
    generateRandomSeed() {
      this.formData.seed = Math.floor(Math.random() * 4294967295);
      this.showMessage('已生成随机种子: ' + this.formData.seed, 'success');
    },
    formatStylizeTooltip(val) {
      if (val < 300) return '写实风格';
      if (val < 700) return '平衡';
      return '艺术风格';
    },
    getStylizeLabel(val) {
      if (val < 300) return '写实风格';
      if (val < 700) return '平衡';
      return '艺术风格';
    },
    onSliderInput() {
      this.isSliding = true;
      
      // 移除动画过渡以实现即时响应
      // 确保DOM更新优先级最高
      this.$nextTick(() => {
        // 强制浏览器重绘
        window.requestAnimationFrame(() => {
          const progressEl = document.querySelector('.slider-progress');
          if (progressEl) {
            progressEl.style.width = `${this.formData.stylize/10}%`;
          }
        });
      });
    },
    // 替代 element-ui 的消息组件
    showMessage(message, type = 'info') {
      // 由于我们没有 Element UI 的消息组件，这里我们可以通过事件来传递消息
      // 或者实现一个简单的消息组件
      this.$emit('show-message', { message, type });
      
      // 也可以使用原生 alert，但不推荐
      // alert(message);
    },
    onMouseUp() {
      this.isSliding = false;
    },
    onSliderClick(event) {
      // 获取滑块轨道的位置信息
      const sliderTrack = event.currentTarget.querySelector('.slider-track');
      if (!sliderTrack) return;
      
      const trackRect = sliderTrack.getBoundingClientRect();
      // 计算点击位置在轨道上的相对位置 (0-1)
      const relativePosition = Math.max(0, Math.min(1, (event.clientX - trackRect.left) / trackRect.width));
      
      // 根据相对位置设置值 (0-1000)
      this.formData.stylize = Math.round(relativePosition * 1000 / 10) * 10;
      this.onSliderInput();
    },
    onSliderTouch(event) {
      // 防止页面滚动
      event.preventDefault();
      
      // 模拟点击事件处理
      if (event.touches && event.touches[0]) {
        const touchEvent = {
          currentTarget: event.currentTarget,
          clientX: event.touches[0].clientX
        };
        this.onSliderClick(touchEvent);
      }
    }
  }
};
</script>

<style scoped>
/* 使用原生CSS进行微调，大部分样式已通过Tailwind类实现 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #8b5cf6;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.dark input[type="range"]::-webkit-slider-thumb {
  background: #f3f4f6;
  border-color: #8b5cf6;
}

/* Firefox */
input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #8b5cf6;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.dark input[type="range"]::-moz-range-thumb {
  background: #f3f4f6;
  border-color: #8b5cf6;
}

/* 自定义滑块样式 */
.slider-container {
  touch-action: none;
}

.slider-input {
  height: 40px;
  margin: 0;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

.slider-track {
  z-index: 0;
}

.slider-progress {
  z-index: 1;
  transition: width 0.1s ease-out;
}

.no-transition {
  transition: none !important;
}

.slider-thumb {
  z-index: 3;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.slider-container:hover .slider-thumb {
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.15);
}

.slider-input:active + .slider-thumb {
  transform: translateY(-50%) scale(1.3) !important;
  box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.25) !important;
  border-color: #7c3aed !important;
}

/* 禁用原生滑块外观 */
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px; 
  height: 25px;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
}

.slider-input::-moz-range-thumb {
  width: 25px; 
  height: 25px;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
}

/* 确保遮罩能够正确覆盖所有内容 */
:deep(.drawer-overlay) {
  position: fixed !important;
  z-index: 9999 !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  pointer-events: auto !important;
}

/* 确保抽屉主体显示在最上层 */
:deep(.drawer-body) {
  position: fixed !important;
  z-index: 10000 !important;
  pointer-events: auto !important;
  /* 确保不受 NaviPage.vue 影响 */
  isolation: isolate;
}
</style> 