<template>
  <div class="settings-section">
    <h2 class="section-title">关于</h2>
    
    <!-- 版本信息 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4m0-4h.01"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">版本信息</div>
          <div class="form-description">v1.1.0</div>
        </div>
      </div>
    </div>
    
    <!-- GitHub 仓库 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">GitHub 仓库</div>
          <div class="form-description">查看源代码和文档</div>
        </div>
      </div>
      <a 
        href="https://github.com/deerwan/nav" 
        target="_blank"
        class="btn btn-primary"
      >
        访问 GitHub
      </a>
    </div>
    
    <!-- 技术栈 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">技术栈</div>
          <div class="form-description">
            Vue 3 + Vite + Cloudflare Pages + D1
          </div>
        </div>
      </div>
    </div>
    
    <!-- 许可证 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">许可证</div>
          <div class="form-description">Apache License 2.0</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个组件不需要 props 或 emits
</script>

<style scoped>
.settings-section {
  max-width: 800px;
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text);
  margin-bottom: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title::before {
  content: 'ℹ️';
  font-size: var(--text-xl);
}

.form-group {
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.form-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--info), var(--info-light));
  opacity: 0;
  transition: var(--transition);
}

.form-group:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-md);
}

.form-group:hover::before {
  opacity: 1;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-icon {
  width: 48px;
  height: 48px;
  background: var(--info);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: var(--transition);
}

.form-group:hover .form-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.form-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.form-content {
  flex: 1;
}

.form-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-title::before {
  content: '🔗';
  font-size: var(--text-base);
}

.form-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.btn {
  width: 100%;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition);
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>
