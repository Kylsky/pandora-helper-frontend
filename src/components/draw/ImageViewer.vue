<template>
  <div 
    v-if="visible" 
    class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
    @click.self="closeViewer"
    @keydown.esc="closeViewer">
    <div class="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-8">
      <!-- 顶部控制栏 -->
      <div class="absolute top-4 right-4 left-4 flex items-center justify-between z-[9999]">
        <div class="text-white/80 text-sm">
          <span class="mr-1">图片预览</span>
        </div>
        <div class="flex items-center space-x-4">
          <button 
            class="text-white/80 hover:text-white bg-gray-700/50 hover:bg-gray-700/80 transition-colors p-2 rounded-full"
            @click="downloadImage"
            title="下载图片">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          </button>
          <button 
            class="text-white/80 hover:text-white bg-gray-700/50 hover:bg-gray-700/80 transition-colors p-2 rounded-full"
            @click="closeViewer"
            title="关闭预览">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 图片区域 - 确保在移动端居中显示 -->
      <div class="relative w-full max-w-[100vw] h-[calc(100vh-10rem)] max-h-[80vh] flex items-center justify-center overflow-hidden rounded-lg">
        <img 
          :src="imageUrl" 
          :style="imageStyle"
          class="max-w-full max-h-full object-contain rounded shadow-2xl transition-transform duration-300" 
          @click.stop
          @wheel.prevent="handleZoom"
          @mousedown="startDrag"
          @mousemove="drag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart="startTouchDrag"
          @touchmove.prevent="touchDrag"
          @touchend="stopTouchDrag"
          ref="previewImage">
      </div>

      <!-- 底部控制栏 - 移动端优化位置 -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 sm:space-x-4 py-2 px-3 sm:px-4 bg-gray-800/60 backdrop-blur-sm rounded-full text-white/80 z-[9999]">
        <button 
          class="hover:text-white transition-colors rounded-full p-1.5"
          @click="resetImage"
          title="重置图片">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
        <button 
          class="hover:text-white transition-colors rounded-full p-1.5"
          @click="zoomOut"
          title="缩小">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
          </svg>
        </button>
        <div class="text-xs font-mono">{{ Math.round(zoom * 100) }}%</div>
        <button 
          class="hover:text-white transition-colors rounded-full p-1.5"
          @click="zoomIn"
          title="放大">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 3,
      zoomStep: 0.1,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      translateX: 0,
      translateY: 0,
      lastTranslateX: 0,
      lastTranslateY: 0
    };
  },
  computed: {
    imageStyle() {
      return {
        transform: `scale(${this.zoom}) translate(${this.translateX}px, ${this.translateY}px)`,
        cursor: this.isDragging ? 'grabbing' : 'grab'
      };
    }
  },
  methods: {
    closeViewer() {
      this.resetImage();
      this.$emit('close');
    },
    
    downloadImage() {
      if (!this.imageUrl) return;
      
      // 在新窗口打开图片
      window.open(this.imageUrl, '_blank');
    },
    
    handleZoom(event) {
      event.preventDefault();
      const zoomDirection = event.deltaY > 0 ? -1 : 1;
      this.adjustZoom(zoomDirection * this.zoomStep);
    },
    
    zoomIn() {
      this.adjustZoom(this.zoomStep);
    },
    
    zoomOut() {
      this.adjustZoom(-this.zoomStep);
    },
    
    adjustZoom(delta) {
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
      this.zoom = newZoom;
    },
    
    resetImage() {
      this.zoom = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.lastTranslateX = 0;
      this.lastTranslateY = 0;
    },
    
    startDrag(event) {
      if (event.button !== 0) return; // 只响应左键
      
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
    },
    
    drag(event) {
      if (!this.isDragging) return;
      
      const dx = (event.clientX - this.dragStartX) / this.zoom;
      const dy = (event.clientY - this.dragStartY) / this.zoom;
      
      this.translateX = this.lastTranslateX + dx;
      this.translateY = this.lastTranslateY + dy;
    },
    
    stopDrag() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.lastTranslateX = this.translateX;
      this.lastTranslateY = this.translateY;
    },
    
    // 触摸事件处理
    startTouchDrag(event) {
      if (event.touches.length !== 1) return;
      
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      
      // 添加触摸事件处理时，阻止页面滚动
      document.body.style.overflow = 'hidden';
    },
    
    touchDrag(event) {
      if (!this.isDragging || event.touches.length !== 1) return;
      
      const dx = (event.touches[0].clientX - this.dragStartX) / this.zoom;
      const dy = (event.touches[0].clientY - this.dragStartY) / this.zoom;
      
      this.translateX = this.lastTranslateX + dx;
      this.translateY = this.lastTranslateY + dy;
    },
    
    stopTouchDrag() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.lastTranslateX = this.translateX;
      this.lastTranslateY = this.translateY;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.resetImage();
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.closeViewer();
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 移动设备优化 */
@media (max-width: 640px) {
  img {
    max-width: 100% !important;
    max-height: calc(100vh - 10rem) !important;
  }
  
  /* 移动端上更明显的滚动和缩放提示 */
  img::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle, transparent 80%, rgba(0,0,0,0.2) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  img:active::after {
    opacity: 1;
  }
}
</style> 