# 我的护肤方案（公开小程序）

这是一份可在手机和电脑上直接打开的静态护肤小程序：按「普通日 / 工地日 / 约会日」和当天星期，列出早晚要做什么，并包含痘痘处理、药品与护肤品清单、叠用规则、补货规则和每日打卡。

全部内容都写在 [`data.json`](./data.json) 里。页面只负责把这份数据展示出来，改 JSON 再提交，小程序就会变。

- 最后更新：2026-11-13
- 仓库：https://github.com/Itachi0819-a/skincare-plan
- 在线使用（GitHub Pages）：https://itachi0819-a.github.io/skincare-plan/
- 原始数据（给 AI 直接读取）：https://raw.githubusercontent.com/Itachi0819-a/skincare-plan/main/data.json

本方案不含姓名、电话和面部照片。

## 怎么用

打开上面的 Pages 链接，选今天是普通日、工地日还是约会日。早晚步骤会按今天星期几自动排好。下面还可以：

- 点选痘的类型，看该用什么、用几天、什么情况要去看医生
- 筛选家里的药和护肤品
- 勾选今日打卡（只存在这台设备的浏览器里，换手机不同步，第二天自动清空）

本地预览：把本仓库放到任意静态服务器根目录即可，例如 `python3 -m http.server 8080`，然后打开 `http://localhost:8080`。不要直接用 `file://` 打开，浏览器可能拦截 `data.json`。

## 别人或其他 AI 怎么改

仓库是公开的，谁都可以读取。GitHub 不会让路人直接改主分支，所以「谁都能修改」的实际做法是：

1. **Fork** 本仓库，改 `data.json`（或页面文件），再开 **Pull Request**。仓库主人审核后合并，Pages 会自动更新。
2. 仓库主人自己改：在 GitHub 网页打开 `data.json`，点编辑，改完提交到 `main`。
3. 把 [raw data.json](https://raw.githubusercontent.com/Itachi0819-a/skincare-plan/main/data.json) 和 [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) 发给 ChatGPT、Gemini、Claude 等，它们可以按说明起草修改，再通过 PR 或由主人提交。

请不要把协作者权限随便加给陌生人。打卡记录在访客自己的浏览器里，不会写回仓库。

## 安全规则（改方案时必须遵守）

- 阿达帕林与班赛不同时同部位
- 抗生素膏只短期使用，用在痘上时要配班赛，防止耐药
- 激素膏（地奈德、丙酸氟替卡松）不用于痘，也不在脸上长期用
- 出现大片疼痛脓疱、发烧、迅速扩散或久不好，及时看皮肤科。口服抗生素、异维A酸等必须由医生决定
- 本页是日常护理参考，不能代替医生面诊

更完整的数据结构和修改说明见 [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)。
