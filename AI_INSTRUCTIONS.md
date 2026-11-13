# 给 AI 和协作者的说明

你正在接手一份公开的日常护肤与祛痘方案小程序。请先读完本文和 `data.json`，再提出修改，不要从头再问一遍已经写明的信息。

## 这是什么

- 静态网页：`index.html` + `app.js` + `style.css`，无构建步骤。
- 所有方案内容都在 `data.json`。界面完全由这份 JSON 渲染：改数据并提交到 `main`，GitHub Pages 就会更新。
- 原始数据（请直接抓取，不要只靠肉眼看页面）：
  - https://raw.githubusercontent.com/Itachi0819-a/skincare-plan/main/data.json
- 在线页面：
  - https://itachi0819-a.github.io/skincare-plan/
- 仓库：
  - https://github.com/Itachi0819-a/skincare-plan
- 最后更新字段：`last_updated`（当前为 2026-11-13）

回答请用中文，先给结论，具体到用什么、用多少、涂哪、多久。不要索要或传播面部照片，不要写入真实姓名或电话。不要替用户下单。


## 体质与私密背景（重要）

- `profile.constitution` 写的是会影响护肤用药的体质注意事项：用户长期在用处方药，口服药和新处方药一律先问医生；破口、脓疱要重视防感染；整体偏保守。请默认遵守，不要追问原因。
- 用户还有一份**私密健康补充说明**，不在本仓库。如果用户在对话里贴出来，请把它当作默认已知的背景，优先于本仓库的通用描述。
- **不要**把私密说明里的病名、药名或任何健康细节写进本仓库（包括 PR、提交说明、Issue）。

## 怎么提交修改

GitHub 的公开仓库允许任何人**读取**和**提出修改**，但不能让路人直接改 `main`。正确做法：

1. Fork 本仓库，在分支上编辑 `data.json`（偶尔才需要改 `app.js` / `style.css` / 本文）。
2. 开 Pull Request，说明改了什么、依据是什么（新订单、用户亲口确认、医嘱等）。
3. 仓库主人审核并合并后，Pages 自动生效。
4. 主人自己也可以在 GitHub 网页上直接编辑 `data.json` 并提交到 `main`。

提交前请：

- 保持 `data.json` 为合法 JSON（建议 UTF-8、2 空格缩进）
- 更新 `last_updated` 为当天日期
- 遵守下文安全规则
- 不要添加面部照片、姓名、电话、身高体重、疾病诊断或系统性疾病用药，以及其他无关个人信息
- 不要把「待确认」改成「已确认」，除非有新的证据

## 数据架构（data.json）

| 字段 | 作用 |
| --- | --- |
| `title`, `summary`, `one_liner`, `last_updated` | 标题、简介、一句话口诀、更新日期 |
| `profile` | 肤况摘要。有性别、肤色、肤质、主诉、户外工作习惯，以及 `constitution`（体质用药注意）和 `private_context`。不要写入疾病诊断、系统性疾病用药、身高体重、姓名、电话或照片 |
| `preferences` | 购物与护理偏好 |
| `safety_rules` | 必须遵守的用药安全规则 |
| `day_types` | `normal` 普通日 / `site` 工地日 / `date` 约会日 |
| `weekdays` | 周日到周六，下标与 `Date.getDay()` 一致（0=周日） |
| `focus` | 每晚重点：`rest` / `sa` / `plain` / `retinol` |
| `am_steps`, `pm_steps` | 早晚步骤模板，见下 |
| `spots`, `default_spot`, `red_flag` | 痘型指南与红旗提醒 |
| `inventory` | 药品与护肤品清单（每项含 name, kind, status, role, when, where, avoid, buy, src） |
| `inventory_filters`, `inventory_status_tones` | 列表筛选与状态颜色 |
| `combos` | 组合能否同用：`可以` / `错开` / `不要` |
| `adjustments` | 加量和刺激时的调整步骤 |
| `restock`, `restock_rules`, `consider_buying` | 历史成交价、补货规则、可考虑但不急着买的东西 |
| `unverified` | 尚未核实的事项 |
| `sources`, `disclaimer`, `links` | 依据、免责声明、仓库与 raw 链接 |

`inventory.status` 只能是：`在用` / `部分剩余` / `存货待用完` / `应急备用` / `收起不用` / `已停用` / `已用完` / `待确认`。

`inventory.kind` 只能是：`药` / `护肤` / `其它药`。

### 步骤模板怎么写

`am_steps` 和 `pm_steps` 是数组。每一项至少有 `id`，以及 `title` / `detail`，或按日子类型写的 `variants`。

可选过滤字段（都是数组）：

- `only_kinds` / `except_kinds`：针对 `normal` / `site` / `date`
- `only_focus` / `except_focus`：针对当天晚上的 `rest` / `sa` / `plain` / `retinol`

`variants` 的键是日子类型。缺省时回退到条目自身的 `title` 和 `detail`。

应用会按「当前日子类型 + 当前星期的 focus」过滤并拼接步骤。改轮换规则时，请同时检查 `focus`、`week_notes` 和相关步骤的过滤条件。

打卡复选框按「今天的真实星期 + 用户选的日子类型」生成，存在 `localStorage`，键为 `checkoff.storage_prefix` + `YYYY-MM-DD`。

## 安全规则（不可轻易改掉）

1. **阿达帕林与班赛不同时同部位。** 同一颗、同一处，当晚只选一样。
2. **抗生素短期配班赛。** 红霉素或夫西地酸二选一，一天 2 次，最多 5～7 天；用在痘上时配班赛，防止耐药。不单独长期用，不用在闭口上。
3. **激素膏不用于痘、也不在脸上长期用。** 地奈德、丙酸氟替卡松会诱发痘和激素脸。标签不清的药膏先别上脸。
4. **出现红旗情况及时看皮肤科。** 出现大片疼痛脓疱、发烧、迅速扩散或久不好，及时看皮肤科。口服抗生素、异维A酸等必须由医生决定，不要自行用药。
5. **A 类不叠同一区。** 阿达帕林不和维A酸乳膏、A醇叠在同一区域。

本方案是日常护理参考，不能代替面诊。

## 改清单时的习惯

- 买到新东西或用完：改对应条目的 `status`、`buy`、`src`，必要时同步 `restock` 和 `unverified`。
- 早年护肤品默认按已用完；酸类未用完可标「部分剩余」。
- 价格优先写订单实付。同单多件可能是整单金额，请在 `buy` 里标明。
- 不要把外观相似的产品写成同一件。
