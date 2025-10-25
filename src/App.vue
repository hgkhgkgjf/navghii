<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">{{ customTitle }}</h1>
        
        <div class="header-actions">
          <!-- Admin Controls in Header -->
          <template v-if="isAuthenticated">
            <button 
              class="btn btn-secondary"
              @click="settingsPage.open()"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
              </svg>
              <span>设置</span>
            </button>
            
            <button 
              class="btn"
              :class="isEditMode ? 'btn-primary' : 'btn-secondary'"
              @click="isEditMode = !isEditMode"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>{{ isEditMode ? '完成' : '编辑' }}</span>
            </button>
          </template>
          
          <button 
            v-if="!isAuthenticated" 
            class="btn btn-primary"
            @click="loginModal.open()"
          >
            登录
          </button>
          <button 
            v-else 
            class="btn btn-secondary"
            @click="handleLogout"
          >
            退出
          </button>
        </div>
      </div>
      
      <div v-if="showSearch" class="header-search">
        <SearchBar />
      </div>
      
      <CategoryButtons />
      
      <!-- Edit Mode Toolbar -->
      <EditModeToolbar 
        :is-edit-mode="isEditMode"
        @addBookmark="handleAddBookmark"
        @addCategory="handleAddCategory"
      />
    </header>
    
    <!-- Main Content -->
    <main class="app-main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="categories.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <p>还没有分类</p>
        <p v-if="isAuthenticated" style="font-size: 0.9rem; margin-top: 0.5rem;">
          点击右上角 ⚙️ 设置按钮开始添加
        </p>
        <p v-else style="font-size: 0.9rem; margin-top: 0.5rem;">
          请先登录以管理书签
        </p>
      </div>
      
      <div v-else class="categories-container">
        <CategorySection
          v-for="category in categories"
          v-show="!hideEmptyCategories || (bookmarksByCategory[category.id]?.length > 0)"
          :key="category.id"
          :category="category"
          :bookmarks="bookmarksByCategory[category.id] || []"
          :is-edit-mode="isEditMode"
          @edit-category="handleEditCategory"
          @delete-category="handleDeleteCategory"
          @edit-bookmark="handleEditBookmark"
          @delete-bookmark="handleDeleteBookmark"
          @reorder-bookmarks="handleReorderBookmarks"
        />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content" v-html="footerContent"></div>
    </footer>
    
    <!-- Floating Buttons -->
    <FloatingButtons />
    
    <!-- Modals -->
    <LoginModal ref="loginModal" />
    <BookmarkDialog ref="bookmarkDialog" />
    <ConfirmDialog ref="confirmDialog" />
    <PromptDialog ref="promptDialog" />
    <FooterEditDialog ref="footerEditDialog" />
    <ImportExportDialog ref="importExportDialog" />
    
    <!-- Settings Page -->
    <SettingsPage 
      ref="settingsPage"
      :is-dark="isDark"
      :bookmarks="bookmarks"
      :show-search="showSearch"
      :hide-empty-categories="hideEmptyCategories"
      :custom-title="customTitle"
      :footer-content="footerContent"
      :active-settings-tab="activeSettingsTab"
      @action="handleSettingsAction"
      @toggle-theme="toggleTheme"
      @toggle-search="toggleSearch"
      @toggle-hide-empty="toggleHideEmptyCategories"
      @update-title="updateCustomTitle"
      @update-footer="updateFooterContent"
      @editTitle="handleEditTitle"
      @editFooter="handleEditFooter"
      @setActiveTab="setActiveSettingsTab"
    />
    
    <!-- Toast Notifications -->
    <ToastNotification ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useBookmarks } from './composables/useBookmarks'
import { useTheme } from './composables/useTheme'
import { useSettings } from './composables/useSettings'
import { useToast } from './composables/useToast'
import SearchBar from './components/SearchBar.vue'
import CategoryButtons from './components/CategoryButtons.vue'
import CategorySection from './components/CategorySection.vue'
import FloatingButtons from './components/FloatingButtons.vue'
import EditModeToolbar from './components/EditModeToolbar.vue'
import SettingsPage from './components/SettingsPage.vue'
import LoginModal from './components/LoginModal.vue'
import BookmarkDialog from './components/BookmarkDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import PromptDialog from './components/PromptDialog.vue'
import FooterEditDialog from './components/FooterEditDialog.vue'
import ImportExportDialog from './components/ImportExportDialog.vue'
import ToastNotification from './components/ToastNotification.vue'

const { isAuthenticated, logout, onAuthChange } = useAuth()
const {
  categories,
  bookmarks,
  bookmarksByCategory,
  fetchData,
  addCategory,
  updateCategory,
  deleteCategory,
  updateBookmark,
  deleteBookmark,
  reorderItems
} = useBookmarks()
const { isDark, toggleTheme } = useTheme()
const { showSearch, hideEmptyCategories, customTitle, footerContent, activeSettingsTab, toggleSearch, toggleHideEmptyCategories, updateCustomTitle, updateFooterContent, setActiveSettingsTab } = useSettings()
const { setToastInstance, success: toastSuccess, error: toastError } = useToast()

const loading = ref(true)
const isEditMode = ref(false)
const loginModal = ref(null)
const bookmarkDialog = ref(null)
const confirmDialog = ref(null)
const promptDialog = ref(null)
const footerEditDialog = ref(null)
const importExportDialog = ref(null)
const settingsPage = ref(null)
const toast = ref(null)

onMounted(async () => {
  await fetchData()
  loading.value = false
  
  // 初始化 Toast
  if (toast.value) {
    setToastInstance(toast.value)
  }
  
  // 监听登录状态变化，重新获取数据
  onAuthChange(async () => {
    await fetchData()
  })
})

const handleLogout = async () => {
  const confirmed = await confirmDialog.value.open('确定要退出登录吗？')
  if (confirmed) {
    logout()
    isEditMode.value = false
    await fetchData()
  }
}

const handleSettingsAction = (action) => {
  switch (action) {
    case 'importExport':
      // 导入导出保持在设置页面内，不关闭设置页面
      importExportDialog.value.open()
      break
    case 'addBookmark':
      // 其他操作需要关闭设置页面
      settingsPage.value.close()
      setTimeout(() => {
        bookmarkDialog.value.open()
      }, 300)
      break
    case 'addCategory':
      // 其他操作需要关闭设置页面
      settingsPage.value.close()
      setTimeout(() => {
        handleAddCategory()
      }, 300)
      break
  }
}

const handleAddCategory = async () => {
  const name = await promptDialog.value.open('新建分类', '', '请输入分类名称')
  if (name) {
    const result = await addCategory(name)
    if (result.success) {
      toastSuccess('分类添加成功')
    } else {
      toastError(result.error || '添加分类失败')
    }
  }
}

const handleEditCategory = async (category) => {
  const name = await promptDialog.value.open('编辑分类', category.name, '请输入新的分类名称')
  if (name && name !== category.name) {
    const result = await updateCategory(category.id, name)
    if (result.success) {
      toastSuccess('分类已更新')
    } else {
      toastError(result.error || '更新分类失败')
    }
  }
}

const handleDeleteCategory = async (category) => {
  const confirmed = await confirmDialog.value.open(
    `确定要删除分类"${category.name}"吗？该分类下的所有书签也将被删除。`,
    '删除分类'
  )
  if (confirmed) {
    const result = await deleteCategory(category.id)
    if (result.success) {
      toastSuccess('分类已删除')
    } else {
      toastError(result.error || '删除分类失败')
    }
  }
}

const handleEditBookmark = (bookmark) => {
  bookmarkDialog.value.open(bookmark)
}

const handleDeleteBookmark = async (bookmark) => {
  const confirmed = await confirmDialog.value.open(
    `确定要删除书签"${bookmark.name}"吗？`,
    '删除书签'
  )
  if (confirmed) {
    const result = await deleteBookmark(bookmark.id)
    if (result.success) {
      toastSuccess('书签已删除')
    } else {
      toastError(result.error || '删除书签失败')
    }
  }
}

const handleReorderBookmarks = async (items) => {
  // 如果items包含category_id，说明是跨分类移动
  if (items[0]?.category_id) {
    const item = items[0]
    // 从所有书签中查找，而不是从目标分类中查找
    const bookmark = bookmarks.value.find(b => b.id === item.id)
    if (bookmark) {
      await updateBookmark(item.id, {
        ...bookmark,
        category_id: item.category_id,
        position: item.position
      })
    }
  } else {
    // 同分类内排序
    await reorderItems('bookmarks', items)
  }
}

const handleEditTitle = async () => {
  const newTitle = await promptDialog.value.open('自定义标题', customTitle.value, '请输入新的标题')
  if (newTitle && newTitle.trim()) {
    updateCustomTitle(newTitle.trim())
    toastSuccess('标题已更新')
  }
}

const handleEditFooter = async () => {
  const newFooter = await footerEditDialog.value.open('自定义页脚', footerContent.value, '请输入页脚HTML内容')
  if (newFooter !== null) {
    updateFooterContent(newFooter)
    toastSuccess('页脚已更新')
  }
}

const handleAddBookmark = () => {
  bookmarkDialog.value.open()
}
</script>

