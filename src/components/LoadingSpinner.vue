<template>
  <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/85 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-300 ease-in-out rounded-lg">
    <div class="flex flex-col items-center p-7 min-w-[120px] bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-xl">
      <div v-if="type === 'bounce'" class="relative w-[50px] h-[50px]">
        <div class="absolute inset-0 w-full h-full rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-bounce-1"></div>
        <div class="absolute inset-0 w-full h-full rounded-full opacity-70 bg-blue-400 dark:bg-blue-300 animate-bounce-2"></div>
      </div>
      
      <div v-else-if="type === 'pulse'" class="relative w-[50px] h-[50px]">
        <div class="absolute inset-0 w-full h-full rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-pulse-custom"></div>
      </div>
      
      <div v-else-if="type === 'dots'" class="flex items-center justify-center w-[70px] h-[30px]">
        <div class="w-3 h-3 mx-1 rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-dots-1"></div>
        <div class="w-3 h-3 mx-1 rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-dots-2"></div>
        <div class="w-3 h-3 mx-1 rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-dots-3"></div>
      </div>
      
      <div v-else class="relative w-[50px] h-[50px]">
        <div class="absolute inset-0 w-full h-full rounded-full opacity-70 bg-blue-500 dark:bg-blue-400 animate-bounce-1"></div>
        <div class="absolute inset-0 w-full h-full rounded-full opacity-70 bg-blue-400 dark:bg-blue-300 animate-bounce-2"></div>
      </div>
      
      <p class="mt-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{{ loadingText }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    type: {
      type: String,
      default: 'bounce',
      validator: function (value) {
        return ['bounce', 'pulse', 'dots'].indexOf(value) !== -1
      }
    }
  }
}
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { 
    transform: scale(0.0);
  } 50% { 
    transform: scale(1.0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes dots {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}

.animate-bounce-1 {
  animation: bounce 2s infinite ease-in-out;
}

.animate-bounce-2 {
  animation: bounce 2s infinite ease-in-out -1s;
}

.animate-pulse-custom {
  animation: pulse 1.2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

.animate-dots-1 {
  animation: dots 1.4s infinite ease-in-out;
  animation-delay: -0.32s;
}

.animate-dots-2 {
  animation: dots 1.4s infinite ease-in-out;
  animation-delay: -0.16s;
}

.animate-dots-3 {
  animation: dots 1.4s infinite ease-in-out;
}
</style> 