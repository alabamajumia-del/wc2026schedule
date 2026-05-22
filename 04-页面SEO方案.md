# 04. 页面 SEO 方案

## 1. 页面 SEO 总原则

每个页面必须做到：

- URL、Title、H1、首段清晰表达页面主题。
- 一个页面只服务一个主要搜索意图。
- 使用 H2/H3 构建清晰信息结构。
- 内容覆盖相关概念和用户常见问题。
- 不堆砌关键词。
- 通过内链建立中心辐射结构。
- 通过 Schema、FAQ、简洁答案提升搜索结果和 AI 检索可见性。

## 2. Title 标签规则

要求：

- 控制在 70 个字符以内。
- 包含主关键词或自然变体。
- 匹配搜索意图。
- 对时效主题标注 2026。
- 不制造误导性好奇心。

示例：

| 页面 | SEO Title |
| --- | --- |
| `/world-cup-2026-schedule/` | World Cup 2026 Schedule: Dates, Matches, Times & Cities |
| `/world-cup-2026-dates/` | World Cup Dates 2026: Start Date, Final & Full Timeline |
| `/world-cup-2026-schedule-pdf/` | World Cup 2026 Schedule PDF Download |
| `/world-cup-2026-schedule-excel/` | World Cup 2026 Schedule Excel Download |
| `/world-cup-2026-groups/` | World Cup 2026 Groups: Teams, Fixtures & Standings Guide |
| `/world-cup-2026-tickets/` | World Cup 2026 Tickets Guide: Official Info, Dates & Tips |

## 3. Meta Description 规则

要求：

- 控制在 160 个字符以内。
- 补充 title 未覆盖的信息。
- 使用主动语态。
- 自然包含主关键词或变体。

示例：

```text
View the World Cup 2026 schedule with match dates, kickoff times, host cities, groups, PDF download, Excel planner, TV guide and ticket info.
```

```text
Download the World Cup 2026 schedule PDF for printable match dates, kickoff times, host cities, stadiums and tournament stages.
```

```text
Check World Cup 2026 tickets information, official sources, ticket phases, buying tips, scam warnings and host city planning advice.
```

## 4. URL 规则

要求：

- 简短。
- 小写。
- 使用连字符。
- 包含目标关键词核心部分。
- 不包含日期，除非页面主题本身需要。
- 不使用无意义参数。

推荐：

```text
/world-cup-2026-schedule/
/world-cup-2026-dates/
/world-cup-2026-schedule-pdf/
/world-cup-2026-schedule-excel/
/world-cup-2026-groups/
/world-cup-2026-tickets/
```

避免：

```text
/post/2026/05/22/world-cup-schedule-update-final-version/
/page?id=123
/fifa-world-cup-2026-official-tickets-sale-now/
```

## 5. H 标签结构规则

每个页面只能有一个 H1。

推荐层级：

```text
H1: 页面主题
H2: 主要内容模块
H3: 支撑 H2 的细分问题、示例、说明
```

示例：

```text
H1: World Cup 2026 Schedule
H2: Full World Cup 2026 Match Schedule
H2: Match Dates and Kickoff Times
H3: Group Stage Dates
H3: Knockout Stage Dates
H2: Schedule by Team
H2: Schedule by Host City
H2: FAQ
```

## 6. 首段与零点击优化

每个核心页面开头 100 words 内必须回答核心问题。

推荐写法：

```text
The World Cup 2026 schedule runs from June 11 to July 19, 2026, with matches played across the United States, Canada, and Mexico. This page organizes the tournament by date, team, stage, host city, stadium, and kickoff time.
```

原则：

- 用陈述句。
- 尽早亮出核心事实。
- 避免铺垫式废话。
- 适合被 Google Featured Snippet 或 AI Overview 直接引用。

## 7. 内链规则

采用中心辐射模型：

```text
核心页：/world-cup-2026-schedule/
分支页：Dates, PDF, Excel, Groups, Standings, Bracket, Final, Host Cities, TV, Tickets, Teams, Cities
```

所有重要子页面都要回链到主赛程页。

自然锚文本示例：

```text
See the full World Cup 2026 schedule
Download the printable schedule
Check matches in Dallas
View Brazil’s match schedule
Compare all host cities
See official ticket information
```

避免：

```text
world cup 2026 schedule world cup 2026 schedule click here
best world cup 2026 schedule keyword page
```

每页建议：

```text
3-6 个正文内链
1 个相关页面模块
1 个面包屑导航
```

## 8. 外部链接规则

适合链接的外部来源：

- FIFA 官方赛程页。
- FIFA 官方票务页。
- FIFA 官方分组/规则页。
- 主办城市官方旅游或交通网站。
- 球场官方网站。
- 官方转播商页面。

外链原则：

- 只在能增强可信度的位置添加。
- 不链接低质量票务转售页面。
- 门票页优先链接官方购票入口。
- 外部链接要有清晰上下文，不要堆在页面底部。

## 9. 图片 SEO 规则

图片需要做到：

1. 压缩图片，减少加载时间。
2. 使用描述性文件名。
3. 使用描述性 alt 文本。

示例：

```text
文件名：dallas-world-cup-2026-stadium.jpg
Alt：AT&T Stadium in Dallas, one of the World Cup 2026 host venues
```

```text
文件名：world-cup-2026-schedule-table.png
Alt：World Cup 2026 schedule table with match dates, teams and host cities
```

禁止：

```text
world-cup-2026-schedule-world-cup-2026-schedule-best.jpg
```

## 10. Schema 标记规则

核心页推荐：

```text
Article
FAQPage
BreadcrumbList
Organization
```

工具页推荐：

```text
Article
FAQPage
HowTo
BreadcrumbList
```

具体比赛页推荐：

```text
SportsEvent
BreadcrumbList
FAQPage
```

城市/球场页推荐：

```text
Article
FAQPage
Place
BreadcrumbList
```

FAQPage 使用条件：

- 页面中真实展示 FAQ。
- FAQ 答案简短、准确、可独立理解。
- 不使用 FAQPage 标记隐藏内容。

## 11. E-E-A-T 规则

每个核心页面底部应包含：

```text
Last updated: [date]
Sources: FIFA official schedule, host city websites, stadium websites, official broadcaster or ticket sources.
Editorial note: Times, ticket details and broadcaster information may change. Always confirm with official sources.
```

作者信息建议：

```text
Written by World Cup Schedule Editorial Team
Reviewed for schedule accuracy and source consistency
```

门票、直播、赛程、积分榜等高时效页面必须定期复核。

## 12. 内容差距优化

发布前检查同类排名页面是否覆盖以下信息：

- 完整赛程。
- 日期和阶段解释。
- 时区转换。
- PDF/Excel 下载。
- 球队筛选。
- 城市筛选。
- 球场信息。
- 门票信息。
- 直播信息。
- FAQ。
- 官方来源。

如果竞品覆盖而本站缺失，应补充独立章节，而不是硬塞关键词。

## 13. Core Web Vitals 和体验规则

页面体验要求：

- 首屏快速加载。
- 移动端表格可横向滚动或卡片化展示。
- 不使用侵入式弹窗遮挡内容。
- 下载按钮清晰可见。
- 筛选器在移动端易用。
- 图片使用合适尺寸和懒加载。
- 页面通过 HTTPS 访问。

赛程表移动端建议：

- 桌面端使用表格。
- 移动端使用 MatchCard。
- 日期、球队、城市、阶段和时间必须易读。

## 14. 页面 SEO 检查清单

发布前逐页检查：

```text
[ ] URL 是否简短并包含主题
[ ] Title 是否 70 字符以内
[ ] Meta Description 是否 160 字符以内
[ ] 是否只有一个 H1
[ ] H2/H3 是否结构清晰
[ ] 首段是否回答核心问题
[ ] 正文是否 800+ words
[ ] 主关键词是否自然出现
[ ] 关键词族密度是否 3%-5%
[ ] 是否包含 3-6 个内链
[ ] 是否包含权威外链
[ ] 是否包含 FAQ
[ ] 是否添加合适 Schema
[ ] 图片文件名和 alt 是否描述清楚
[ ] 是否包含 Last updated 和 Sources
[ ] 移动端是否可读、可操作
```

