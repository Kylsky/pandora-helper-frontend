<!-- FormInput.vue -->
<template>
    <div class="form-group">
        <label :for="field.id" class="form-label">{{ field.label }}</label>
        <input v-if="field.type === 'text'" type="text" v-model="localValue" :id="field.id" class="form-input">
        <select v-if="field.type === 'select'" v-model="localValue" :id="field.id" class="form-select">
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
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #333;
}

.form-input,
.form-select {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.4;
    color: #333;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 28px;
}

.switch-wrapper {
    display: flex;
    align-items: center;
}

.switch-input {
    display: none;
}

.switch-label {
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
}

.switch-button {
    width: 18px;
    height: 18px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: transform 0.3s;
}

.switch-input:checked+.switch-label {
    background-color: #43cea2;
}

.switch-input:checked+.switch-label .switch-button {
    transform: translateX(20px);
}

.switch-text {
    margin-left: 8px;
    font-size: 14px;
    color: #333;
}

@media (max-width: 480px) {

    .form-input,
    .form-select {
        font-size: 13px;
        padding: 6px 10px;
    }

    .form-label,
    .switch-text {
        font-size: 11px;
    }
}
</style>