<template>
  <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.03),0_1px_2px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.15),0_1px_3px_rgb(0,0,0,0.1)] overflow-hidden border border-gray-100/60 dark:border-gray-700/40">
    <div class="px-8 py-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-900/80">
      <h2 class="text-xl font-medium text-gray-800 dark:text-gray-100 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        绘图设置
      </h2>
    </div>
    
    <div class="p-6">
      <el-form ref="form" :model="formData" label-position="top" class="space-y-4">
        <!-- 提示词输入 -->
        <el-form-item label="提示词" prop="prompt" class="mb-4">
          <el-input 
            type="textarea" 
            v-model="formData.prompt" 
            :rows="3" 
            placeholder="例如：一只可爱的猫咪坐在窗台上，阳光洒在它的身上..."
            class="w-full prompt-textarea">
          </el-input>
        </el-form-item>
        
        
        <!-- 宽高比例选择 -->
        <el-form-item label="宽高比例" class="mb-4">
          <el-select 
            v-model="formData.aspectRatio" 
            placeholder="选择宽高比例" 
            class="w-full aspect-ratio-select">
            <el-option 
              v-for="option in aspectRatioOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
              class="group !h-auto aspect-ratio-option">
              <div class="flex items-center py-2">
                <div class="aspect-ratio-preview mr-3 flex-shrink-0" v-if="option.value">
                  <div class="aspect-ratio-box" :style="getAspectRatioStyle(option.shape)"></div>
                </div>
                <div class="default-ratio-preview mr-3 flex-shrink-0" v-else>
                  <div class="flex items-center justify-center w-full h-full text-blue-500 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-2h10v10H5V3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex flex-col">
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {{ option.label }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400" v-if="option.description">
                    {{ option.description }}
                  </div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 否定提示词区域 -->
        <!-- <el-form-item label="否定提示词" class="mb-40">
          <el-input 
            type="textarea" 
            v-model="formData.negativePrompt" 
            :rows="1" 
            placeholder="填写你不想出现的元素"
            class="w-full negative-prompt-textarea">
          </el-input>
        </el-form-item> -->
        

        
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
          <div class="space-y-2">
            <div class="relative group">
                <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-50/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 shadow-inner"
                    @click="triggerFileUpload" 
                    @dragover.prevent 
                    @drop.prevent="handleDrop">
                  <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" multiple accept="image/*">
                  <div class="flex flex-col items-center justify-center py-3 group-hover:scale-105 transition-all duration-300">
                    <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                      <svg class="w-6 h-6 text-blue-500/80 dark:text-blue-400/80 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">点击或拖拽上传图片</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">支持多张图片</span>

                    <!-- 动画线条装饰 -->
                    <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" style="transform: translateX(-100%); animation: slideRight 2.5s ease-in-out infinite;"></div>
                      <div class="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" style="transform: translateX(100%); animation: slideLeft 2.5s ease-in-out infinite;"></div>
                      <div class="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/50 to-transparent" style="transform: translateY(-100%); animation: slideDown 2.5s ease-in-out infinite;"></div>
                      <div class="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/50 to-transparent" style="transform: translateY(100%); animation: slideUp 2.5s ease-in-out infinite;"></div>
                    </div>
                  </div>
                </div>
              </div>

            <div v-if="imageList && imageList.length > 0" 
                class="grid grid-cols-4 gap-3 overflow-y-auto mt-4" 
                style="max-height: min(220px, calc(100vh - 45rem));">
              <div v-for="(image, index) in imageList" 
                  :key="index" 
                  class="relative group rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                <img :src="image.url" 
                    class="w-full h-16 object-cover transition-all duration-500 group-hover:scale-110" 
                    @click="previewImage(image.url)">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <button class="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 hover:bg-white/20 transition-all duration-300 shadow-lg transform group-hover:scale-105"
                          @click.stop="removeImage(index)">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 添加图片序号指示 -->
                <div class="absolute top-0 right-0 bg-blue-500/80 dark:bg-blue-600/80 text-white text-xs font-medium px-1.5 py-0.5 rounded-bl-lg">
                  #{{ index + 1 }}
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
            @click="showSettings">
            <i class="el-icon-setting mr-2 text-lg"></i>
            <span class="text-sm font-medium">高级设置</span>
          </el-button>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="w-full h-12 !rounded-xl bg-gradient-to-r from-[#1A9168] to-[#18825E] hover:from-[#158055] hover:to-[#13704D] border-0 text-base font-medium shadow-lg shadow-[#1A9168]/20 hover:shadow-xl hover:shadow-[#1A9168]/30 transform hover:-translate-y-0.5 transition-all duration-300 !flex !items-center !justify-center" 
            :loading="loading"
            @click="handleSubmit">
            <div class="flex items-center justify-center w-full">
              <i v-if="!loading" class="el-icon-picture-outline mr-2 text-xl"></i>
              <span class="relative">
                {{ loading ? '绘图中...' : '开始绘图' }}
                <span v-if="!loading" class="absolute -bottom-1 left-0 w-full h-[1px] bg-white/40"></span>
              </span>
            </div>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromptForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    initialFormData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {
        prompt: '',
        negativePrompt: '',
        referenceImage: null,
        modelId: 'mj',
        aspectRatio: '',
        ...this.initialFormData
      },
      selectedStyle: '',
      imageList: [],
      presetStyles: [
        { name: '写实摄影', description: '高度真实感的照片效果' },
        { name: '水彩画', description: '柔和的水彩画风格' },
        { name: '插画', description: '现代数字插画风格' },
        { name: '油画', description: '传统油画质感' },
        { name: '赛博朋克', description: '未来科技与复古元素混合' },
        { name: '动漫', description: '日式动漫风格' },
        { name: '素描', description: '铅笔素描效果' },
        { name: '像素艺术', description: '复古像素风格' }
      ],
      aiModels: [
        {
          id: 'mj',
          name: 'MJ',
          description: '真实感极强'
        },
        {
          id: 'niji',
          name: 'Niji',
          description: '卡通动漫'
        },
        {
          id: 'dall-e-3',
          name: 'Dall-E 3',
          description: '自然语言理解好'
        },
        {
          id: 'flux',
          name: 'Flux',
          description: '出色图像质量与多样性'
        },
        {
          id: 'sd3',
          name: 'SD3 Large Turbo',
          description: '稳定高速扩展'
        },
        {
          id: 'sdxl',
          name: 'SDXL',
          description: '文本生成精美图像'
        },
        {
          id: 'sd-core',
          name: 'Stable Image Core',
          description: '高速稳定的质量'
        },
        {
          id: 'sd-ultra',
          name: 'Stable Image Ultra',
          description: '画面清晰力度拟真'
        }
      ],
      aspectRatioOptions: [
        { value: '', label: '默认', shape: { width: 1, height: 1 },description: '默认使用1:1方形比例' },
        { value: '--ar 16:9', label: '16:9', shape: { width: 16, height: 9 }, description: '宽屏景观比例' },
        { value: '--ar 4:3', label: '4:3', shape: { width: 4, height: 3 }, description: '标准显示比例' },
        { value: '--ar 9:16', label: '9:16', shape: { width: 9, height: 16 }, description: '竖屏手机比例' },
        { value: '--ar 3:4', label: '3:4', shape: { width: 3, height: 4 }, description: '竖向照片比例' },
        { value: '--ar 3:2', label: '3:2', shape: { width: 3, height: 2 }, description: '风景照片比例' },
        { value: '--ar 2:3', label: '2:3', shape: { width: 2, height: 3 }, description: '人像照片比例' }
      ]
    };
  },
  mounted() {
    // 添加全局样式，处理深色模式下的弹出层样式
    this.addGlobalStyles();
  },
  watch: {
    initialFormData: {
      handler(newVal) {
        this.formData = {
          ...this.formData,
          ...newVal
        };
      },
      deep: true
    }
  },
  created() {
    // 从localStorage读取收缩状态
    const savedCollapsedState = localStorage.getItem('promptFormCollapsed');
    if (savedCollapsedState !== null) {
      this.isCollapsed = savedCollapsedState === 'true';
    }
  },
  methods: {
    addGlobalStyles() {
      // 检查是否已存在样式
      const styleId = 'element-plus-dark-mode-fixes';
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          /* 深色模式下弹出层样式 */
          .dark .el-popper.is-light {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #e5e7eb !important;
          }
          
          .dark .el-select-dropdown__item {
            color: #e5e7eb !important;
          }
          
          .dark .el-select-dropdown__item.hover, 
          .dark .el-select-dropdown__item:hover {
            background-color: rgba(59, 130, 246, 0.15) !important;
          }
          
          .dark .el-popper.is-light .el-popper__arrow::before {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
          }
          
          .dark .el-textarea__inner,
          .dark .el-input__inner {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #e5e7eb !important;
          }
          
          .dark .el-textarea__inner::placeholder,
          .dark .el-input__inner::placeholder {
            color: #6b7280 !important;
          }
        `;
        document.head.appendChild(styleElement);
      }
    },
    triggerFileUpload() {
      if (!this.loading) {
        this.$refs.fileInput.click();
      }
    },
    
    handleFileChange(e) {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      Array.from(files).forEach(file => {
        // 检查文件类型
        if (!file.type.match('image.*')) {
          this.$message.error('请上传图片文件');
          return;
        }
        
        // 检查文件大小，限制为10MB
        if (file.size > 10 * 1024 * 1024) {
          this.$message.error('图片大小不能超过10MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          // 将图片添加到列表中
          this.imageList.push({
            file: file,
            url: event.target.result
          });
          
          // 第一张图片作为参考图片
          if (!this.formData.referenceImage) {
            this.formData.referenceImage = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
    },
    
    handleDrop(e) {
      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;
      
      Array.from(files).forEach(file => {
        // 检查文件类型
        if (!file.type.match('image.*')) {
          this.$message.error('请上传图片文件');
          return;
        }
        
        // 检查文件大小，限制为10MB
        if (file.size > 10 * 1024 * 1024) {
          this.$message.error('图片大小不能超过10MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          // 将图片添加到列表中
          this.imageList.push({
            file: file,
            url: event.target.result
          });
          
          // 第一张图片作为参考图片
          if (!this.formData.referenceImage) {
            this.formData.referenceImage = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
    },
    
    removeImage(index) {
      this.imageList.splice(index, 1);
      
      // 如果删除了所有图片，清空参考图片
      if (this.imageList.length === 0) {
        this.formData.referenceImage = null;
      } else {
        // 否则使用第一张图片作为参考图片
        this.formData.referenceImage = this.imageList[0].url;
      }
    },
    
    previewImage(imageUrl) {
      this.$emit('preview', imageUrl);
    },
    
    resetForm() {
      this.formData = {
        prompt: '',
        negativePrompt: '',
        referenceImage: null,
        modelId: 'mj',
        aspectRatio: ''
      };
      this.imageList = [];
      this.selectedStyle = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = null;
      }
    },
    
    selectModel(modelId) {
      this.formData.modelId = modelId;
    },
    
    handleStyleChange(styleName) {
      if (!styleName) {
        return;
      }
      
      // 根据选定的风格调整提示词
      const style = this.presetStyles.find(s => s.name === styleName);
      if (style) {
        if (this.formData.prompt) {
          this.formData.prompt += `, ${style.name}风格`;
        } else {
          this.formData.prompt = `${style.name}风格`;
        }
      }
    },
    
    showSettings() {
      // 触发打开设置抽屉的事件
      this.$emit('show-settings');
    },
    
    handleSubmit() {
      if (!this.formData.prompt.trim()) {
        this.$message.warning('请输入提示词');
        return;
      }
      
      if (!this.formData.modelId) {
        this.$message.warning('请选择AI模型');
        return;
      }
      
      // 构建提交数据，包含图片列表
      const submitData = {
        ...this.formData,
        imageList: this.imageList
      };
      
      // 触发提交事件，传递表单数据
      this.$emit('submit', submitData);
    },
    
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      // 保存状态到localStorage
      localStorage.setItem('promptFormCollapsed', this.isCollapsed);
    },
    getAspectRatioStyle(shape) {
      if (!shape) {
        // 默认选项显示为正方形
        return {
          width: '60%',
          paddingBottom: '60%'
        };
      }
      
      const ratio = shape.width / shape.height;
      
      if (ratio >= 1) {
        // 横向或正方形
        return {
          width: '80%',
          paddingBottom: `${(shape.height / shape.width) * 80}%`
        };
      } else {
        // 纵向
        return {
          width: `${(shape.width / shape.height) * 80}%`,
          paddingBottom: '80%'
        };
      }
    }
  }
};
</script>

<style scoped>
/* 添加文件上传区域的动画效果 */
@keyframes slideRight {
  0% {
    transform: translateX(-100%);
  }
  50%, 100% {
    transform: translateX(100%);
  }
}

@keyframes slideLeft {
  0% {
    transform: translateX(100%);
  }
  50%, 100% {
    transform: translateX(-100%);
  }
}

@keyframes slideDown {
  0% {
    transform: translateY(-100%);
  }
  50%, 100% {
    transform: translateY(100%);
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(100%);
  }
  50%, 100% {
    transform: translateY(-100%);
  }
}

.el-select :deep(.el-input__inner) {
  @apply !rounded-xl !border-gray-200 dark:!border-gray-700 dark:!bg-gray-800 dark:!text-gray-100 hover:!border-blue-500 dark:hover:!border-blue-400 focus:!border-blue-500 dark:focus:!border-blue-400 !shadow-sm dark:!shadow-gray-900/30 transition-colors duration-300;
}

.el-form-item :deep(.el-form-item__label) {
  @apply text-gray-700 dark:text-gray-300 font-medium text-sm mb-1;
}

/* 宽高比例选择器样式 */
.aspect-ratio-preview,
.default-ratio-preview {
  width: 40px;
  height: 40px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
  position: relative;
}

.dark .aspect-ratio-preview,
.dark .default-ratio-preview {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
}

.aspect-ratio-box {
  background-color: rgba(59, 130, 246, 0.4);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 2px;
}

.dark .aspect-ratio-box {
  background-color: rgba(96, 165, 250, 0.5);
}

.aspect-ratio-option.hover .aspect-ratio-box,
.aspect-ratio-option:hover .aspect-ratio-box,
.aspect-ratio-option.hover .default-ratio-preview,
.aspect-ratio-option:hover .default-ratio-preview {
  background-color: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.5);
}

.dark .aspect-ratio-option.hover .aspect-ratio-box,
.dark .aspect-ratio-option:hover .aspect-ratio-box,
.dark .aspect-ratio-option.hover .default-ratio-preview,
.dark .aspect-ratio-option:hover .default-ratio-preview {
  background-color: rgba(96, 165, 250, 0.25);
  border-color: rgba(96, 165, 250, 0.6);
}

.aspect-ratio-option.hover .aspect-ratio-box,
.aspect-ratio-option:hover .aspect-ratio-box {
  background-color: rgba(37, 99, 235, 0.5);
}

.dark .aspect-ratio-option.hover .aspect-ratio-box,
.dark .aspect-ratio-option:hover .aspect-ratio-box {
  background-color: rgba(96, 165, 250, 0.7);
}

.aspect-ratio-select :deep(.el-input__inner) {
  @apply !rounded-xl !border-gray-200 dark:!border-gray-700 dark:!bg-gray-800 dark:!text-gray-100 !shadow-sm dark:!shadow-gray-900/30;
}

.aspect-ratio-option {
  @apply dark:!bg-gray-800 dark:hover:!bg-gray-700;
}

/* 提示词和否定提示词输入框样式 */
.prompt-textarea :deep(.el-textarea__inner),
.negative-prompt-textarea :deep(.el-textarea__inner) {
  @apply !rounded-xl !border-gray-200 dark:!border-gray-700 !bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-gray-100 hover:!border-blue-500 dark:hover:!border-blue-400 focus:!border-blue-500 dark:focus:!border-blue-400 !shadow-sm dark:!shadow-gray-900/30 transition-colors duration-300;
}

.prompt-textarea :deep(.el-textarea__inner:focus),
.negative-prompt-textarea :deep(.el-textarea__inner:focus) {
  @apply !border-blue-500 dark:!border-blue-400 !ring-2 !ring-blue-500/20 dark:!ring-blue-400/20;
}

.prompt-textarea :deep(.el-textarea__inner::placeholder),
.negative-prompt-textarea :deep(.el-textarea__inner::placeholder) {
  @apply !text-gray-400 dark:!text-gray-500;
}

/* 增强输入框的深色模式适配 */
.el-input :deep(.el-input__inner),
.el-textarea :deep(.el-textarea__inner) {
  @apply !bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-gray-200 !border-gray-200 dark:!border-gray-700 hover:!border-blue-500 dark:hover:!border-blue-400 focus:!border-blue-500 dark:focus:!border-blue-400 !shadow-sm dark:!shadow-gray-900/30 transition-colors duration-300;
}

/* 修复textarea的placeholder颜色 */
.el-textarea :deep(.el-textarea__inner::placeholder) {
  @apply !text-gray-400 dark:!text-gray-500;
}

.el-input :deep(.el-input__inner::placeholder) {
  @apply !text-gray-400 dark:!text-gray-500;
}

/* 确保下拉菜单在深色模式下正常显示 */
.el-select :deep(.el-select-dropdown) {
  @apply !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700;
}

.el-select :deep(.el-select-dropdown__item) {
  @apply text-gray-800 dark:text-gray-200;
}

.el-select :deep(.el-select-dropdown__item.hover),
.el-select :deep(.el-select-dropdown__item:hover) {
  @apply !bg-gray-100 dark:!bg-gray-700;
}

.el-select :deep(.el-select-dropdown__item.selected) {
  @apply !bg-blue-50 dark:!bg-blue-900/30 !text-blue-600 dark:!text-blue-400;
}

/* 修复数字输入框样式 */
.el-input-number :deep(.el-input__inner) {
  @apply !bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-gray-200;
}

.el-input-number :deep(.el-input-number__decrease),
.el-input-number :deep(.el-input-number__increase) {
  @apply !bg-gray-50 dark:!bg-gray-700 !text-gray-500 dark:!text-gray-400 !border-gray-200 dark:!border-gray-700;
}

.el-input-number :deep(.el-input-number__decrease:hover),
.el-input-number :deep(.el-input-number__increase:hover) {
  @apply !text-blue-500 dark:!text-blue-400;
}
</style> 