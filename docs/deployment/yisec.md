# 部署到 yisec 二级域名

目标体验：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --open
```

本地自动探测 Codex 和 Claude Code 记录并完成取证，浏览器打开本机报告服务上的完整报告页 `http://127.0.0.1:4173/report/<id>`。如果两个来源都存在，默认融合分析；如果只存在一个来源，就只分析这个来源。公网 `vibe.yisec.ai` 只负责官网、样例和显式 `--share` 生成的脱敏分享页。

## 1. 创建 Cloudflare KV

已创建的生产 KV：

```toml
[[kv_namespaces]]
binding = "REPORTS"
id = "a876e1fd479649d98ddfb9dd9a530b98"
```

如果换 Cloudflare 账户，重新执行：

```bash
npx wrangler kv namespace create REPORTS
```

然后把输出里的 `id` 填回 `wrangler.toml`。

## 2. 绑定二级域名

默认配置使用：

```toml
routes = [
  { pattern = "vibe.yisec.ai", custom_domain = true }
]
```

如果最终域名不是 `vibe.yisec.ai`，同时修改：

- `wrangler.toml` 的 route
- README 里的 `--share` / `--upload-url`
- `src/cli/vibe-rank.mjs` 的默认公网分享站点

## 3. 部署

```bash
npx wrangler deploy
```

## 4. 验证

官网静态页面：

```bash
npm run site
```

公网分享上传模式：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --demo \
  --share \
  --open
```

## 隐私边界

默认 CLI 模式不会把原始日志或完整报告上传到云端。完整报告写入 `.airank/reports/<reportId>.json`，由本机 `/report/<id>` 页面读取。

`--no-write` 不会生成本地 `/report/<id>`；如果需要无本地文件的公网结果，必须同时显式传入 `--share` 或 `--upload-url`。

只有显式传入 `--share` 或 `--upload-url` 时，CLI 才会把脱敏 public payload 上传到 Cloudflare KV，用于生成公网 `/share/<id>` 链接。原始 Codex / Claude Code 日志和本地完整报告不会上传。
