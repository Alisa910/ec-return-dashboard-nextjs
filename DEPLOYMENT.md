# 🌐 部署指南

详细的生产环境部署说明

## 📋 目录

- [部署前准备](#部署前准备)
- [方式一：Vercel部署](#方式一vercel部署推荐)
- [方式二：自托管部署](#方式二自托管部署)
- [环境变量配置](#环境变量配置)
- [域名配置](#域名配置)
- [持续部署](#持续部署)

---

## 部署前准备

### 1. 确保数据已处理

```bash
# 运行数据处理脚本
python scripts/convertData.py

# 确认数据文件存在
# 路径: public/data/processed_data.json
```

⚠️ **重要**：Vercel不会自动运行Python脚本，必须先本地生成JSON数据

### 2. 测试本地构建

```bash
# 构建生产版本
npm run build

# 测试生产构建
npm run start
```

确保没有错误后再继续部署。

---

## 方式一：Vercel部署（推荐）

### 为什么选择Vercel？

- ✅ **免费额度**：个人项目完全免费
- ✅ **自动部署**：推送到GitHub自动触发部署
- ✅ **全球CDN**：访问速度快
- ✅ **零配置**：自动检测Next.js项目
- ✅ **HTTPS**：自动配置SSL证书

### 步骤1：推送到GitHub

#### 使用BAT脚本（Windows）

```bash
双击运行: 🌐推送GitHub.bat
```

#### 手动推送

```bash
# 初始化Git仓库（如果未初始化）
git init
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ec-return-dashboard.git

# 添加并提交文件
git add .
git commit -m "Initial commit: EC Return Dashboard"

# 推送到GitHub
git push -u origin main
```

### 步骤2：导入到Vercel

1. **访问Vercel**
   - 网址：https://vercel.com
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Import Git Repository"

3. **选择仓库**
   - 找到您刚推送的 `ec-return-dashboard` 仓库
   - 点击 "Import"

4. **配置项目**（通常无需修改）
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **部署**
   - 点击 "Deploy"
   - 等待1-2分钟构建完成

6. **获取URL**
   - 部署成功后，Vercel会提供一个URL
   - 格式：`https://your-project.vercel.app`

### 步骤3：验证部署

访问Vercel提供的URL，检查：
- ✅ 页面正常加载
- ✅ 数据正确显示
- ✅ 页面跳转正常
- ✅ 响应式布局正常

---

## 方式二：自托管部署

### Docker部署

#### 1. 创建Dockerfile

项目已包含 `Dockerfile`（如需自定义）：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. 构建镜像

```bash
docker build -t ec-dashboard .
```

#### 3. 运行容器

```bash
docker run -p 3000:3000 ec-dashboard
```

### 传统服务器部署

#### 1. 构建项目

```bash
npm run build
```

#### 2. 启动服务

```bash
npm run start
```

#### 3. 使用PM2保持运行

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "ec-dashboard" -- start

# 设置开机自启
pm2 startup
pm2 save
```

#### 4. 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 环境变量配置

### Vercel环境变量

在Vercel项目设置中添加：

1. 进入项目 → Settings → Environment Variables

2. 添加变量（可选）：

```env
NEXT_PUBLIC_APP_NAME=EC退货率Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 本地环境变量

创建 `.env.local` 文件：

```env
# 应用配置
NEXT_PUBLIC_APP_NAME=EC退货率Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# API配置（如有）
# API_BASE_URL=https://api.example.com
```

⚠️ **注意**：`.env.local` 不会被提交到Git

---

## 域名配置

### Vercel自定义域名

1. 进入项目 → Settings → Domains
2. 点击 "Add Domain"
3. 输入您的域名（如：`dashboard.yourcompany.com`）
4. 按提示配置DNS记录

#### DNS配置示例

在您的DNS服务商添加：

**CNAME记录**：
```
dashboard.yourcompany.com  →  cname.vercel-dns.com
```

或 **A记录**：
```
dashboard.yourcompany.com  →  76.76.21.21
```

5. 等待DNS生效（通常5-30分钟）
6. Vercel自动配置HTTPS证书

---

## 持续部署（CI/CD）

### Vercel自动部署

配置完成后，每次推送到GitHub都会自动触发部署：

```bash
# 更新代码
git add .
git commit -m "更新数据或功能"
git push

# Vercel自动检测并部署
# 约1-2分钟后生效
```

### 分支部署策略

- **main分支** → 生产环境
- **dev分支** → 预览环境

创建dev分支：
```bash
git checkout -b dev
git push -u origin dev
```

Vercel会为dev分支创建独立的预览URL。

---

## 数据更新流程

### 完整更新流程

1. **本地更新CSV数据**
   ```bash
   # 替换CSV文件
   # 路径: D:\HQ文件夹data\EC退货率\EC退货率变化.csv
   ```

2. **运行数据处理**
   ```bash
   python scripts/convertData.py
   ```

3. **提交并推送**
   ```bash
   git add public/data/processed_data.json
   git commit -m "更新退货率数据"
   git push
   ```

4. **自动部署**
   - Vercel自动检测推送
   - 重新构建并部署
   - 约2分钟后生效

---

## 监控与维护

### 性能监控

Vercel提供内置分析：
- 访问 Project → Analytics
- 查看页面加载时间
- 监控访问量

### 错误日志

查看部署日志：
- Project → Deployments
- 点击具体部署记录
- 查看 Build Logs 和 Runtime Logs

---

## 回滚部署

如果新版本有问题，快速回滚：

1. 进入 Vercel → Deployments
2. 找到上一个稳定版本
3. 点击右侧 "..." → "Promote to Production"
4. 确认回滚

---

## 故障排查

### 部署失败

**检查清单**：
- [ ] `package.json` 正确配置
- [ ] 所有依赖已安装
- [ ] TypeScript编译无错误
- [ ] 数据文件存在

### 页面空白

**原因**：
- 数据文件未包含在Git中
- JSON格式错误

**解决**：
```bash
# 确保数据文件被跟踪
git add public/data/processed_data.json
git commit -m "添加数据文件"
git push
```

### 样式丢失

**原因**：Tailwind CSS未正确配置

**解决**：
检查 `tailwind.config.ts` 和 `postcss.config.js`

---

## 安全建议

1. **不要提交敏感信息**
   - API密钥放在环境变量
   - 使用 `.gitignore` 排除敏感文件

2. **启用访问限制**（可选）
   - Vercel支持密码保护
   - Settings → General → Password Protection

3. **定期更新依赖**
   ```bash
   npm update
   npm audit fix
   ```

---

## 成本估算

### Vercel免费计划

- ✅ 无限项目
- ✅ 100GB带宽/月
- ✅ 自定义域名
- ✅ 自动HTTPS

**足够支持内部使用！**

### 升级场景

仅在以下情况需要付费：
- 每月访问量 > 100GB
- 需要更多团队成员
- 需要高级分析功能

---

## 技术支持

遇到部署问题？

1. 查看 [Vercel文档](https://vercel.com/docs)
2. 查看项目 `README.md`
3. 联系项目维护人员

---

**部署愉快！** 🚀
