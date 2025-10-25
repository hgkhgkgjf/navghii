<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="dialog-overlay" @click="close">
        <div class="dialog-box import-export-dialog" @click.stop>
          <h3 class="dialog-title">导入/导出书签</h3>
          
          <div class="export-section">
            <h4>导出书签</h4>
            <p class="section-description">将当前所有书签导出为文件</p>
            <div class="button-group">
              <button class="btn btn-primary" @click="exportJSON">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                导出为 JSON
              </button>
              <button class="btn btn-secondary" @click="exportHTML">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                导出为 HTML
              </button>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="import-section">
            <h4>导入书签</h4>
            <p class="section-description">从文件导入书签（支持 JSON 和 HTML 格式）</p>
            <div class="import-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4m0-4h.01"/>
              </svg>
              <span>导入会自动跳过已存在的书签和分类</span>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept=".json,.html,.htm"
              style="display: none"
              @change="handleFileSelect"
            >
            <button class="btn btn-primary" @click="selectFile" :disabled="importing">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ importing ? '导入中...' : '选择文件导入' }}
            </button>
            <p v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
              {{ importResult.message }}
            </p>
          </div>
          
          <div class="dialog-buttons">
            <button class="btn btn-secondary" @click="close">关闭</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'

const { categories, bookmarks } = useBookmarks()
const { getAuthHeaders } = useAuth()

const show = ref(false)
const fileInput = ref(null)
const importing = ref(false)
const importResult = ref(null)

const open = () => {
  show.value = true
  importResult.value = null
}

const close = () => {
  show.value = false
}

// 导出为 JSON
const exportJSON = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    categories: categories.value,
    bookmarks: bookmarks.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  importResult.value = { success: true, message: '✅ JSON 文件已导出' }
}

// 导出为 HTML (Netscape 书签格式)
const exportHTML = () => {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`
  
  // 按分类组织
  const categoriesMap = {}
  categories.value.forEach(cat => {
    categoriesMap[cat.id] = cat.name
  })
  
  // 按分类分组书签
  const bookmarksByCategory = {}
  bookmarks.value.forEach(bookmark => {
    const catName = categoriesMap[bookmark.category_id] || '未分类'
    if (!bookmarksByCategory[catName]) {
      bookmarksByCategory[catName] = []
    }
    bookmarksByCategory[catName].push(bookmark)
  })
  
  // 生成 HTML
  Object.keys(bookmarksByCategory).forEach(catName => {
    html += `    <DT><H3>${escapeHtml(catName)}</H3>\n`
    html += `    <DL><p>\n`
    bookmarksByCategory[catName].forEach(bookmark => {
      const timestamp = Math.floor(new Date(bookmark.created_at).getTime() / 1000)
      html += `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${timestamp}">${escapeHtml(bookmark.name)}</A>\n`
      if (bookmark.description) {
        html += `        <DD>${escapeHtml(bookmark.description)}\n`
      }
    })
    html += `    </DL><p>\n`
  })
  
  html += `</DL><p>`
  
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.html`
  a.click()
  URL.revokeObjectURL(url)
  
  importResult.value = { success: true, message: '✅ HTML 文件已导出' }
}

// HTML 转义
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// 选择文件
const selectFile = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  importing.value = true
  importResult.value = null
  
  try {
    const text = await file.text()
    
    if (file.name.endsWith('.json')) {
      await importJSON(text)
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      await importHTML(text)
    } else {
      throw new Error('不支持的文件格式')
    }
  } catch (error) {
    importResult.value = { success: false, message: '❌ 导入失败：' + error.message }
  } finally {
    importing.value = false
    fileInput.value.value = ''
  }
}

// 导入 JSON
const importJSON = async (text) => {
  const data = JSON.parse(text)
  
  // 验证数据格式
  if (!data.categories || !data.bookmarks) {
    throw new Error('无效的 JSON 格式')
  }
  
  // 调用批量导入 API
  const response = await fetch('/api/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      categories: data.categories,
      bookmarks: data.bookmarks
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    const msg = `✅ 导入成功！\n\n新增：${result.imported.categories} 个分类，${result.imported.bookmarks} 个书签\n跳过：${result.skipped.categories} 个分类，${result.skipped.bookmarks} 个书签（已存在）`
    importResult.value = { success: true, message: msg }
    
    // 刷新页面数据
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } else {
    throw new Error(result.error || '导入失败')
  }
}

// 导入 HTML
const importHTML = async (text) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  
  const categories = []
  const bookmarks = []
  let categoryPosition = 0
  
  // 递归解析嵌套的书签结构
  const parseBookmarkNode = (node, currentCategoryId = null) => {
    const children = node.children
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      
      // 找到分类标题 (H3)
      if (child.tagName === 'H3') {
        const categoryName = child.textContent.trim()
        
        // 跳过 "书签栏" 这类顶级容器
        if (!categoryName || categoryName === '书签栏' || categoryName === 'Bookmarks') {
          continue
        }
        
        const categoryId = categories.length + 1
        categories.push({
          id: categoryId,
          name: categoryName,
          position: categoryPosition++
        })
        
        // 找到该分类下的 DL 容器
        let dlElement = child.nextElementSibling
        while (dlElement && dlElement.tagName !== 'DL') {
          dlElement = dlElement.nextElementSibling
        }
        
        if (dlElement) {
          parseBookmarkNode(dlElement, categoryId)
        }
      }
      // 找到书签链接 (A)
      else if (child.tagName === 'A' && currentCategoryId) {
        const url = child.getAttribute('HREF') || child.getAttribute('href')
        const name = child.textContent.trim()
        
        if (url && name && url.startsWith('http')) {
          // 查找描述（在 DD 元素中）
          let description = ''
          let nextEl = child.parentElement.nextElementSibling
          if (nextEl && nextEl.tagName === 'DD') {
            description = nextEl.textContent.trim()
          }
          
          bookmarks.push({
            id: bookmarks.length + 1,
            name: name,
            url: url,
            description: description || null,
            icon: null,
            category_id: currentCategoryId,
            position: bookmarks.filter(b => b.category_id === currentCategoryId).length,
            is_private: 0
          })
        }
      }
      // 递归处理 DL 和 DT 容器
      else if (child.tagName === 'DL' || child.tagName === 'DT') {
        parseBookmarkNode(child, currentCategoryId)
      }
    }
  }
  
  // 从 body 开始解析
  parseBookmarkNode(doc.body)
  
  if (categories.length === 0 && bookmarks.length === 0) {
    throw new Error('未找到有效的书签数据')
  }
  
  // 调试：打印解析结果
  console.log('解析的分类:', categories)
  console.log('解析的书签:', bookmarks.slice(0, 3)) // 只打印前3个
  
  // 调用批量导入 API
  const response = await fetch('/api/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      categories: categories,
      bookmarks: bookmarks
    })
  })
  
  const result = await response.json()
  
  console.log('导入结果:', result)
  
  if (result.success) {
    const msg = `✅ 导入成功！\n\n新增：${result.imported.categories} 个分类，${result.imported.bookmarks} 个书签\n跳过：${result.skipped.categories} 个分类，${result.skipped.bookmarks} 个书签（已存在）`
    importResult.value = { success: true, message: msg }
    
    // 刷新页面数据
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } else {
    throw new Error(result.error || '导入失败')
  }
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.import-export-dialog {
  max-width: 500px;
}

/* 确保导入导出对话框显示在设置页面之上 */
.dialog-overlay {
  z-index: 4000 !important;
}

.export-section,
.import-section {
  margin-bottom: 1.5rem;
}

.export-section h4,
.import-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.section-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.button-group .btn {
  flex: 1;
  min-width: 140px;
}

.button-group .btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 1.5rem 0;
}

.import-status {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.import-result {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.import-result.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.import-result.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.import-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--primary);
}

.import-notice svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

