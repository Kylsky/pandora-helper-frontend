<!-- ConfirmDialog.vue -->
<template>
    <transition name="zoom">
      <div v-if="localVisible" class="dialog-overlay" @click.self="handleClose">
        <div class="dialog-container">
          <div class="dialog-header">
            <h3>{{ title }}</h3>
            <button class="close-button" @click="handleClose">&times;</button>
          </div>
          <div class="dialog-body">
            <i class="icon-warning"></i>
            <p>{{ message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-confirm" @click="handleConfirm">确定</button>
            <button class="btn btn-cancel" @click="handleClose">取消</button>
        
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '确认',
      },
      message: {
        type: String,
        default: '你确定要执行这个操作吗？',
      },
    },
    data() {
      return {
        localVisible: this.visible,
      };
    },
    watch: {
      visible(val) {
        this.localVisible = val;
      },
    },
    methods: {
      handleClose() {
        this.localVisible = false;
        this.$emit('update:visible', false);
      },
      handleConfirm() {
        this.$emit('confirm');
        this.handleClose();
      },
    },
  }
  </script>
  
  <style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2100;
    backdrop-filter: blur(2px);
  }
  
  .dialog-container {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    width: 90%;
    max-width: 420px;
    overflow: hidden;
    animation: dialog-pop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .dialog-container {
      background-color: #1e293b;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }
  }
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(to right, #f8f9fa, #f5f7fa);
    border-bottom: 1px solid #ebeef5;
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .dialog-header {
      background: linear-gradient(to right, #1e293b, #0f172a);
      border-bottom: 1px solid #334155;
    }
  }
  
  .dialog-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .dialog-header h3 {
      color: #e2e8f0;
    }
  }
  
  .close-button {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    color: #909399;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background-color: rgba(144, 147, 153, 0.1);
    color: #606266;
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .close-button {
      color: #94a3b8;
    }
    
    .close-button:hover {
      background-color: rgba(148, 163, 184, 0.1);
      color: #cbd5e1;
    }
  }
  
  .dialog-body {
    padding: 24px;
    display: flex;
    align-items: flex-start;
  }
  
  .icon-warning {
    font-size: 24px;
    color: #f5a623;
    margin-right: 16px;
    flex-shrink: 0;
  }
  
  .dialog-body p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #4a5568;
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .dialog-body p {
      color: #cbd5e1;
    }
  }
  
  .dialog-footer {
    padding: 16px 24px 24px;
    text-align: right;
  }
  
  .btn {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-cancel {
    background-color: #ffffff;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  
  .btn-cancel:hover {
    color: #3b82f6;
    border-color: #bfdbfe;
    background-color: #eff6ff;
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .btn-cancel {
      background-color: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    
    .btn-cancel:hover {
      color: #60a5fa;
      border-color: #2563eb;
      background-color: #1e40af;
    }
  }
  
  .btn-confirm {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #ffffff;
    border: none;
    margin-right: 12px;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }
  
  .btn-confirm:hover {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
    transform: translateY(-1px);
  }
  
  /* 深色模式 */
  @media (prefers-color-scheme: dark) {
    .btn-confirm {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
    }
    
    .btn-confirm:hover {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
    }
  }
  
  @keyframes dialog-pop {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .zoom-enter, .zoom-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
  </style>