<!-- FlexibleFormDialog.vue -->
<template>
  <transition name="dialog-fade">
    <div v-if="localVisible" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="close-button" @click="handleClose">
            <span class="close-icon">×</span>
          </button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <slot :form-data="formData" :update-form-data="updateFormData">
              <div v-for="(value, key) in formData" :key="key" class="form-group">
                <label :for="key">{{ key }}:</label>
                <input :id="key" v-model="formData[key]" :type="key === 'email' ? 'email' : 'text'" class="form-input">
              </div>
            </slot>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="handleClose">取消</button>
          <button class="btn btn-confirm" @click="handleSubmit">确定</button>
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
      default: '表单',
    },
    initialData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localVisible: this.visible,
      formData: { ...this.initialData },
    };
  },
  watch: {
    visible(val) {
      this.localVisible = val;
    },
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    handleClose() {
      this.localVisible = false;
      this.$emit('update:visible', false);
    },
    handleSubmit() {
      this.$emit('submit', this.formData);
      this.handleClose();
    },
    updateFormData(key, value) {
      this.formData[key] = value;
    },
  },
}
</script>


<style scoped>.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 90%;
  max-width: 480px;
  margin: 20px;
  overflow: hidden;
  animation: dialog-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.close-icon {
  font-size: 24px;
  color: #64748b;
  line-height: 1;
}

.dialog-body {
  padding: 24px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-footer {
  padding: 16px 24px;
  background-color: #f9fafb;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #ffffff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.btn-confirm {
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
}

.btn-confirm:hover {
  background-color: #2563eb;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
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

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .dialog-container {
    background-color: #1f2937;
  }

  .dialog-header {
    background-color: #1f2937;
    border-bottom-color: #374151;
  }

  .dialog-header h3 {
    color: #f9fafb;
  }

  .close-button:hover {
    background-color: #374151;
  }

  .close-icon {
    color: #9ca3af;
  }

  .form-group label {
    color: #e5e7eb;
  }

  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .form-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .dialog-footer {
    background-color: #1f2937;
    border-top-color: #374151;
  }

  .btn-cancel {
    background-color: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }

  .btn-cancel:hover {
    background-color: #4b5563;
    color: #f9fafb;
  }

  .btn-confirm {
    background-color: #3b82f6;
  }

  .btn-confirm:hover {
    background-color: #2563eb;
  }
}
</style>