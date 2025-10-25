#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔄 开始更新版本号...')

// 读取 package.json 获取新版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const newVersion = packageJson.version

console.log(`📦 新版本号: v${newVersion}`)

// 更新 useVersion.js
const useVersionPath = path.join(__dirname, '..', 'src', 'composables', 'useVersion.js')
if (fs.existsSync(useVersionPath)) {
  let useVersionContent = fs.readFileSync(useVersionPath, 'utf8')
  
  // 使用更精确的正则表达式匹配
  const versionRegex = /const CURRENT_VERSION = ['"`][^'"`]+['"`]/
  if (versionRegex.test(useVersionContent)) {
    useVersionContent = useVersionContent.replace(
      versionRegex,
      `const CURRENT_VERSION = '${newVersion}'`
    )
    fs.writeFileSync(useVersionPath, useVersionContent)
    console.log('✅ 已更新 src/composables/useVersion.js')
  } else {
    console.log('⚠️  未找到 CURRENT_VERSION 在 useVersion.js 中')
  }
} else {
  console.log('⚠️  useVersion.js 文件不存在')
}

// 更新 README.md 中的版本号（如果存在）
const readmePath = path.join(__dirname, '..', 'README.md')
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8')
  
  // 查找并更新版本号（在更新日志部分）
  const versionInChangelogRegex = /### v\d+\.\d+\.\d+ \([\d-]+\)/
  const lines = readmeContent.split('\n')
  let updated = false
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('## 📋 更新日志') || lines[i].includes('## 更新日志')) {
      // 在更新日志部分，检查是否需要添加新版本
      let j = i + 1
      while (j < lines.length && !lines[j].startsWith('## ')) {
        if (lines[j].startsWith('### v')) {
          // 检查是否已经有当前版本的条目
          if (lines[j].includes(`v${newVersion}`)) {
            console.log('✅ README.md 中已存在当前版本条目')
            updated = true
            break
          }
        }
        j++
      }
      break
    }
  }
  
  if (!updated) {
    console.log('ℹ️  请手动在 README.md 中添加新版本的更新日志')
  }
}

console.log(`🎉 版本更新完成！当前版本: v${newVersion}`)
console.log('📝 请记得在 README.md 中添加新版本的更新日志')
