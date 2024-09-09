<!-- Modal.vue -->
<template>
    <transition name="modal-fade">
        <div v-if="isVisible" class="modal-overlay" @click="close">
            <div class="modal-content" @click.stop>
                <header class="modal-header">
                    <h3>{{ title }}</h3>
                    <button class="close-button" @click="close">&times;</button>
                </header>
                <main class="modal-body">
                    <slot></slot>
                </main>
                <footer class="modal-footer">
                    <button class="btn btn-confirm" @click="confirm">确认</button>
                    <button class="btn btn-cancel" @click="close">取消</button>
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
    methods: {
        close() {
            this.$emit('close');
        },
        confirm() {
            this.$emit('confirm');
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    transition: color 0.3s;
}

.close-button:hover {
    color: #333;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #e0e0e0;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.btn-confirm {
    /* background-color: #4CAF50; */
    background-color: #0e8f6f;
    color: white;
    margin-right: 10px;
}

.btn-confirm:hover {
    background-color: #45a049;
}

.btn-cancel {
    background-color: #f44336;
    color: white;
}

.btn-cancel:hover {
    background-color: #da190b;
}

.modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s;
}

.modal-fade-enter, .modal-fade-leave-to {
    opacity: 0;
}
</style>