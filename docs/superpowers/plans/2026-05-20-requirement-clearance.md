# Requirement Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 ZenFlow 需求池增加项目关键需求/问题消项跟进能力。

**Architecture:** 在现有 `requirements` 数据模型上增量扩展消项字段，后端通过 PostgreSQL 迁移和仓储 SQL 保持旧数据兼容，前端在 `main.jsx` 的需求池中增加视图筛选、列表展示和表单维护。保持当前单文件业务主体，不引入 TypeScript 或新依赖。

**Tech Stack:** Next.js 15 App Router、JavaScript + JSX、PostgreSQL、Tailwind CSS v3、Node.js `node:test`。

---

## File Structure

- Modify: `lib/db.mjs`，为 `requirements` 表增加消项字段迁移。
- Modify: `lib/dataRepository.mjs`，读取、创建、更新需求时处理新增字段。
- Modify: `main.jsx`，增加需求池消项视图、表格展示和表单字段。
- Modify: `tests/main-regression.test.mjs`，增加迁移、仓储 SQL 和前端 UI 断言。

## Task 1: 数据库迁移测试与实现

**Files:**
- Modify: `tests/main-regression.test.mjs`
- Modify: `lib/db.mjs`

- [ ] **Step 1: 写失败测试**

在 `tests/main-regression.test.mjs` 的 `database initialization migrates legacy table shapes used by previous data volumes` 测试中追加以下断言：

```js
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS module/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS requirement_type/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS importance/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS urgency/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS dev_reply/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS solution/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS milestone/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS result/);
  assert.match(dbSource, /ALTER TABLE requirements ADD COLUMN IF NOT EXISTS remark/);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，提示找不到 `requirements` 新增字段迁移语句。

- [ ] **Step 3: 实现迁移**

在 `lib/db.mjs` 的 `if (await tableExists(pool, 'requirements'))` 迁移块中加入：

```sql
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS module TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS requirement_type TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS importance TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS dev_reply TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS solution TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS milestone TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS result TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS remark TEXT NOT NULL DEFAULT '';
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS。

## Task 2: 仓储层字段读写

**Files:**
- Modify: `tests/main-regression.test.mjs`
- Modify: `lib/dataRepository.mjs`

- [ ] **Step 1: 写失败测试**

新增测试：

```js
test('requirements repository persists clearance tracking fields', () => {
  const repositorySource = readFileSync(
    new URL('../lib/dataRepository.mjs', import.meta.url),
    'utf8',
  );

  for (const field of [
    'module',
    'requirement_type AS "requirementType"',
    'importance',
    'urgency',
    'dev_reply AS "devReply"',
    'solution',
    'milestone',
    'result',
    'remark',
  ]) {
    assert.match(repositorySource, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(repositorySource, /data\.requirementType/);
  assert.match(repositorySource, /data\.devReply/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，提示仓储层尚未包含新增字段。

- [ ] **Step 3: 扩展查询与写入 SQL**

在 `listRequirements` 的 SELECT 中追加新增字段并使用 camelCase 别名；在 `createRequirement` 和 `updateRequirement` 的 INSERT/UPDATE/RETURNING 中加入：

```js
asText(data.module),
asText(data.requirementType),
asText(data.importance),
asText(data.urgency),
asText(data.devReply),
asText(data.solution),
asText(data.milestone),
asText(data.result),
asText(data.remark),
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS。

## Task 3: 前端需求池消项视图与字段

**Files:**
- Modify: `tests/main-regression.test.mjs`
- Modify: `main.jsx`

- [ ] **Step 1: 写失败测试**

新增测试：

```js
test('requirements view supports clearance tracking fields and filters', () => {
  const requirementsView = getBlock(
    'const renderRequirements = () => {',
    'const renderTasks = () => {',
  );

  for (const text of [
    '待研发回复',
    '紧急事项',
    '未消项',
    '高阶功能',
    '需求类型',
    '研发回复',
    '解决方案',
    '处理结果',
    '时间节点',
    '备注',
  ]) {
    assert.match(requirementsView, new RegExp(text));
  }

  assert.match(source, /reqFilter\.clearanceView/);
  assert.match(source, /requirementType/);
  assert.match(source, /devReply/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，提示前端尚未包含消项筛选和字段。

- [ ] **Step 3: 修改前端状态与过滤**

在 `reqFilter` 中增加 `clearanceView: 'all'`。在 `renderRequirements` 的过滤逻辑中增加 `isRequirementCleared` 与视图判断：

```js
const isRequirementCleared = (req) => Boolean(req.result?.trim());

const matchesClearanceView = (() => {
  if (reqFilter.clearanceView === 'pendingReply') {
    return !req.devReply?.trim() && !isRequirementCleared(req);
  }
  if (reqFilter.clearanceView === 'urgent') {
    return req.urgency === '紧急' && !isRequirementCleared(req);
  }
  if (reqFilter.clearanceView === 'open') {
    return !isRequirementCleared(req);
  }
  if (reqFilter.clearanceView === 'advanced') {
    return req.requirementType === '高阶功能';
  }
  return true;
})();
```

- [ ] **Step 4: 修改需求弹窗默认值与提交**

新建需求默认数据加入：

```js
module: '',
requirementType: '功能不完善',
importance: '重要',
urgency: '非紧急',
devReply: '',
solution: '',
milestone: '',
result: '',
remark: '',
```

保存需求时确保这些字段随 `reqModal.data` 提交。

- [ ] **Step 5: 修改需求池 UI**

在需求池筛选区增加消项视图按钮；在表格中展示模块、类型、紧急程度、研发回复、处理结果；在弹窗中增加对应输入控件。字段使用 `<input>`、`<select>` 和 `<textarea>`，并保持已有 Tailwind 样式与无障碍标签。

- [ ] **Step 6: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS。

## Task 4: 构建验证

**Files:**
- No code changes expected.

- [ ] **Step 1: 运行完整测试**

Run: `pnpm test`
Expected: PASS。

- [ ] **Step 2: 运行生产构建**

Run: `pnpm build`
Expected: PASS，Next.js 构建成功。

- [ ] **Step 3: 复核 main.jsx 改动范围**

Run: `git diff -- main.jsx lib/db.mjs lib/dataRepository.mjs tests/main-regression.test.mjs`
Expected: diff 只包含消项跟进相关字段、筛选、展示和测试。
