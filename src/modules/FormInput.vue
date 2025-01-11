<!-- FormInput.vue -->
<template>
    <div class="form-group">
        <label v-if="!field.hideLabel" :for="field.id" class="form-label">{{ field.label }}</label>
        <input v-if="!field.hideLabel && (field.type === 'number' | field.type === 'text' | field.type === 'date' | field.type === 'password')" :type="field.type"
            v-model="localValue" :id="field.id" class="form-input">

        <select v-if="field.type === 'select'" v-model="localValue" :id="field.id" class="form-select"
            @change="handleSelectChange($event)">
            <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>

        <div v-if="field.type === 'checkbox'" class="switch-wrapper">
            <input type="checkbox" v-model="localValue" :id="field.id" class="switch-input">
            <label :for="field.id" class="switch-label">
                <span class="switch-button"></span>
            </label>
            <!-- <span class="switch-text">{{ field.label }}</span> -->
        </div>
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
            // console.log("选中的值: ", selectedValue);
            // 通过 $emit 将选中的值传递出去
            this.$emit('handleSelectChange', {type:1, field: this.field, value: selectedValue });
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