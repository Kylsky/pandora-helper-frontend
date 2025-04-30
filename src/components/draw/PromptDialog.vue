<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>
      
      <!-- 弹窗内容 -->
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700">
          <!-- 弹窗头部 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ title }}</h3>
            <button 
              @click="handleCancel" 
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              type="button"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- 弹窗内容 -->
          <div class="px-6 py-4">
            <p v-if="message" class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ message }}</p>
            
            <!-- 输入框 -->
            <div class="mt-2">
              <input 
                v-model="inputValue" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                :placeholder="placeholder"
                @keyup.enter="handleConfirm"
                ref="inputRef"
              />
              <div v-if="errorMessage" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ errorMessage }}</div>
            </div>
          </div>
          
          <!-- 弹窗底部 -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button 
              @click="handleCancel" 
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              type="button"
            >
              {{ cancelButtonText }}
            </button>
            <button 
              @click="handleConfirm" 
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              type="button"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PromptDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    message: {
      type: String,
      default: ''
    },
    defaultValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    validator: {
      type: Function,
      default: null
    },
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: this.defaultValue,
      errorMessage: ''
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.inputValue = this.defaultValue;
        this.errorMessage = '';
        this.$nextTick(() => {
          if (this.$refs.inputRef) {
            this.$refs.inputRef.focus();
          }
        });
      }
    },
    defaultValue(newVal) {
      this.inputValue = newVal;
    }
  },
  methods: {
    validate() {
      if (this.validator) {
        const result = this.validator(this.inputValue);
        if (result !== true) {
          this.errorMessage = result;
          return false;
        }
      }
      this.errorMessage = '';
      return true;
    },
    handleConfirm() {
      if (!this.validate()) return;
      
      this.$emit('confirm', this.inputValue);
    },
    handleCancel() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dark\:bg-gray-850 {
  @apply dark:bg-gray-800;
  background-color: #1a2234;
}
</style> 