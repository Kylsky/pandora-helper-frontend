<!-- FormInput.vue -->
<template>
    <div class="form-group" :style="getContainerStyle()">
        <!-- 分组标题 -->
        <div v-if="field.type === 'group'" class="form-group-title">
            <h4 v-if="field.label" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ field.label }}</h4>
            <div v-if="field.label" class="h-px bg-gray-200 dark:bg-gray-700 w-full mb-3"></div>
            <div v-else class="clearfix"></div>
        </div>
        
        <!-- 普通表单字段 -->
        <template v-else>
            <label v-if="!field.hideLabel && field.type !== 'checkbox'" :for="field.id" class="form-label">{{ field.label }}</label>
            <input v-if="!field.hideLabel && (field.type === 'number' | field.type === 'text' | field.type === 'date' | field.type === 'password')" :type="field.type"
                v-model="localValue" :id="field.id" class="form-input">

            <select v-if="field.type === 'select'" v-model="localValue" :id="field.id" class="form-select"
                @change="handleSelectChange($event)">
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.text }}
                </option>
            </select>

            <div v-if="field.type === 'checkbox' && !field.hideLabel" class="switch-wrapper" :class="{'inline-switch': field.layout === 'inline'}">
                <span class="switch-text">{{ field.label }}</span>
                <div class="switch-container">
                    <input type="checkbox" v-model="localValue" :id="field.id" class="switch-input">
                    <label :for="field.id" class="switch-label">
                        <span class="switch-button"></span>
                    </label>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        field: Object
    },
    data() {
        return {
            localValue: this.initializeValue()
        };
    },
    methods: {
        initializeValue() {
            if (this.field.type === 'select' && this.field.options && this.field.options.length > 0) {
                return this.field.value || this.field.options[0].value;
            }
            return this.field.value;
        },
        handleSelectChange(event) {
            const selectedValue = event.target.value;
            // 通过 $emit 将选中的值传递出去
            this.$emit('handleSelectChange', {type:1, field: this.field, value: selectedValue });
        },
        getContainerStyle() {
            if (this.field.layout === 'inline') {
                return {
                    display: 'inline-block',
                    width: this.field.width || 'auto',
                    verticalAlign: 'top',
                    paddingRight: '4px',
                    paddingLeft: '4px'
                };
            }
            return {};
        }
    },
    watch: {
        localValue(newValue) {
            this.$emit('updateValue', this.field.id, newValue);
        },

        field: {
            handler() {
                this.localValue = this.initializeValue();
            },
            deep: true,
            immediate: true
        }
    }
};
</script>

<style scoped>
/* 样式部分保持不变 */
.form-group {
    margin-bottom: 16px;
    max-width: 100%;
}

.form-group-title {
    width: 100%;
    margin-top: 8px;
}

.clearfix {
    clear: both;
    display: block;
    width: 100%;
    height: 1px;
}

.form-label {
    @apply block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input,
.form-select {
    @apply w-full px-3 py-2 text-sm leading-5 rounded-md transition-all duration-200;
    @apply text-gray-900 dark:text-gray-100;
    @apply bg-white dark:bg-gray-700;
    @apply border border-gray-300 dark:border-gray-600;
    @apply focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20;
    @apply focus:border-emerald-500 dark:focus:border-emerald-400;
    @apply placeholder-gray-400 dark:placeholder-gray-500;
}

.form-select {
    @apply appearance-none bg-no-repeat;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

/* 深色模式下的下拉箭头 */
@media (prefers-color-scheme: dark) {
    .form-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    }
}

.switch-wrapper {
    @apply flex items-center space-x-3;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background-color 0.2s;
    border: 1px solid transparent;
}

.switch-wrapper:hover {
    @apply bg-gray-50 dark:bg-gray-800;
    border-color: #e5e7eb;
}

.inline-switch {
    @apply justify-between;
    margin-bottom: 0;
    height: 100%;
}

.switch-container {
    display: flex;
    align-items: center;
}

.switch-input {
    @apply hidden;
}

.switch-label {
    @apply relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out;
    @apply bg-gray-200 dark:bg-gray-700;
}

.switch-button {
    @apply pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out;
    @apply translate-x-0;
}

.switch-input:checked + .switch-label {
    @apply bg-emerald-500 dark:bg-emerald-600;
}

.switch-input:checked + .switch-label .switch-button {
    @apply translate-x-5;
}

.switch-text {
    @apply text-sm font-medium text-gray-700 dark:text-gray-300;
    flex: 1;
}

/* 移动端适配 */
@media (max-width: 480px) {
    .form-input,
    .form-select {
        @apply text-sm py-1.5;
    }

    .form-label,
    .switch-text {
        @apply text-xs;
    }

    .switch-label {
        @apply h-5 w-9;
    }

    .switch-button {
        @apply h-4 w-4;
    }

    .switch-input:checked + .switch-label .switch-button {
        @apply translate-x-4;
    }
}

/* 禁用状态 */
.form-input:disabled,
.form-select:disabled {
    @apply opacity-50 cursor-not-allowed;
    @apply bg-gray-100 dark:bg-gray-800;
}
</style>