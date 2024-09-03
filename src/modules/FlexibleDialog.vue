<!-- FlexibleFormDialog.vue -->
<template>
    <transition name="zoom">
      <div v-if="localVisible" class="dialog-overlay" @click.self="handleClose">
        <div class="dialog-container">
          <div class="dialog-header">
            <h3>{{ title }}</h3>
            <button class="close-button" @click="handleClose">&times;</button>
          </div>
          <div class="dialog-body">
            <form @submit.prevent="handleSubmit">
              <slot :form-data="formData" :update-form-data="updateFormData">
                <!-- 默认表单内容 -->
                <div v-for="(value, key) in formData" :key="key" class="form-group">
                  <label :for="key">{{ key }}:</label>
                  <input
                    :id="key"
                    v-model="formData[key]"
                    :type="key === 'email' ? 'email' : 'text'"
                  >
                </div>
              </slot>
            </form>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-confirm" @click="handleSubmit">确定</button>
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
    z-index: 1000;
}

.dialog-container {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
    overflow: hidden;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.dialog-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: #909399;
    cursor: pointer;
}

.dialog-body {
    padding: 20px;
}

.input-group,
.toggle-group {
    margin-bottom: 15px;
}

.input-group label,
.toggle-group label {
    display: block;
    margin-bottom: 5px;
    color: #606266;
}

.input-group input[type="text"],
.input-group input[type="email"] {
    width: 95.5%;
    padding: 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}

.toggle-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.toggle-group input[type="checkbox"] {
    width: 20px;
    height: 20px;
}

.dialog-footer {
    padding: 10px 20px 20px;
    text-align: right;
}

.btn {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel {
    background-color: #ffffff;
    color: #606266;
    border: 1px solid #dcdfe6;
}

.btn-cancel:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
}

.btn-confirm {
    background-color: #409eff;
    color: #ffffff;
    border: none;
    margin-right: 10px;
    
}

.btn-confirm:hover {
    background-color: #66b1ff;
}

.zoom-enter-active,
.zoom-leave-active {
    transition: all 0.3s ease;
}

.zoom-enter,
.zoom-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>