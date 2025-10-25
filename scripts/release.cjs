#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 获取命令行参数
const args = process.argv.slice(2)
const versionType = args[0] || 'patch' // patch, minor, major, prerelease

// 验证版本类型
const validTypes = ['patch', 'minor', 'major', 'prerelease']
if (!validTypes.includes(versionType)) {
  console.error('❌ 无效的版本类型。请使用: patch, minor, major, prerelease')
  process.exit(1)
}

console.log(`🚀 准备发布 ${versionType} 版本...`)

try {
  // 检查工作区是否干净
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })
  if (gitStatus.trim()) {
    console.log('⚠️  工作区有未提交的更改，请先提交：')
    console.log(gitStatus)
    process.exit(1)
  }

  // 运行测试（如果有的话）
  console.log('🧪 运行测试...')
  try {
    execSync('npm test', { stdio: 'inherit' })
  } catch (error) {
    console.log('ℹ️  没有测试脚本或测试失败，继续...')
  }

  // 构建项目
  console.log('🔨 构建项目...')
  execSync('npm run build', { stdio: 'inherit' })

  // 更新版本号
  console.log(`📦 更新版本号 (${versionType})...`)
  execSync(`npm version ${versionType}`, { stdio: 'inherit' })

  console.log('✅ 版本发布完成！')
  console.log('📝 请记得在 GitHub 上创建 Release 并添加更新日志')

} catch (error) {
  console.error('❌ 发布失败:', error.message)
  process.exit(1)
}
