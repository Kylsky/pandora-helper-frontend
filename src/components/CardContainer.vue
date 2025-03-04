<template>
    <div class="card-container" @wheel="handleWheel">
        <div class="cards-wrapper" :style="wrapperStyle">
            <div v-for="(component, index) in pages" 
                 :key="index"
                 class="card-page"
                 :style="pageStyle(index)"
                 :class="{ 'active': currentIndex === index }">
                <component :is="component" @navigate="handleNavigation"></component>
            </div>
        </div>
        
        <!-- 页面指示器 -->
        <div class="page-indicators">
            <div v-for="(page, index) in pageNames" 
                 :key="index"
                 class="indicator"
                 :class="{ 'active': currentIndex === index }"
                 @click="goToPage(index)">
                <span class="indicator-text">{{ page }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import IndexPage from './IndexPage.vue'
import PandoraPage from './PandoraPage.vue'
import ClaudePage from './ClaudePage.vue'
import MidjourneyPage from './MidjourneyPage.vue'

export default {
    name: 'CardContainer',
    components: {
        IndexPage,
        PandoraPage,
        ClaudePage,
        MidjourneyPage
    },
    data() {
        return {
            pages: [IndexPage, PandoraPage, ClaudePage, MidjourneyPage],
            pageNames: ['Panel', 'Pandora', 'Claude', 'Midjourney'],
            currentIndex: 0,
            isScrolling: false,
            transitionDuration: 0.8,
            lastWheelTime: 0,
            wheelDelay: 800 // 滚动延迟，防止连续触发
        }
    },
    computed: {
        wrapperStyle() {
            return {
                height: '100%',
                transform: `translateY(${-this.currentIndex * 100}vh)`,
                transition: `all ${this.transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`
            }
        }
    },
    methods: {
        pageStyle(index) {
            const distance = index - this.currentIndex;
            const scale = Math.abs(distance) <= 1 ? 1 - Math.abs(distance) * 0.05 : 0.95;
            const opacity = Math.abs(distance) <= 1 ? 1 - Math.abs(distance) * 0.2 : 0.8;
            
            return {
                transform: `translateY(${index * 100}vh) scale(${scale})`,
                opacity: opacity,
                transition: `all ${this.transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
                zIndex: this.currentIndex === index ? 2 : 1
            }
        },
        handleNavigation(route) {
            this.$router.push(route);
        },
        handleWheel(e) {
            const now = Date.now();
            if (now - this.lastWheelTime < this.wheelDelay) return;
            
            if (this.isScrolling) return;
            
            const deltaY = e.deltaY;
            if (Math.abs(deltaY) < 50) return; // 忽略微小的滚动
            
            if (deltaY > 0 && this.currentIndex < this.pages.length - 1) {
                this.isScrolling = true;
                this.currentIndex++;
                this.lastWheelTime = now;
            } else if (deltaY < 0 && this.currentIndex > 0) {
                this.isScrolling = true;
                this.currentIndex--;
                this.lastWheelTime = now;
            }
            
            setTimeout(() => {
                this.isScrolling = false;
            }, this.transitionDuration * 1000);
        },
        goToPage(index) {
            if (this.isScrolling) return;
            this.currentIndex = index;
        }
    }
}
</script>

<style scoped>
.card-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    perspective: 1000px;
}

.cards-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    will-change: transform;
    transform-style: preserve-3d;
}

.card-page {
    position: absolute;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    will-change: transform, opacity;
}

.page-indicators {
    position: fixed;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 50;
}

.indicator {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.indicator-text {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 0.75rem;
    color: white;
    font-size: 0.875rem;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.indicator:hover .indicator-text {
    opacity: 1;
    transform: translateY(-50%) translateX(-5px);
}

.indicator.active {
    background-color: white;
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.indicator:hover {
    background-color: white;
    transform: scale(1.2);
}

@media (max-width: 768px) {
    .page-indicators {
        right: 1rem;
        gap: 1rem;
    }

    .indicator {
        width: 1rem;
        height: 1rem;
    }

    .indicator-text {
        display: none;
    }

    .indicator.active {
        transform: scale(1.3);
    }

    .indicator:hover {
        transform: scale(1.3);
    }
}

@media (max-width: 480px) {
    .page-indicators {
        right: 0.5rem;
    }

    .indicator {
        width: 1.25rem;
        height: 1.25rem;
    }
}
</style> 