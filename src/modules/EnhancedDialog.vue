<!-- Modal.vue -->
<template>
    <transition name="modal">
      <div v-if="isVisible" class="modal-overlay" @click="close">
        <div 
          class="modal-content" 
          @click.stop
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <header class="modal-header">
            <h3 :id="title">{{ title }}</h3>
            <button 
              class="close-button" 
              @click="close"
              aria-label="关闭对话框"
            >
              <svg 
                viewBox="0 0 24 24" 
                class="close-icon"
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <main class="modal-body">
            <slot></slot>
          </main>
          <footer class="modal-footer">
            <button class="btn btn-cancel" @click="close">取消</button>
            <button class="btn btn-confirm" @click="confirm">确认</button>
          </footer>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      isVisible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: '标题'
      }
    },
    mounted() {
      if (this.isVisible) {
        this.preventBodyScroll();
      }
      window.addEventListener('keydown', this.handleKeydown);
    },
    beforeDestroy() {
      this.enableBodyScroll();
      window.removeEventListener('keydown', this.handleKeydown);
    },
    watch: {
      isVisible(newVal) {
        if (newVal) {
          this.preventBodyScroll();
        } else {
          this.enableBodyScroll();
        }
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      confirm() {
        this.$emit('confirm');
      },
      handleKeydown(e) {
        if (this.isVisible && e.key === 'Escape') {
          this.close();
        }
      },
      preventBodyScroll() {
        document.body.style.overflow = 'hidden';
        // 防止iOS回弹效果
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      },
      enableBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px); /* Safari 支持 */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    box-sizing: border-box;
    overscroll-behavior: contain; /* 防止滚动穿透 */
    touch-action: none; /* 防止移动端触摸事件 */
  }
  
  .modal-content {
    background: #ffffff;
    border-radius: 16px;
    width: 500px;
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                0 5px 10px -5px rgba(0, 0, 0, 0.04);
    position: relative;
    transform-origin: center;
    animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden; /* 防止内容溢出 */
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    min-height: 3.5rem; /* 确保移动端点击区域足够大 */
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
  }
  
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px; /* 增大移动端点击区域 */
    height: 44px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }
  
  .close-button:hover {
    background-color: #f5f5f5;
  }
  
  .close-icon {
    width: 24px;
    height: 24px;
    color: #666;
    transition: color 0.2s;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* iOS 滚动优化 */
    flex: 1;
    min-height: 100px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 1.25rem 1.5rem;
    background: #f8f8f8;
    border-top: 1px solid #f0f0f0;
    border-radius: 0 0 16px 16px;
  }
  
  .btn {
    padding: 0.75rem 1.5rem; /* 增大移动端按钮区域 */
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem; /* 增大移动端字体 */
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    touch-action: manipulation; /* 优化移动端触摸 */
    -webkit-tap-highlight-color: transparent;
  }
  
  .btn:active {
    transform: scale(0.98); /* 移动端点击反馈 */
  }
  
  .btn-confirm {
    background-color: #0e8f6f;
    color: white;
  }
  
  .btn-confirm:hover {
    background-color: #0c7a5e;
  }
  
  .btn-cancel {
    background-color: #fff;
    color: #666;
    border: 1px solid #ddd;
  }
  
  .btn-cancel:hover {
    background-color: #f5f5f5;
    color: #333;
  }
  
  /* 动画效果 */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
  
  @keyframes modal-pop {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0;
      align-items: flex-end; /* 从底部弹出 */
    }
  
    .modal-content {
      width: 100%;
      max-height: 85vh; /* 预留顶部空间 */
      border-radius: 20px 20px 0 0; /* 只保留顶部圆角 */
      animation: modal-slide-up 0.3s ease-out;
    }
  
    .modal-header {
      padding: 1rem 1.25rem;
    }
  
    .modal-body {
      padding: 1.25rem;
    }
  
    .modal-footer {
      padding: 1rem 1.25rem;
      gap: 8px;
    }
  
    .btn {
      flex: 1; /* 按钮等宽 */
      min-width: unset;
    }
  
    /* 底部弹出动画 */
    .modal-enter-from,
    .modal-leave-to {
      transform: translateY(100%);
    }
  }
  
  /* 适配异形屏 */
  @supports (padding: env(safe-area-inset-bottom)) {
    @media (max-width: 768px) {
      .modal-footer {
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
      }
    }
  }
  
  /* 暗色主题 */
  @media (prefers-color-scheme: dark) {
    .modal-content {
      background: #1a1a1a;
    }
  
    .modal-header {
      border-bottom-color: #333;
    }
  
    .modal-header h3 {
      color: #fff;
    }
  
    .close-button:hover {
      background-color: #333;
    }
  
    .close-icon {
      color: #999;
    }
  
    .modal-footer {
      background: #1a1a1a;
      border-top-color: #333;
    }
  
    .btn-cancel {
      background-color: #333;
      color: #fff;
      border-color: #444;
    }
  
    .btn-cancel:hover {
      background-color: #444;
    }
  }
  
  /* 针对较小屏幕的额外优化 */
  @media (max-width: 320px) {
    .modal-header h3 {
      font-size: 1.125rem;
    }
  
    .btn {
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
    }
  }
  </style>