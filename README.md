# XieFactura（mobille）

基于 Vite + Vue3 的 Electron & 移动（Cordova）项目。

## 开发启动

- 启动开发环境：`npm run dev`
- Electron 开发窗口将自动加载本地服务 `http://localhost:5173/`。

## 一键打包（Electron + Android）

执行一条命令即可同时打包桌面端安装包和安卓 APK：

```bash
npm run release
```

流程说明：
- 自动递增版本号（例如 `0.0.1 -> 0.0.2`）
- 构建 Electron 安装包（输出在 `output/<version>/`）
- 初始化 Cordova（若不存在）并添加 Android 平台
- 构建移动端产物（`dist-mobile`）、同步到 `cordova/www`
- 生成 Android 多尺寸图标（若缺少 `cordova-res` 会跳过并使用默认图标）
- 构建 Android APK（同时复制到 `output/<version>/android/`）

## 环境要求（Windows）

- Node.js：建议使用 LTS 版本（推荐 `v20.x`）
- Electron 构建：允许 `electron-builder` 网络访问（代理/防火墙需放行）
- Java & Android：
  - 安装 JDK（推荐 JDK 17），设置 `JAVA_HOME` 与 `PATH`
  - 安装 Android SDK，设置 `ANDROID_SDK_ROOT`
  - `PATH` 包含 `platform-tools` 与对应版本的 `build-tools`
- 图标生成（可选）：`npm i -D cordova-res`，确保网络可下载 `sharp` 所需依赖

## 图标来源

- Electron 安装包图标：`public/favicon.ico`
- Cordova 图标生成脚本会优先从以下路径选择 `SVG/PNG`：
  - `../vue-factura/public/vite.svg`、`../vue-factura/public/icon.png`
  - 或当前项目 `public/vite.svg`、`public/icon.png`
  - 若没有 `SVG/PNG` 将跳过生成并使用默认图标

## 手动分步打包

只打包 Electron：

```bash
npm run build:electron
```

只打包 Android（首次需初始化 Cordova）：

```bash
# 首次初始化（生成 cordova/ 并添加 android 平台）
npm run cordova:init

# 构建移动端产物
npm run build:mobile

# 同步至 cordova/www
npm run cordova:sync

# 生成 Android 图标（可选）
npm run cordova:res

# 打包 APK
npm run cordova:build
```

## 输出位置

- Electron 安装包：`output/<version>/`
- Android APK：`output/<version>/android/`

## 常见问题

- `ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`：检查网络/代理/防火墙，确保 `electron-builder` 可下载依赖。
- `sharp`/`cordova-res` 安装失败：确认网络畅通或稍后重试（一键打包会在图标生成失败时跳过）。
