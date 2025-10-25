<template>
  <Transition name="page">
    <div v-if="show" class="settings-page">
      <div class="settings-container">
        <!-- Header -->
        <div class="settings-header">
          <button 
            class="back-btn" 
            @click="close"
            aria-label="关闭设置"
            title="关闭设置"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 id="settings-title">设置</h2>
          <button 
            class="menu-toggle" 
            @click="toggleSidebar"
            :aria-expanded="sidebarOpen"
            :aria-controls="'settings-sidebar'"
            aria-label="切换设置菜单"
            title="切换设置菜单"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
        
        <!-- Two-column layout -->
        <div class="settings-layout">
          <!-- Left Sidebar -->
          <div 
            id="settings-sidebar"
            class="settings-sidebar" 
            :class="{ 'sidebar-open': sidebarOpen }"
            @click.stop
            role="navigation"
            aria-label="设置菜单"
          >
            <div class="sidebar-menu" role="tablist">
              <div 
                v-for="item in menuItems" 
                :key="item.id"
                :class="['menu-item', { active: activeTab === item.id }]"
                @click="setActiveTab(item.id)"
                role="tab"
                :aria-selected="activeTab === item.id"
                :aria-controls="`settings-${item.id}`"
                :tabindex="activeTab === item.id ? 0 : -1"
                :aria-label="`切换到${item.name}`"
              >
                <div class="menu-icon" aria-hidden="true">{{ item.icon }}</div>
                <div class="menu-text">{{ item.name }}</div>
              </div>
            </div>
          </div>
          
          <!-- Mobile overlay -->
          <div 
            v-if="sidebarOpen" 
            class="sidebar-overlay"
            @click="sidebarOpen = false"
          ></div>
          
          <!-- Right Content -->
          <div 
            class="settings-content"
            role="tabpanel"
            :aria-labelledby="`settings-${activeTab}`"
            :id="`settings-${activeTab}`"
          >
            <component 
              :is="currentSettingsComponent" 
              v-bind="componentProps"
              @action="handleAction"
              @editTitle="editTitle"
              @editFooter="editFooter"
              @toggleTheme="$emit('toggleTheme')"
              @toggleSearch="$emit('toggleSearch')"
              @toggleHideEmpty="$emit('toggleHideEmpty')"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppearanceSettings from './settings/AppearanceSettings.vue'
import DataSettings from './settings/DataSettings.vue'
import AboutSettings from './settings/AboutSettings.vue'

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  bookmarks: {
    type: Array,
    default: () => []
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  hideEmptyCategories: {
    type: Boolean,
    default: false
  },
  customTitle: {
    type: String,
    default: '📚 书签管理'
  },
  footerContent: {
    type: String,
    default: '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>'
  },
  activeSettingsTab: {
    type: String,
    default: 'appearance'
  }
})

const emit = defineEmits(['action', 'close', 'toggleTheme', 'toggleSearch', 'toggleHideEmpty', 'updateTitle', 'updateFooter', 'editTitle', 'editFooter', 'setActiveTab'])

const menuItems = ref([
  { id: 'appearance', name: '外观设置', icon: '🎨' },
  { id: 'data', name: '数据管理', icon: '📊' },
  { id: 'about', name: '关于', icon: 'ℹ️' }
])

const totalBookmarks = computed(() => props.bookmarks.length)
const privateBookmarks = computed(() => props.bookmarks.filter(b => b.is_private).length)

const show = ref(false)
const activeTab = ref(props.activeSettingsTab)
const sidebarOpen = ref(false)

const currentSettingsComponent = computed(() => {
  const components = {
    appearance: AppearanceSettings,
    data: DataSettings,
    about: AboutSettings
  }
  return components[activeTab.value] || AppearanceSettings
})

const componentProps = computed(() => ({
  isDark: props.isDark,
  showSearch: props.showSearch,
  hideEmptyCategories: props.hideEmptyCategories,
  customTitle: props.customTitle,
  footerContent: props.footerContent,
  totalBookmarks: totalBookmarks.value,
  privateBookmarks: privateBookmarks.value
}))

const open = () => {
  show.value = true
}

const close = () => {
  show.value = false
  emit('close')
}

const handleAction = (action) => {
  emit('action', action)
}

const editTitle = () => {
  emit('editTitle')
}

const editFooter = () => {
  emit('editFooter')
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  emit('setActiveTab', tab)
  // 移动端选择后自动关闭侧边栏
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 键盘导航支持
const handleKeydown = (event) => {
  if (!show.value) return
  
  // ESC 键关闭设置
  if (event.key === 'Escape') {
    close()
    return
  }
  
  // 侧边栏键盘导航
  if (sidebarOpen.value && event.key === 'Tab') {
    const menuItems = document.querySelectorAll('.menu-item')
    const activeIndex = Array.from(menuItems).findIndex(item => 
      item.classList.contains('active')
    )
    
    if (event.shiftKey && activeIndex > 0) {
      event.preventDefault()
      menuItems[activeIndex - 1].focus()
    } else if (!event.shiftKey && activeIndex < menuItems.length - 1) {
      event.preventDefault()
      menuItems[activeIndex + 1].focus()
    }
  }
  
  // 方向键导航
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const menuItems = document.querySelectorAll('.menu-item')
    const activeIndex = Array.from(menuItems).findIndex(item => 
      item.classList.contains('active')
    )
    
    let nextIndex
    if (event.key === 'ArrowDown') {
      nextIndex = activeIndex < menuItems.length - 1 ? activeIndex + 1 : 0
    } else {
      nextIndex = activeIndex > 0 ? activeIndex - 1 : menuItems.length - 1
    }
    
    setActiveTab(menuItems[nextIndex].getAttribute('data-tab') || menuItems[nextIndex].textContent.trim())
  }
}

// 生命周期钩子
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  open,
  close
})
</script>

<style scoped>
.settings-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.settings-container {
  background: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: 0 25px 50px var(--shadow-xl);
  width: 100%;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-8);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

.dark .settings-header {
  background: rgba(15, 23, 42, 0.8);
}

.back-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  border-radius: var(--radius-sm);
}

.back-btn:hover {
  background: var(--bg-secondary);
}

.back-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.settings-header h2 {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.settings-header h2::before {
  content: '⚙️';
  font-size: var(--text-xl);
}

.menu-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  border-radius: var(--radius-sm);
}

.menu-toggle:hover {
  background: var(--bg-secondary);
}

.menu-toggle svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.placeholder {
  width: 40px;
}

/* Layout */
.settings-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.settings-sidebar {
  width: 320px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: var(--space-6) 0;
  overflow-y: auto;
  transition: var(--transition);
  backdrop-filter: blur(10px);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0 var(--space-4);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius);
  color: var(--text-secondary);
  position: relative;
  font-weight: var(--font-medium);
}

.menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text);
  transform: translateX(4px);
}

.menu-item.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: white;
  border-radius: 0 2px 2px 0;
}

.menu-icon {
  font-size: var(--text-xl);
  width: 28px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  flex: 1;
}

/* Content */
.settings-content {
  flex: 1;
  padding: var(--space-8);
  overflow-y: auto;
  background: var(--bg);
  position: relative;
}

.settings-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}

/* Page animation */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .settings-page {
    padding: 0;
  }
  
  .settings-container {
    height: 100vh;
    border-radius: 0;
    flex-direction: column;
    max-width: 100%;
  }
  
  .settings-layout {
    flex-direction: row;
    position: relative;
  }
  
  .settings-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 320px;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    border-right: 1px solid var(--border);
    border-bottom: none;
    padding: var(--space-6) 0;
    backdrop-filter: blur(20px);
    background: rgba(248, 250, 252, 0.95);
  }
  
  .dark .settings-sidebar {
    background: rgba(30, 41, 59, 0.95);
  }
  
  .settings-sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 0 0 50px var(--shadow-xl);
  }
  
  .sidebar-menu {
    flex-direction: column;
    gap: var(--space-2);
    padding: 0 var(--space-4);
    overflow-x: visible;
  }
  
  .menu-item {
    flex-shrink: 0;
    padding: var(--space-4) var(--space-6);
    white-space: nowrap;
    border-radius: var(--radius-md);
  }
  
  .settings-content {
    padding: var(--space-6);
    width: 100%;
  }
  
  /* 侧边栏遮罩 */
  .sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 5;
    backdrop-filter: blur(4px);
  }
  
  /* 设置项在移动端的优化 */
  .form-group {
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }
  
  .form-header {
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  
  .form-icon {
    width: 40px;
    height: 40px;
  }
  
  .form-title {
    font-size: var(--text-base);
  }
  
  .form-description {
    font-size: var(--text-xs);
  }
  
  .btn {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-xs);
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .settings-header {
    padding: var(--space-4) var(--space-5);
  }
  
  .settings-header h2 {
    font-size: var(--text-lg);
  }
  
  .settings-sidebar {
    width: 100%;
  }
  
  .settings-content {
    padding: var(--space-4);
  }
  
  .form-group {
    padding: var(--space-3);
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .form-icon {
    width: 36px;
    height: 36px;
  }
  
  .menu-item {
    padding: var(--space-3) var(--space-4);
  }
  
  .menu-text {
    font-size: var(--text-xs);
  }
}
</style>