<!-- SplitButton.vue -->
<template>
  <el-tooltip
    :content="tooltipContent"
    placement="top"
    effect="light"
  >
    <button class="split-button" :class="[type, {'disabled': count === 0 || loading}]" @click="handleClick">
      <span class="name-section">
        <i v-if="!loading" :class="typeIcon" class="type-icon"></i>
        <i v-else class="el-icon-loading type-icon"></i>
        {{ shortName }}
      </span>
      <div class="info-section">
        <span class="count-section">
          <i class="el-icon-user user-icon"></i>
          {{ count }}
        </span>
        <span class="days-section" v-if="days !== undefined && days !== '-'">
          <i class="el-icon-time"></i>
          {{ days }} 天
        </span>
      </div>
    </button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'SplitButton',
  props: {
    name: {
      type: String,
      required: true
    },
    count: {
      type: [String, Number],
      default: 0
    },
    days: {
      type: [String, Number],
      default: undefined
    },
    type: {
      type: String,
      default: 'gpt',
      validator: function(value) {
        return ['gpt', 'claude', 'api'].indexOf(value) !== -1
      }
    },
    maxLength: {
      type: Number,
      default: 10
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    typeIcon() {
      const icons = {
        gpt: 'el-icon-chat-dot-round',
        claude: 'el-icon-message',
        api: 'el-icon-connection'
      }
      return icons[this.type] || 'el-icon-chat-dot-round'
    },
    shortName() {
      if (this.name.length > this.maxLength) {
        return this.name.substring(0, this.maxLength) + '...'
      }
      return this.name
    },
    tooltipContent() {
      if (Number(this.count) === 0) {
        return `用户暂未拥有该类型账号`
      }
      return `点击开始对话`
    }
  },
  methods: {
    handleClick() {
      if (Number(this.count) > 0 && !this.loading) {
        this.$emit('click');
      }
    }
  }
}
</script>

<style scoped>
.split-button {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  height: 24px;
  font-size: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  max-width: 180px;
}

.dark .split-button {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.split-button:not(.disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1);
}

.dark .split-button:not(.disabled):hover {
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.4);
}

/* GPT 样式 */
.gpt .name-section {
  background-color: #3b82f6;
}

.dark .gpt .name-section {
  background-color: #2563eb;
}

.gpt .count-section,
.gpt .days-section {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.dark .gpt .count-section,
.dark .gpt .days-section {
  background-color: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

/* Claude 样式 */
.claude .name-section {
  background-color: #10b981;
}

.dark .claude .name-section {
  background-color: #059669;
}

.claude .count-section,
.claude .days-section {
  background-color: #ecfdf5;
  color: #047857;
}

.dark .claude .count-section,
.dark .claude .days-section {
  background-color: rgba(5, 150, 105, 0.2);
  color: #34d399;
}

/* API 样式 */
.api .name-section {
  background-color: #f59e0b;
}

.dark .api .name-section {
  background-color: #d97706;
}

.api .count-section,
.api .days-section {
  background-color: #fef3c7;
  color: #b45309;
}

.dark .api .count-section,
.dark .api .days-section {
  background-color: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
}

/* 禁用状态样式 */
.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.disabled .name-section {
  background-color: #6b7280;
}

.dark .disabled .name-section {
  background-color: #4b5563;
}

.disabled .count-section,
.disabled .days-section {
  background-color: #f3f4f6;
  color: #4b5563;
}

.dark .disabled .count-section,
.dark .disabled .days-section {
  background-color: #1f2937;
  color: #d1d5db;
}

.name-section {
  color: #ffffff;
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 60px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.dark .name-section {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.info-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.count-section {
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 32px;
  justify-content: center;
}

.days-section {
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 42px;
  justify-content: center;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .days-section {
  border-left-color: rgba(0, 0, 0, 0.2);
}

.days-section i {
  margin-right: 1px;
  font-size: 11px;
}

.type-icon {
  margin-right: 3px;
  font-size: 12px;
}

.user-icon {
  margin-right: 1px;
  font-size: 11px;
}

/* 加载状态样式 */
.el-icon-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>