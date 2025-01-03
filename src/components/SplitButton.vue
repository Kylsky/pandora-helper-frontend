<!-- SplitButton.vue -->
<template>
  <el-tooltip
    :content="tooltipContent"
    placement="top"
    effect="light"
  >
    <button class="split-button" :class="[type, {'disabled': count === 0}]" @click="handleClick">
      <span class="name-section">
        <i :class="typeIcon" class="type-icon"></i>
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
      if (Number(this.count) > 0) {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  max-width: 180px;
}

.split-button:not(.disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.name-section {
  background-color: #409EFF;
  color: white;
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
}

.info-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.count-section {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 32px;
  justify-content: center;
}

.days-section {
  background-color: #f0f9eb;
  color: #67C23A;
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 42px;
  justify-content: center;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
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

/* 按钮类型样式 */
.gpt .name-section {
  background-color: #409EFF;
}
.gpt .count-section {
  background-color: #ecf5ff;
  color: #409EFF;
}
.gpt .days-section {
  background-color: #ecf5ff;
  color: #409EFF;
}

.claude .name-section {
  background-color: #67C23A;
}
.claude .count-section {
  background-color: #f0f9eb;
  color: #67C23A;
}
.claude .days-section {
  background-color: #f0f9eb;
  color: #67C23A;
}

.api .name-section {
  background-color: #E6A23C;
}
.api .count-section {
  background-color: #fdf6ec;
  color: #E6A23C;
}
.api .days-section {
  background-color: #fdf6ec;
  color: #E6A23C;
}

/* 禁用状态样式 */
.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled .name-section {
  background-color: #909399;
}

.disabled .count-section,
.disabled .days-section {
  background-color: #f4f4f5;
  color: #909399;
}
</style>