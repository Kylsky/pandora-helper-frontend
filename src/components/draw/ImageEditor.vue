<template>
  <div v-if="visible" class="fixed inset-0 z-[9999] overflow-y-auto">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100 dark:border-gray-700">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <i class="el-icon-picture-outline mr-2 text-blue-500"></i>
            图片编辑
          </h3>
          <button 
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="handleClose">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗主体 -->
        <div class="p-4">
          <div class="space-y-3">
            <!-- 操作提示 -->
            <div class="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
              <p><i class="el-icon-info-circle mr-1"></i> 提示：可以框选多个区域，按Delete键删除选中的区域</p>
            </div>
            
            <!-- 移除重复的预览图片 -->
            <!-- 只在Canvas加载失败时显示预览图片 -->
            <div v-if="canvasLoadFailed && currentTask && currentTask.imageUrl" class="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-2 bg-gray-50 dark:bg-gray-900 mb-4">
              <img 
                :src="currentTask.imageUrl" 
                class="max-w-full max-h-64 object-contain mx-auto" 
                alt="待编辑图片"
              />
              <div class="text-center text-sm text-red-500 mt-2">
                画布加载失败，无法选择区域，将处理整个图片
              </div>
            </div>
            
            <!-- 画布容器 -->
            <div class="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900" style="height: calc(100vh - 500px);">
              <canvas 
                ref="imageCanvas" 
                class="max-w-full max-h-full object-contain"
                @mousedown="handleMouseDown" 
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp" 
                @mouseleave="handleMouseUp"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd">
              </canvas>
            </div>

            <!-- 提示词输入框 -->
            <div class="space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div class="flex items-center mb-1">
                <i class="el-icon-edit mr-2 text-blue-500"></i>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">提示词</div>
              </div>
              <textarea 
                v-model="editPrompt"
                rows="2"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm p-2"
                placeholder="请输入提示词，描述您想要在选中区域生成的内容">
              </textarea>
              <div class="text-xs text-gray-500 dark:text-gray-400">提示：详细的描述可以帮助AI更好地理解您的需求</div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="flex items-center justify-end space-x-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button 
            class="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            @click="handleClose"
            :disabled="isSubmitting">
            <i class="el-icon-close mr-1"></i>
            取消
          </button>
          <button 
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            @click="handleConfirm"
            :disabled="isSubmitting">
            <i :class="[isSubmitting ? 'el-icon-loading' : 'el-icon-check']" class="mr-1"></i>
            {{ isSubmitting ? '处理中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageEditor',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentTask: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'confirm', 'update:taskStatus'],
  data() {
    return {
      editPrompt: '',
      isDrawing: false,
      startX: 0,
      startY: 0,
      selectionRect: { x: 0, y: 0, width: 0, height: 0 },
      selectionRects: [],
      activeSelectionIndex: -1,
      finalSelectionRect: null,
      maskBase64: '',
      originalImage: null,
      canvasLoadFailed: false,
      isSubmitting: false
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initEditor();
        });
      }
    }
  },
  mounted() {
    // 添加键盘事件监听器
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    // 移除键盘事件监听器
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    initEditor() {
      if (!this.currentTask || !this.currentTask.imageUrl) {
        console.error('初始化编辑器失败: 当前任务或图片URL不存在');
        this.$message.error('无法加载图片，请重试');
        this.canvasLoadFailed = true;
        return;
      }
      
      console.log('初始化图片编辑器，加载图片:', this.currentTask.imageUrl);
      
      // 设置默认提示词
      this.editPrompt = '';
      
      const canvas = this.$refs.imageCanvas;
      const ctx = canvas.getContext('2d');
      
      // 重置选择状态
      this.selectionRects = [];
      this.activeSelectionIndex = -1;
      this.canvasLoadFailed = false;
      
      // 设置画布初始尺寸
      canvas.width = 800;
      canvas.height = 600;
      
      // 显示加载中提示
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('图片加载中...', canvas.width / 2, canvas.height / 2);
      
      // 创建一个新图像对象
      const img = new Image();
      
      img.onload = () => {
        console.log('图片加载成功，尺寸:', img.width, 'x', img.height);
        this.originalImage = img;
        
        // 设置canvas尺寸与图片一致
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0);
      };
      
      img.onerror = (err) => {
        console.error('图片加载失败:', err);
        this.canvasLoadFailed = true;
        
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ff4d4f';
        ctx.textAlign = 'center';
        ctx.fillText('画布加载失败，将处理整个图片', canvas.width / 2, canvas.height / 2);
        
        // 显示错误信息
        this.$message.error('画布加载失败，将处理整个图片');
      };
      
      // 设置图片源
      // 如果是base64编码的图片，直接使用
      if (this.currentTask.imageUrl.startsWith('data:image')) {
        img.src = this.currentTask.imageUrl;
      } 
      // 如果是URL图片，添加时间戳避免缓存问题
      else {
        const timestamp = new Date().getTime();
        const separator = this.currentTask.imageUrl.includes('?') ? '&' : '?';
        img.src = `${this.currentTask.imageUrl}${separator}_t=${timestamp}`;
      }
    },
    
    handleMouseDown(e) {
      if (this.canvasLoadFailed) return; // 如果画布加载失败，不处理鼠标事件
      
      const canvas = this.$refs.imageCanvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // 计算鼠标在画布上的实际位置，考虑缩放因素
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // 检查是否点击了已有的选择框
      const clickedIndex = this.selectionRects.findIndex(rect => 
        x >= rect.x && x <= rect.x + rect.width && 
        y >= rect.y && y <= rect.y + rect.height
      );
      
      if (clickedIndex !== -1) {
        // 选中已有的框
        this.activeSelectionIndex = clickedIndex;
        this.redrawCanvas();
      } else {
        // 创建新的选择框
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        this.selectionRect = { x, y, width: 0, height: 0 };
        this.activeSelectionIndex = -1;
      }
    },
    
    handleMouseMove(e) {
      if (!this.isDrawing || this.canvasLoadFailed) return;
      
      const canvas = this.$refs.imageCanvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // 计算鼠标在画布上的实际位置，考虑缩放因素
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // 更新选择框尺寸
      this.selectionRect.width = x - this.startX;
      this.selectionRect.height = y - this.startY;
      
      // 绘制画布以显示选择框
      this.redrawCanvas();
    },
    
    handleMouseUp() {
      if (!this.isDrawing || this.canvasLoadFailed) return;
      
      this.isDrawing = false;
      
      // 确保选择框的宽高为正数
      const rect = { ...this.selectionRect };
      if (rect.width < 0) {
        rect.x += rect.width;
        rect.width = Math.abs(rect.width);
      }
      if (rect.height < 0) {
        rect.y += rect.height;
        rect.height = Math.abs(rect.height);
      }
      
      // 添加到选择框数组
      if (rect.width > 5 && rect.height > 5) {
        this.selectionRects.push(rect);
        this.activeSelectionIndex = this.selectionRects.length - 1;
      }
      
      this.redrawCanvas();
    },
    
    redrawCanvas() {
      if (!this.$refs.imageCanvas || this.canvasLoadFailed) return;
      
      const canvas = this.$refs.imageCanvas;
      const ctx = canvas.getContext('2d');
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制原始图片
      if (this.originalImage) {
        ctx.drawImage(this.originalImage, 0, 0);
      }
      
      // 绘制所有选择框
      this.selectionRects.forEach((rect, index) => {
        const isActive = index === this.activeSelectionIndex;
        this.drawSelectionRect(ctx, rect, isActive);
      });
      
      // 绘制当前正在创建的选择框
      if (this.isDrawing) {
        this.drawSelectionRect(ctx, this.selectionRect, true);
      }
    },
    
    drawSelectionRect(ctx, rect, isActive) {
      const { x, y, width, height } = rect;
      
      // 计算实际绘制坐标，处理负宽度/高度情况
      const drawX = width < 0 ? x + width : x;
      const drawY = height < 0 ? y + height : y;
      const drawWidth = Math.abs(width);
      const drawHeight = Math.abs(height);
      
      // 绘制半透明矩形
      ctx.fillStyle = isActive ? 'rgba(245, 108, 108, 0.2)' : 'rgba(146, 84, 222, 0.2)';
      ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
      
      // 绘制边框
      ctx.strokeStyle = isActive ? '#f56c6c' : '#9254de';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
      
      // 绘制控制点
      if (!this.isDrawing || isActive) {
        const pointSize = 4;
        const points = [
          { x: drawX, y: drawY }, // 左上
          { x: drawX + drawWidth / 2, y: drawY }, // 上中
          { x: drawX + drawWidth, y: drawY }, // 右上
          { x: drawX, y: drawY + drawHeight / 2 }, // 左中
          { x: drawX + drawWidth, y: drawY + drawHeight / 2 }, // 右中
          { x: drawX, y: drawY + drawHeight }, // 左下
          { x: drawX + drawWidth / 2, y: drawY + drawHeight }, // 下中
          { x: drawX + drawWidth, y: drawY + drawHeight } // 右下
        ];
        
        ctx.fillStyle = isActive ? '#f56c6c' : '#9254de';
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      // 绘制尺寸标签（仅当框足够大时）
      if (drawWidth > 60 && drawHeight > 20) {
        const sizeText = `${Math.round(drawWidth)} × ${Math.round(drawHeight)}`;
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // 绘制背景
        const textMeasure = ctx.measureText(sizeText);
        const textWidth = textMeasure.width + 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          drawX + drawWidth / 2 - textWidth / 2, 
          drawY + drawHeight - 25, 
          textWidth, 
          20
        );
        
        // 绘制文本
        ctx.fillStyle = 'white';
        ctx.fillText(
          sizeText, 
          drawX + drawWidth / 2, 
          drawY + drawHeight - 10
        );
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
        if (this.selectionRects.length > 0) {
          ctx.fillStyle = 'white';
          
          // 绘制所有选择框区域
          this.selectionRects.forEach(rect => {
            ctx.fillRect(
              rect.x,
              rect.y,
              rect.width,
              rect.height
            );
          });
          
          return maskCanvas.toDataURL('image/png').split(',')[1];
        } else {
          // 没有选择区域，返回默认处理全图的遮罩
          this.$message.warning('未选择任何区域，将对整个图像进行处理');
          
          // 全白遮罩表示处理整个图像
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          
          return maskCanvas.toDataURL('image/png').split(',')[1];
        }
      } catch (error) {
        console.error('生成遮罩失败:', error);
        
        // 如果出现错误，尝试创建一个固定尺寸的遮罩
        try {
          // 假设图片尺寸是800x600，或从预览图片获取
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 800;
          tempCanvas.height = 600;
          
          // 如果原始图像存在，使用其尺寸
          if (this.originalImage) {
            tempCanvas.width = this.originalImage.width;
            tempCanvas.height = this.originalImage.height;
          }
          
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.fillStyle = 'white'; // 全白遮罩表示处理整个图像
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          this.$message.warning('由于跨域限制，将对整个图像进行处理');
          return tempCanvas.toDataURL('image/png').split(',')[1];
        } catch (fallbackError) {
          console.error('fallback遮罩也生成失败:', fallbackError);
          throw new Error('无法生成遮罩，请重试或联系管理员');
        }
      }
    },
    
    resetEditor() {
      this.isDrawing = false;
      this.startX = 0;
      this.startY = 0;
      this.selectionRect = { x: 0, y: 0, width: 0, height: 0 };
      this.selectionRects = [];
      this.activeSelectionIndex = -1;
      this.finalSelectionRect = null;
      this.editPrompt = '';
      this.maskBase64 = '';
      this.originalImage = null;
      this.canvasLoadFailed = false;
      
      if (this.$refs.imageCanvas) {
        const ctx = this.$refs.imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.$refs.imageCanvas.width, this.$refs.imageCanvas.height);
      }
    },
    
    handleClose() {
      // 如果正在提交，不允许关闭
      if (this.isSubmitting) return;
      
      this.resetEditor();
      this.$emit('close');
    },
    
    async handleConfirm() {
      try {
        if (!this.editPrompt.trim()) {
          this.$message.warning('请输入提示词');
          return;
        }
        
        // 设置提交状态
        this.isSubmitting = true;
        
        let maskBase64 = '';
        
        try {
          const canvas = this.$refs.imageCanvas;
          maskBase64 = this.generateMask(canvas);
        } catch (maskError) {
          console.error('生成遮罩出错:', maskError);
          
          // 如果生成遮罩失败，创建一个简单的全白遮罩(表示处理整个图像)
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = 800;
          fallbackCanvas.height = 600;
          
          // 如果原始图像存在，使用其尺寸
          if (this.originalImage) {
            fallbackCanvas.width = this.originalImage.width;
            fallbackCanvas.height = this.originalImage.height;
          }
          
          const fallbackCtx = fallbackCanvas.getContext('2d');
          fallbackCtx.fillStyle = 'white';
          fallbackCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
          
          maskBase64 = fallbackCanvas.toDataURL('image/png').split(',')[1];
          this.$message.warning('无法精确选择区域，将对整个图像进行处理');
        }
        
        this.maskBase64 = maskBase64;
        
        // 发出确认事件，传递必要数据
        this.$emit('confirm', {
          prompt: this.editPrompt,
          maskBase64: 'data:image/png;base64,' + this.maskBase64,
          callback: (success) => {
            if (success) {
              // 关闭弹窗并重置编辑器
              this.resetEditor();
              this.$emit('close');
            } else {
              // 重置提交状态，允许用户重试
              this.isSubmitting = false;
            }
          }
        });
      } catch (error) {
        console.error('编辑确认失败:', error);
        this.$message.error('操作失败: ' + error.message);
        this.isSubmitting = false;
      }
    },
    
    handleKeyDown(e) {
      // 如果弹窗不可见，不处理键盘事件
      if (!this.visible) return;
      
      // 获取当前焦点元素
      const activeElement = document.activeElement;
      
      // 如果焦点在输入框、文本框等元素内，不处理删除键事件
      if (activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          activeElement.isContentEditable
      )) {
        return; // 焦点在输入框内，不处理删除键事件
      }
      
      // 处理Delete键
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // 如果有选中的区域，删除它
        if (this.activeSelectionIndex !== -1) {
          this.selectionRects.splice(this.activeSelectionIndex, 1);
          this.activeSelectionIndex = -1;
          this.redrawCanvas();
          
          console.log('已删除选定区域，剩余区域:', this.selectionRects.length);
        }
      }
    },
    
    // 添加触摸事件处理
    handleTouchStart(e) {
      if (this.canvasLoadFailed) return; // 如果画布加载失败，不处理触摸事件
      e.preventDefault(); // 阻止默认行为，防止滚动
      
      if (e.touches.length !== 1) return; // 只处理单指触摸
      
      const touch = e.touches[0];
      // 模拟鼠标事件
      this.handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    },
    
    handleTouchMove(e) {
      if (this.canvasLoadFailed || !this.isDrawing) return;
      e.preventDefault(); // 阻止默认行为，防止滚动
      
      if (e.touches.length !== 1) return; // 只处理单指触摸
      
      const touch = e.touches[0];
      // 模拟鼠标事件
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    },
    
    handleTouchEnd(e) {
      if (this.canvasLoadFailed) return;
      e.preventDefault(); // 阻止默认行为
      
      // 不需要触摸点信息，直接结束绘制
      this.handleMouseUp();
    }
  }
};
</script> 