# 部署到 yisec 二级域名

目标体验：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source codex --open
```

本地完成取证和脱敏，浏览器打开 `https://vibe.yisec.ai` 上的报告页。

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
- README 里的 `--site` / `--upload-url`
- `src/cli/vibe-rank.mjs` 的默认 `site`

## 3. 部署

```bash
npx wrangler deploy
```

## 4. 验证

静态报告模式：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --demo --site https://vibe.yisec.ai --open
```

短链接上传模式：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --demo \
  --short-link \
  --open
```

## 隐私边界

默认 `--site` 模式不会把原始日志上传到云端，也不会把报告 JSON 上传到 Worker。报告数据只在 URL hash 里，由浏览器本地渲染。

只有显式传入 `--short-link` 或 `--upload-url` 时，CLI 才会把最终报告 JSON 上传到 Cloudflare KV，用于生成短链接。原始 Codex / Claude Code 日志不会上传。
