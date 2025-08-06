# 多尺寸图片切割工具

一个功能强大的在线图片切割工具，支持多种预设尺寸和自定义尺寸，快速生成适配不同平台的图片。

## 功能特性

- 🖼️ 支持多种图片格式：PNG、JPG、WebP
- 📏 预设常用尺寸：微信头图、小红书、电商商品等
- 🌍 国外APP头像：Instagram、Threads、Facebook、Twitter、LinkedIn、YouTube、TikTok、WhatsApp、Telegram、Discord、Snapchat、Pinterest
- ✂️ 自定义尺寸：支持任意宽高设置
- 🎯 两种切割模式：裁剪模式和适配模式
- 🎨 自定义填充颜色
- 📦 批量下载：支持单张下载和打包下载
- 🌐 多语言支持：中文和英文
- 📱 移动端友好：响应式设计

## 多语言支持

本工具支持中文和英文两种语言：

- **中文版本**：访问 `/zh` 路径
- **英文版本**：访问 `/en` 路径
- **默认重定向**：访问根路径 `/` 会自动重定向到英文版本

### 语言切换

页面右上角提供语言切换器，可以随时切换语言。

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite
- **路由管理**：React Router DOM
- **UI 组件**：Radix UI + Tailwind CSS
- **状态管理**：React Context
- **图片处理**：Canvas API
- **文件处理**：JSZip + FileSaver

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署

项目已配置支持 Vercel 部署：

- 输出目录：`dist`
- 构建命令：`npm run build`
- 框架：Vite

## 使用说明

1. **上传图片**：拖拽或点击上传图片文件
2. **选择尺寸**：从预设尺寸中选择或添加自定义尺寸
3. **设置参数**：选择切割模式和输出格式
4. **开始切割**：点击开始按钮生成多尺寸图片
5. **下载结果**：单张下载或打包下载所有图片

## 许可证

MIT License
