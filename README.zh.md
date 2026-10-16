[English](README.md) | 中文

# dsh-avatar-chat

为 DeepSeek Harness 的对话记录加上**双头像** —— 每条用户消息右侧一个用户头像，每条回答左侧一个助手头像 —— 并在设置里提供一个**「头像对话」**页面，分别开关两侧、更换图片、调节尺寸。

这是一个 DSH Web 客户端插件：一个 Cordis bundle，注册一个 `settings.section` 席位，并用一张页面级样式表装饰对话记录。

## 截图

对话记录 —— 请求气泡右侧是用户头像，回复气泡左侧是助手头像，均为 50 像素：

![对话记录中的双头像](docs/transcript.png)

设置 —— 本插件新增的**「头像对话」**页面，两侧都已换图：

![头像对话设置页](docs/settings.png)

两张图取自作者本人的桌面版实机（中文界面、自定义壁纸）；图中的图片、尺寸与开关就是该页面提供的全部控件。

## 功能

- **两个彼此独立的头像。** 用户侧与助手侧各有自己的显示开关、自己的图片、自己的恢复默认。
- **图片来自本地或地址。** 可上传 PNG / JPEG / WebP / GIF（上限 5 MiB，自动缩放到 256 px），也可粘贴 `https://…` 地址；地址会在采用前探测一次。
- **不上传图片也有内置外观。** 未设置图片时，每一侧用纯 CSS 画一个圆盘，只用主题令牌 —— 不打包图片、不用字面颜色，浅色与深色主题都正确。
- **尺寸 20–64 px**，同时作用于对话记录与设置页预览，即时生效。
- **该不画的地方不画。** 一条回答会被拆成 reasoning 行与 response 行，只有回答行带头像，所以一条回复不会出现两个头像。
- **干净卸载。** 插件写入的每个根属性与自定义属性都会在释放时移除。

## 环境要求

- DeepSeek Harness `0.2.1-alpha.4`（Web / 桌面版）。插件只使用随宿主发布的主题令牌与 `settings.section` 席位。
- bundle 在运行时 `require` 的四个模块 —— `react`、`react/jsx-runtime`、`@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-primitives` —— 都在 shell 的冻结模块表里，无需在本包旁边额外安装。

## 安装

profile 级插件以 **bundle** 形式加入 profile。profile 自己的 `cordis.patch.yml` 是**按 id 定位**的：只能覆盖或禁用 bundle 层已声明的条目，往里加一行没有任何效果。

### 手工安装（已验证）

适用于桌面版：它的 profile 由应用独占管理，无法通过 `dsh` CLI 修改。

1. 把本仓库按包名复制进 profile 的 `node_modules`：

   ```
   <profile>/node_modules/dsh-avatar-chat/
   ```

   `<profile>` 例如 `~/.dsh/profiles/desktop`。需要 `package.json`、`cordis.patch.yml` 与 `lib/`。

2. 在 profile 的 `package.json` 里把包名加进 `dsh.profile.bundles`：

   ```json
   "dsh": {
     "profile": {
       "bundles": [
         "…",
         "dsh-avatar-chat"
       ]
     }
   }
   ```

   列在这里才会被装配进配置树；**不需要**同时出现在 `dependencies` 里。

3. 重启应用。bundle 栈在启动时重新装配。

### 其他 profile

对于 `dsh` CLI 有权管理的 profile：

```sh
dsh plugin --profile <profile> add link:<本仓库的绝对路径>
```

### 验证

重启后，下面这条命令应当返回包名与真实目录：

```
cordis_inspect → host / Config / listConfigs { "entry": "include:ui-avatar-chat" }
```

## 使用

打开**设置 → 头像对话**。

- **用户头像** / **助手头像** —— 开关控制该侧是否在对话中显示；图片按钮打开文件选择；**恢复默认**把该侧还原成内置圆盘。
- **图片地址** —— 粘贴 `https://…` 后点「使用该地址」。
- **头像尺寸** —— 20 px 到 64 px，改动立即生效。

其余无需操作：对话会在下一次绘制时读取设置。

## 存储与隐私

偏好保存在浏览器的 `localStorage`，键名固定为 `dsh.avatar-chat.v1`，内容为 JSON：

```json
{ "schemaVersion": 1, "size": 28,
  "user":      { "visible": true, "image": "data:image/webp;base64,…" },
  "assistant": { "visible": true, "image": null } }
```

- 上传的图片以 **data URL** 存储 —— 不离开浏览器，也永远不会写进会话记录。
- 该值是**同源共享存储中的明文**：同源的任何脚本都能读到。不要上传你不想放进本地文件的东西。
- 读取与写入逐项做了保护。来源被拒、配额用尽或值损坏时会降级为内存态偏好并在页面上提示，而不是让插件加载失败。
- `schemaVersion` 不符、尺寸越界或某一侧结构损坏的文档会被就地修正，并标记为 damaged。

## 工作原理

DSH **没有**为单条消息行添加前后装饰的 Slot：`conversation.chat.node` 的 keyed 席位已被宿主自带的渲染器占满（`user`、`steering`、`assistant-step` 等），第三方包也无法导入或包裹它们。对话子树里的类名又都是 CSS-Modules 哈希，别的包选不中。

稳定的是行元素本身，它带着 `data-chat-flow-kind`（等于 chat node kind）、`data-chat-turn` 与 `data-chat-group-part`。所以插件发布一张页面级样式表，按这些属性选择，并完全由根元素状态驱动：

- 属性 `data-dsh-avatar-chat`、`-user`、`-user-image`、`-assistant`、`-assistant-image`
- 自定义属性 `--dsh-avatar-chat-size` 与两个图片变量

头像由绝对定位的 `::before` 绘制，位置落在样式表为被装饰行预留的内边距里；行本身保持宿主给的 `display`，因此不影响宿主布局。

样式表是一个普通的 `.css` 副作用导入，DSH 的客户端打包器会把它变成带标记的 `<style data-plugin-css>` 元素，并按 tag id 去重，因此重复执行插件不会重复注入。所有根写入都是绝对值，重复应用是幂等的。

## 已知限制

- 装饰依赖 `data-chat-flow-kind`，它**不是公开契约**。宿主改了行标记，头像会静默消失，直到选择器跟着更新。
- 只有 `user`、`steering`、`assistant-step` 三类行有头像。工具调用、命令、系统提示、turn-process 行没有。
- 被装饰的行会变成 `position: relative`，因而成为其自身绝对定位后代的包含块。
- 头像不携带逐消息身份 —— 同一时刻只有一个用户头像与一个助手头像。
- 远程图片地址只在应用时探测一次，之后不再复检。
- 内置圆盘使用 `--dsw-alias-brand-primary`：浅色下接近黑、深色下接近白，是反相单色，不是品牌蓝。

## 兼容性

已在 Windows 上对照 DeepSeek Harness `0.2.1-alpha.4` 与随包发布的 Web 客户端验证：既有单元测试，也有针对装配后 profile 的真实 headless Chromium 运行。

## 从源码构建

本仓库的 `lib/` 就是构建产物，也是 loader 实际读取的东西。重新构建需要一份 DeepSeek Harness 源码检出：本包由仓库共享的客户端打包预设 `packages/client/tsdown.client.ts` 编译，`window.__ModuleLoader__.load({ id, factory })` 外壳、平台外部依赖与 CSS 内联都由它负责。

重新构建：把 `src/` 放到检出中的 `packages/client/ui-avatar-chat/src`，然后

```sh
pnpm --filter @deepseek-ai/dsh-client-ui-avatar-chat bundle
```

**包名必须保持一致** —— 写进 `lib/client.js` 的模块 id 来自 `package.json`，loader 用它把 bundle 行与模块对应起来。

## 许可证

MIT
