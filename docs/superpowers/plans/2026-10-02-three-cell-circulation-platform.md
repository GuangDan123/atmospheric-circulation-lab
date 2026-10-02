# 三圈环流三维因果探究平台实施计划

> **面向智能执行者：** 实施本计划时，必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，严格逐任务执行。所有步骤使用复选框（`- [ ]`）跟踪。

**目标：** 从空目录建设一个由统一科学模型驱动、支持三视图同步、因果链逐步演示、变量控制、预测验证与离线课堂使用的三圈环流三维探究平台。

**架构：** 采用“纯函数科学领域层 → 单一 Zustand 教学状态 → 球面/经向剖面/平面展开三种只读投影视图 → 教学场景编排”的单向数据流。科学参数与视觉参数严格分离，Three.js 组件不得保存或修改科学真值；P0 先以“副热带高压动力成因”打通垂直切片，再扩展完整课堂内容，P1/P2 必须通过前一阶段闸门后才能进入。

**技术栈：** React、TypeScript、Vite、Three.js、React Three Fiber、Drei、Zustand、SVG、Vitest、Testing Library、Playwright、vite-plugin-pwa、静态 JSON、localStorage。

---

## 0. 现状、范围与实施纪律

### 0.1 当前工程事实

- 项目目前没有源码、`package.json`、Git 元数据、构建配置或测试框架。
- 需求来源按优先级管理：用户明确授权的当前任务与验收意见优先；其次是根目录的 `实施规划的方法.docx`；再其次是实施过程中经用户确认的变更记录。任何推断、视觉偏好或实现便利不得自行升级为需求。
- 本计划只把已确认的科学模型、三视图同步、P0/P1/P2 范围和验收标准转化为可执行任务；来源不明的内容必须标记为待确认，不得直接实现。
- 所有依赖版本必须在初始化当天由 `npm install` 锁入 `package-lock.json`，不得在代码中假设未安装的库。
- 首版是教学参数化模型，不是数值天气预报或真实大气流体求解器。

### 0.2 P0 必做与明确非目标

P0 必做：

1. 太阳直射点、地转偏向、三圈环流、气压带、风带和季节位移纯函数模型。
2. 球面、经向垂直剖面、平面展开图读取同一份派生状态。
3. 副热带高压与副极地低压动力成因，赤道低压与极地高压热力成因。
4. 地转偏向开关、自转方向/强度、摩擦、月份、图层、标签、播放速度。
5. 因果链播放、暂停、前进、回退、关键帧、撤销、重做、重置。
6. 教师模式、基础学生预测、地中海地点追踪、1 月/7 月对比。
7. 性能分级、键盘可达、色弱安全编码、离线启动。

P0 不做：账号、云端班级、实时天气、复杂地形、完整气候库、多人协作、VR/AR、AI 讲解。

### 0.3 全程工程规则

- 每个科学规则先写失败测试，再写最小实现，再重构；P1/P2 每个任务都必须按“红灯→最小实现→绿灯→重构→回归”逐步执行，不得一次性堆叠实现后补测试。
- `src/domain/**` 不得导入 React、Three.js、Zustand 或浏览器 API。
- 三个视图只能接收 selector 输出，不得各自计算气压带位置或风向。
- 粒子速度、数量、辉光等仅为视觉参数，不得反写科学状态。
- 每项任务结束运行目标测试；每个阶段结束运行 `npm run check` 和对应端到端测试。
- 所有提交、推送、合并、发布和基线更新均须获得用户明确授权；未获授权时只允许修改工作区、运行检查并汇报，不得执行 `git commit`、`git push` 或发布操作。
- 学科事实变化必须由高中地理教师或教研员审校，不得仅凭视觉截图验收。

## 1. 目标文件地图

### 根配置

- `package.json`：固定开发、检查、测试、构建、端到端和视觉回归命令。
- `tsconfig.json`、`tsconfig.app.json`、`tsconfig.node.json`：严格 TypeScript 配置。
- `vite.config.ts`：Vite、Vitest、PWA 与路径别名。
- `playwright.config.ts`：桌面 Chromium、平板视口、WebGL 启动参数和截图阈值。
- `eslint.config.js`：React、Hooks、TypeScript 规则。
- `index.html`：应用挂载入口和中文元数据。

### 科学领域层

- `src/domain/atmosphere/types.ts`：纬度、半球、环流、气压带、风带、模型输入输出类型。
- `src/domain/atmosphere/solarModel.ts`：月份与太阳直射点教学近似。
- `src/domain/atmosphere/coriolisModel.ts`：偏转强度、方向和气流/风向名称转换。
- `src/domain/atmosphere/circulationModel.ts`：六个环流单元及升降位置。
- `src/domain/atmosphere/pressureBeltModel.ts`：四类气压带、成因和季节位移。
- `src/domain/atmosphere/windBeltModel.ts`：近地面风带及南北半球方向。
- `src/domain/atmosphere/seasonalShiftModel.ts`：1—12 月带状系统位移。
- `src/domain/atmosphere/locationControlModel.ts`：固定地点当前控制关系。
- `src/domain/atmosphere/deriveAtmosphere.ts`：唯一聚合入口，生成三个视图共享快照。
- `src/domain/causality/types.ts`、`causalGraph.ts`、`causalPlayback.ts`：数据化因果图和可回退播放。
- `src/domain/atmosphere/landSeaModel.ts`、`monsoonModel.ts`：P1 参数化海陆扰动和季风合成。
- `src/domain/assessment/validators.ts`：P2 学生答案诊断。

### 状态与场景

- `src/state/types.ts`：科学参数、教学、视图、历史状态接口。
- `src/state/simulationStore.ts`：单一状态容器、原子 action 和 selectors。
- `src/state/history.ts`：只记录教学意义动作的撤销/重做。
- `src/scenarios/p0/subtropicalHigh.ts`：副热带高压因果步骤与镜头预设。
- `src/scenarios/p0/presets.ts`：单圈、三圈、1 月、7 月和地中海关键帧。
- `src/scenarios/p1/monsoonPresets.ts`：东亚、南亚季风分解场景。

### 表现与交互

- `src/app/App.tsx`、`src/main.tsx`：应用外壳与挂载。
- `src/components/layout/ClassroomLayout.tsx`：课堂三栏布局。
- `src/features/globe/GlobeView.tsx` 及 `layers/*.tsx`：球面与分层场景。
- `src/features/meridional-section/MeridionalSection.tsx`：SVG 经向剖面。
- `src/features/map-projection/MapProjection.tsx`：SVG 平面展开图。
- `src/features/causal-panel/CausalPanel.tsx`：因果链、解释和步进控制。
- `src/features/control-panel/SimulationControls.tsx`：科学参数与图层控制。
- `src/features/timeline/MonthTimeline.tsx`：月份播放和 1/7 月对比。
- `src/features/keyframes/KeyframePanel.tsx`：课堂关键帧。
- `src/features/location/LocationPanel.tsx`：地点全年控制时间条。
- `src/rendering/performance/profile.ts`：设备检测及降级配置。
- `src/styles/*.css`：布局、语义色、响应式和高对比模式。

### 测试

- `tests/domain/*.test.ts`：科学纯函数测试。
- `tests/state/*.test.ts`：同步、历史和重置不变量。
- `tests/components/*.test.tsx`：控件、可达性和教学交互。
- `tests/contracts/viewProjection.test.ts`：三视图共享快照契约。
- `tests/e2e/p0-classroom.spec.ts`：P0 核心课堂流程。
- `tests/e2e/offline.spec.ts`：离线重载。
- `tests/visual/scenes.spec.ts`：标准场景截图。
- `tests/performance/classroom.spec.ts`：反馈延迟、帧率和内存趋势采样。

---

## 阶段 0：工程基线与科学内核

### Task 1：初始化可重复的严格工程基线

**文件：**
- 创建：`package.json`
- 创建：`package-lock.json`
- 创建：`vite.config.ts`
- 创建：`playwright.config.ts`
- 创建：`eslint.config.js`
- 创建：`src/test/setup.ts`
- 修改：Vite 生成的 `src/main.tsx`、`src/App.tsx`

- [ ] **Step 1：生成 React + TypeScript 工程并安装已决策依赖**

运行：

```powershell
npm create vite@latest . -- --template react-ts
npm install three @react-three/fiber @react-three/drei zustand
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh vite-plugin-pwa @types/three
npx playwright install chromium
```

预期：生成 `package-lock.json`；所有命令退出码为 `0`；`npm audit` 的高危生产依赖为 `0`，否则先评估并升级直接依赖。

- [ ] **Step 2：先建立失败的应用冒烟测试**

创建 `tests/components/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('App', () => {
  it('renders the platform title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3：配置命令并确认测试先失败**

将 `package.json` scripts 设为：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:visual": "playwright test tests/visual",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

在 `vite.config.ts` 配置 `environment: 'jsdom'`、`setupFiles: ['./src/test/setup.ts']` 和 `@` 指向 `src`。运行：

```powershell
npm run test -- tests/components/App.test.tsx
```

预期：FAIL，原因是页面没有目标标题，而不是配置或模块解析错误。

- [ ] **Step 4：写最小应用外壳使测试通过**

`src/App.tsx` 最小实现：

```tsx
export default function App() {
  return (
    <main>
      <h1>三圈环流因果探究平台</h1>
    </main>
  )
}
```

运行：

```powershell
npm run test -- tests/components/App.test.tsx
npm run check
```

预期：测试、lint、类型检查与构建全部通过。

- [ ] **Step 5：准备基线提交（仅在用户明确授权后执行）**

```powershell
git add package.json package-lock.json vite.config.ts playwright.config.ts eslint.config.js index.html src tests/components/App.test.tsx
# 仅在用户明确授权提交时执行：
git commit -m "chore: initialize circulation learning platform"
```

### Task 2：建立领域类型与太阳直射点模型

**文件：**
- 创建：`src/domain/atmosphere/types.ts`
- 创建：`src/domain/atmosphere/solarModel.ts`
- 创建：`tests/domain/solarModel.test.ts`

- [ ] **Step 1：写月份边界、二分二至与周期性的失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { getSolarDeclination } from '../../src/domain/atmosphere/solarModel'

describe('getSolarDeclination', () => {
  it.each([0, 13, 1.5, Number.NaN])('rejects invalid month %s', (month) => {
    expect(() => getSolarDeclination(month)).toThrow(RangeError)
  })

  it('places March and September near the equator', () => {
    expect(Math.abs(getSolarDeclination(3))).toBeLessThan(3)
    expect(Math.abs(getSolarDeclination(9))).toBeLessThan(3)
  })

  it('places June north and December south', () => {
    expect(getSolarDeclination(6)).toBeGreaterThan(22)
    expect(getSolarDeclination(12)).toBeLessThan(-22)
  })
})
```

- [ ] **Step 2：运行并确认因缺少模块失败**

```powershell
npm run test -- tests/domain/solarModel.test.ts
```

预期：FAIL，提示无法解析 `solarModel`。

- [ ] **Step 3：实现最小纯函数与品牌类型**

`types.ts` 定义 `Month`、`Latitude`、`Hemisphere`、`FormationType`、`VerticalMotion`、`SimulationParameters`；`solarModel.ts` 采用教学近似：

```ts
export function getSolarDeclination(month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('month must be an integer from 1 to 12')
  }

  return 23.44 * Math.sin((2 * Math.PI * (month - 3)) / 12)
}
```

- [ ] **Step 4：验证、重构并提交**

```powershell
npm run test -- tests/domain/solarModel.test.ts
npm run typecheck
 git add src/domain/atmosphere tests/domain/solarModel.test.ts
 git commit -m "feat: model seasonal solar declination"
```

预期：测试通过；函数不依赖系统日期或 UI。

### Task 3：以 TDD 建立地转偏向与风向语义

**文件：**
- 创建：`src/domain/atmosphere/coriolisModel.ts`
- 创建：`tests/domain/coriolisModel.test.ts`

- [ ] **Step 1：写科学不变量测试**

测试必须覆盖：赤道为零、北半球右偏、南半球左偏、纬度绝对值增大时增强、自转反向时方向反转、关闭地转偏向时为零、摩擦只削弱不反向、气流去向与风向来源命名相反。

```ts
import { describe, expect, it } from 'vitest'
import { getCoriolisEffect, nameWindFromMotion } from '../../src/domain/atmosphere/coriolisModel'

describe('getCoriolisEffect', () => {
  it('is zero at the equator', () => {
    expect(getCoriolisEffect({ latitude: 0, rotationDirection: 1, rotationStrength: 1, enabled: true })).toEqual({ direction: 'none', magnitude: 0 })
  })

  it.each([[30, 'right'], [-30, 'left']] as const)('uses hemisphere at latitude %s', (latitude, direction) => {
    expect(getCoriolisEffect({ latitude, rotationDirection: 1, rotationStrength: 1, enabled: true }).direction).toBe(direction)
  })

  it('reverses when rotation reverses', () => {
    expect(getCoriolisEffect({ latitude: 30, rotationDirection: -1, rotationStrength: 1, enabled: true }).direction).toBe('left')
  })

  it('names wind by where it comes from', () => {
    expect(nameWindFromMotion({ eastward: true, northward: false })).toBe('西风')
  })
})
```

- [ ] **Step 2：确认失败后实现规范化输出**

运行：

```powershell
npm run test -- tests/domain/coriolisModel.test.ts
```

实现输出类型 `{ direction: 'left' | 'right' | 'none'; magnitude: number }`，强度采用 `abs(sin(latitude)) * rotationStrength * (1 - frictionStrength)` 并钳制到 `0..1`。所有输入执行有限数和范围校验。

- [ ] **Step 3：添加性质测试并防止符号回归**

对 `-90..90` 每 5° 遍历：幅值非负、南北同纬绝对值相等、关闭后全为零。运行：

```powershell
npm run test -- tests/domain/coriolisModel.test.ts
npm run lint
 git add src/domain/atmosphere/coriolisModel.ts tests/domain/coriolisModel.test.ts
 git commit -m "feat: model coriolis direction and wind naming"
```

### Task 4：建立三圈环流、气压带、风带与季节移动

**文件：**
- 创建：`src/domain/atmosphere/circulationModel.ts`
- 创建：`src/domain/atmosphere/pressureBeltModel.ts`
- 创建：`src/domain/atmosphere/windBeltModel.ts`
- 创建：`src/domain/atmosphere/seasonalShiftModel.ts`
- 创建：`src/domain/atmosphere/deriveAtmosphere.ts`
- 创建：`tests/domain/circulationModel.test.ts`
- 创建：`tests/domain/pressureAndWind.test.ts`
- 创建：`tests/domain/deriveAtmosphere.test.ts`

- [ ] **Step 1：先固定科学事实表测试**

断言六个环流单元恰好为南北半球各 Hadley/Ferrel/Polar；Hadley 和 Polar 为 `thermal`，Ferrel 为 `indirect`；垂直运动在 0°/60° 上升、±30°/±90° 下沉。

- [ ] **Step 2：确认失败并实现不可变环流数据**

`getCirculationCells()` 返回只读值对象，不暴露 Three.js 坐标。路径点统一使用 `{ latitude, normalizedAltitude }`，高度范围为 `0..1`。

运行：

```powershell
npm run test -- tests/domain/circulationModel.test.ts
```

预期：PASS 后才能继续气压带。

- [ ] **Step 3：先写气压带成因和季移测试**

断言：赤道低压/极地高压为 `thermal`；副热带高压/副极地低压为 `dynamic`；6 月整体北移、12 月整体南移；移动幅度小于直射点幅度；输出顺序始终由南到北且不重叠。

- [ ] **Step 4：实现可配置但有界的季节位移**

`getPressureBelts({ month, seasonalShiftScale })` 只读取直射点派生值；默认比例由模块常量定义，最终中心纬度钳制在 `-90..90`。风带必须由相邻气压带与 `getCoriolisEffect` 派生，不得复制另一份纬度常量。

- [ ] **Step 5：建立唯一聚合函数**

`deriveAtmosphere(parameters)` 返回：

```ts
type AtmosphereSnapshot = Readonly<{
  parameters: SimulationParameters
  solarDeclination: number
  circulationCells: readonly CirculationCell[]
  pressureBelts: readonly PressureBelt[]
  windBelts: readonly WindBelt[]
  verticalMotions: readonly VerticalMotionMarker[]
}>
```

添加确定性测试：相同输入深度相等，调用方修改返回数组不影响下次结果，爆炸进度和标签密度不得成为函数参数。

- [ ] **Step 6：阶段 0 自动验收**

```powershell
npm run test -- tests/domain
npm run lint
npm run typecheck
npm run build
```

预期：全部通过；领域层覆盖率行/分支均不低于 90%；搜索 `src/domain` 不得发现 `react`、`three`、`zustand` 导入。

```powershell
Select-String -Path src/domain/**/*.ts -Pattern "from ['\"](react|three|zustand)"
```

预期：无输出。

- [ ] **Step 7：提交科学原型**

```powershell
git add src/domain/atmosphere tests/domain
 git commit -m "feat: derive three-cell circulation atmosphere"
```

### 阶段 0 验收闸门

只有同时满足以下条件才能进入阶段 1：

- [ ] 二分二至、地转偏向、反向自转、六环流、四类气压带和风向命名测试通过。
- [ ] 副热带高压明确为动力高压，副极地低压明确为动力低压。
- [ ] 纯函数对相同输入给出稳定输出，领域层零 UI/Three.js 依赖。
- [ ] 高中地理教师审核科学事实表并签署“可进入视觉表达”；争议项记录为明确测试用例后再继续。
- [ ] `npm run check` 退出码为 `0`。

---

## 阶段 1：P0 垂直切片——副热带高压动力成因

### Task 5：建立统一状态、历史与派生 selectors

**文件：**
- 创建：`src/state/types.ts`
- 创建：`src/state/history.ts`
- 创建：`src/state/simulationStore.ts`
- 创建：`tests/state/simulationStore.test.ts`
- 创建：`tests/state/history.test.ts`

- [ ] **Step 1：写状态转换失败测试**

覆盖：月份更新同步直射点；科学参数改变生成新快照；图层开关、标签密度和爆炸视图不改变科学快照；重置恢复预设；撤销/重做只记录月份、地转偏向、关键帧和教学步骤，不记录相机逐帧移动或粒子帧。

- [ ] **Step 2：实现窄 action API**

只暴露 `setMonth`、`setCoriolisEnabled`、`setRotationDirection`、`setFrictionStrength`、`selectPressureBelt`、`setExplodedViewProgress`、`setVisibleLayer`、`applyPreset`、`undo`、`redo`、`reset`。所有 action 内校验范围，组件不得直接写 store 字段。

- [ ] **Step 3：建立共享 selector**

`selectAtmosphereSnapshot` 是三个视图唯一科学输入；`selectViewProjection` 仅把同一快照转换为视图坐标。使用引用稳定测试防止无关 UI 状态导致昂贵重算。

- [ ] **Step 4：验证与提交**

```powershell
npm run test -- tests/state
npm run typecheck
 git add src/state tests/state
 git commit -m "feat: add unified simulation state and history"
```

### Task 6：数据化副热带高压因果链

**文件：**
- 创建：`src/domain/causality/types.ts`
- 创建：`src/domain/causality/causalGraph.ts`
- 创建：`src/domain/causality/causalPlayback.ts`
- 创建：`src/scenarios/p0/subtropicalHigh.ts`
- 创建：`tests/domain/causalPlayback.test.ts`

- [ ] **Step 1：写七步因果顺序与回退测试**

固定顺序：赤道受热上升 → 高空向两极运动 → 地转偏向增强 → 30°附近高空气流堆积 → 空气下沉 → 副热带高压形成 → 分流形成信风与西风。测试每步激活对象、解释文本、镜头预设、暂停点，以及 `next/previous/reset` 边界。

- [ ] **Step 2：实现独立于动画时间的播放状态机**

播放状态只保存 `scenarioId`、`stepIndex`、`playback`、`speed`；当前高亮对象由步骤派生。禁止使用 `setTimeout` 作为事实来源，UI 动画结束只派发“步骤完成”。

- [ ] **Step 3：验证因果事实**

增加负向断言：步骤与节点标签中不得出现“副热带高压由地面受热形成”；关闭地转偏向时相关步骤显示“偏转关闭后的对照观察”，不得继续展示完整默认结果。

- [ ] **Step 4：运行并提交**

```powershell
npm run test -- tests/domain/causalPlayback.test.ts
 git add src/domain/causality src/scenarios/p0/subtropicalHigh.ts tests/domain/causalPlayback.test.ts
 git commit -m "feat: add reversible subtropical high causal scenario"
```

### Task 7：先完成 SVG 经向剖面和三视图契约

**文件：**
- 创建：`src/features/meridional-section/MeridionalSection.tsx`
- 创建：`src/features/meridional-section/projectSection.ts`
- 创建：`src/features/map-projection/MapProjection.tsx`
- 创建：`src/features/map-projection/projectMap.ts`
- 创建：`tests/contracts/viewProjection.test.ts`
- 创建：`tests/components/MeridionalSection.test.tsx`
- 创建：`tests/components/MapProjection.test.tsx`

- [ ] **Step 1：写投影契约失败测试**

由同一个 `AtmosphereSnapshot` 投影后，三视图必须具有相同 `sourceId`、气压带成因、中心纬度、垂直运动方向和相邻风带 ID；仅坐标不同。测试 1 月、7 月、关闭地转偏向和反向自转四个快照。

- [ ] **Step 2：实现纯投影函数**

`projectSection(snapshot)` 输出 SVG 坐标；`projectMap(snapshot, centralLongitude)` 输出平面坐标。两者不得重新调用太阳、气压带或风带模型。

- [ ] **Step 3：写组件语义测试**

测试 SVG 内存在赤道、30°、60°、极地文本；选中副热带高压后对应元素具有 `aria-current="true"`；动力成因文本可被屏幕阅读器读取；键盘 Enter 可选择气压带。

- [ ] **Step 4：实现最小 SVG 视图并验证**

```powershell
npm run test -- tests/contracts/viewProjection.test.ts tests/components/MeridionalSection.test.tsx tests/components/MapProjection.test.tsx
 git add src/features/meridional-section src/features/map-projection tests/contracts tests/components
 git commit -m "feat: add synchronized section and map views"
```

### Task 8：实现分层球面视图与跨视图选择

**文件：**
- 创建：`src/features/globe/GlobeView.tsx`
- 创建：`src/features/globe/GlobeScene.tsx`
- 创建：`src/features/globe/layers/SurfaceLayer.tsx`
- 创建：`src/features/globe/layers/LatitudeGridLayer.tsx`
- 创建：`src/features/globe/layers/PressureBeltLayer.tsx`
- 创建：`src/features/globe/layers/WindLayer.tsx`
- 创建：`src/features/globe/layers/VerticalMotionLayer.tsx`
- 创建：`src/features/globe/layers/LabelLayer.tsx`
- 创建：`tests/components/GlobeView.test.tsx`
- 修改：`tests/contracts/viewProjection.test.ts`

- [ ] **Step 1：用 mock Canvas 写分层和选择测试**

断言每层只接收投影数据；点击 `pressure-belt:subtropical-north` 派发统一选择 action；爆炸视图只改变图层变换矩阵，不改变 snapshot；WebGL 不可用时显示同一科学状态的二维降级入口。

- [ ] **Step 2：实现静态地球骨架**

先交付半透明球体、经纬网、关键纬线、气压带环带和选择高亮，不加入粒子与后处理。材质透明叠层数量设上限，所有几何体在卸载时释放。

- [ ] **Step 3：加入可降级流线和垂直运动**

标准模式使用实例化箭头/粒子；低性能模式使用预计算曲线。两种模式共享路径数据，粒子只沿路径采样，不产生科学状态。

- [ ] **Step 4：验证三视图选择同步**

```powershell
npm run test -- tests/contracts tests/components/GlobeView.test.tsx
npm run typecheck
npm run build
 git add src/features/globe tests
 git commit -m "feat: add layered globe projection"
```

### Task 9：组装课堂界面与因果面板

**文件：**
- 创建：`src/components/layout/ClassroomLayout.tsx`
- 创建：`src/features/causal-panel/CausalPanel.tsx`
- 创建：`src/features/control-panel/SimulationControls.tsx`
- 创建：`src/features/keyframes/KeyframePanel.tsx`
- 创建：`src/styles/tokens.css`
- 创建：`src/styles/classroom.css`
- 修改：`src/App.tsx`
- 创建：`tests/components/ClassroomFlow.test.tsx`

- [ ] **Step 1：写完整垂直切片交互测试**

模拟点击副热带高压，断言三个视图同步高亮、无关图层降透明度、因果面板显示“动力成因”；逐步播放到第七步、回退一步、暂停、重置后回到第零步。

- [ ] **Step 2：实现标准三栏布局**

桌面布局：左侧剖面、中间球面、右侧因果链、底部展开图与控制；平板布局保持所有控件可达，不以 hover 作为唯一操作方式。

- [ ] **Step 3：落实视觉语义与无障碍**

温度暖红—冷蓝；高压橙色轮廓和 H；低压蓝紫轮廓和 L；上升青色、下沉金色；选中黄色外发光。所有颜色同时配合线型、箭头、文字或符号；触控目标最小 `44px`；焦点可见。

- [ ] **Step 4：运行垂直切片检查**

```powershell
npm run test -- tests/components/ClassroomFlow.test.tsx
npm run check
 git add src/App.tsx src/components src/features/causal-panel src/features/control-panel src/features/keyframes src/styles tests/components/ClassroomFlow.test.tsx
 git commit -m "feat: complete subtropical high vertical slice"
```

### 阶段 1 验收闸门

- [ ] 点击副热带高压后，三视图高亮同一 ID、纬度、成因与升降状态。
- [ ] 七步因果链可前进、暂停、回退、重置，且关闭地转偏向时不会展示错误完整合成。
- [ ] 爆炸视图前后科学快照深度相等。
- [ ] WebGL 不可用时仍可通过 SVG 视图完成因果讲解。
- [ ] 教师在两次操作内进入副热带高压关键帧。
- [ ] 专家审校确认箭头含义、动力成因和费雷尔环流表述无误。
- [ ] `npm run check` 与垂直切片 Playwright 流程全部通过。

---

## 阶段 2：P0 完整核心课堂

### Task 10：扩展完整 P0 场景、月份与地点追踪

**文件：**
- 创建：`src/scenarios/p0/presets.ts`
- 创建：`src/domain/atmosphere/locationControlModel.ts`
- 创建：`src/data/locations.ts`
- 创建：`src/features/timeline/MonthTimeline.tsx`
- 创建：`src/features/location/LocationPanel.tsx`
- 创建：`tests/domain/locationControlModel.test.ts`
- 创建：`tests/components/MonthTimeline.test.tsx`
- 创建：`tests/components/LocationPanel.test.tsx`

- [ ] **Step 1：先写地点全年控制测试**

至少固定地中海测试地点。断言北半球夏季受副热带高压下沉控制、冬季受西风影响；结果必须引用当前气压带/风带 ID，不能只返回文案。

- [ ] **Step 2：实现地点控制纯函数**

输入为地点纬度和 `AtmosphereSnapshot`，输出控制对象、升降状态、干湿倾向及解释证据。边界纬度允许返回两个过渡控制项与权重，避免不真实的硬切换。

- [ ] **Step 3：写月份交互测试并实现时间轴**

覆盖 1—12 月键盘调节、播放/暂停、锁定地点持续播放、1 月/7 月一键对比；月份变化后太阳直射点、气压带、风带和地点控制在同一 React 更新周期内一致。

- [ ] **Step 4：补齐 P0 关键帧**

包括无地转偏向单圈环流、三圈全景、副热带高压、副极地低压、南北半球偏转对比、气流方向/风向名称、1 月、7 月、地中海地点追踪。

- [ ] **Step 5：验证与提交**

```powershell
npm run test -- tests/domain/locationControlModel.test.ts tests/components/MonthTimeline.test.tsx tests/components/LocationPanel.test.tsx
 git add src/domain/atmosphere/locationControlModel.ts src/data src/features/timeline src/features/location src/scenarios/p0 tests
 git commit -m "feat: add seasonal timeline and location tracking"
```

### Task 11：教师模式、性能分级与离线能力

**文件：**
- 创建：`src/rendering/performance/profile.ts`
- 创建：`src/features/settings/PerformancePanel.tsx`
- 创建：`src/features/teacher/TeacherToolbar.tsx`
- 创建：`tests/domain/performanceProfile.test.ts`
- 创建：`tests/components/TeacherToolbar.test.tsx`
- 创建：`tests/e2e/offline.spec.ts`
- 修改：`vite.config.ts`

- [ ] **Step 1：写确定性的性能分级测试**

输入只包含能力探测结果，例如逻辑核心数、设备内存、像素比、WebGL2、降级偏好；输出 `high | standard | low` 及粒子数、像素比、后处理、标签密度配置。低档不得关闭任何教学信息。

- [ ] **Step 2：实现可手动覆盖的性能档位**

自动检测仅作初值，教师可切换档位；切换不得重置月份、选择或因果步骤。低档使用流线代替粒子、关闭后处理、限制 DPR、减少标签，但保留气压带、风带、升降和因果链。

- [ ] **Step 3：实现教师工具栏**

包含关键帧、图层、标签密度、动画速度、上一步/下一步、播放/暂停、全屏、复位和截图。翻页笔映射使用可配置键盘事件，不拦截浏览器系统快捷键。

- [ ] **Step 4：配置 PWA 并先写离线失败测试**

Playwright 流程：首次在线打开并等待 Service Worker 激活 → 切断网络 → 重新加载 → 标题和核心 P0 场景仍可用。缓存仅包含应用壳与本地数据，不依赖远程字体/CDN。

- [ ] **Step 5：验证并提交**

```powershell
npm run test -- tests/domain/performanceProfile.test.ts tests/components/TeacherToolbar.test.tsx
npm run build
npm run test:e2e -- tests/e2e/offline.spec.ts
 git add src/rendering src/features/settings src/features/teacher vite.config.ts tests
 git commit -m "feat: add classroom performance modes and offline support"
```

### Task 12：P0 端到端、视觉和性能验收

**文件：**
- 创建：`tests/e2e/p0-classroom.spec.ts`
- 创建：`tests/visual/scenes.spec.ts`
- 创建：`tests/performance/classroom.spec.ts`
- 修改：`playwright.config.ts`

- [ ] **Step 1：实现核心课堂端到端流程**

流程固定为：打开平台 → 进入三圈环流 → 关闭地转偏向 → 验证单圈南北向流动 → 开启地转偏向 → 点击副热带高压 → 七步播放并回退 → 切换 7 月 → 选择地中海 → 验证夏季控制 → 重置。

- [ ] **Step 2：建立科学标准截图**

截图场景：无地转单圈、三圈标准、1 月、7 月、副热带高压因果第 5 步、爆炸视图、低性能模式。首批基线必须经学科审校后入库；后续差异不得盲目执行 `--update-snapshots`。

- [ ] **Step 3：采集性能预算**

在 Chromium 1080p 标准档采集 30 秒：反馈延迟 p95 < 100ms、帧率中位数目标 60 FPS 且不得低于 45 FPS；平板低档帧率中位数 ≥ 30 FPS；连续场景切换后 JS heap 不持续单调增长。CI 无 GPU 时仅执行延迟、长任务和 heap 趋势，真实 FPS 在目标课堂设备验收。

- [ ] **Step 4：运行 P0 全闸门**

```powershell
npm run check
npm run test:e2e -- tests/e2e/p0-classroom.spec.ts tests/e2e/offline.spec.ts
npm run test:visual
npx playwright test tests/performance/classroom.spec.ts
```

预期：全部通过；若视觉差异来自科学状态变化，必须先由学科负责人批准。

- [ ] **Step 5：提交 P0 验收资产**

```powershell
git add tests/e2e tests/visual tests/performance playwright.config.ts
 git commit -m "test: lock p0 classroom acceptance gates"
```

### 阶段 2 / P0 发布闸门

- [ ] 科学：风向、偏转、环流、四气压带成因、季节移动、地中海控制均由自动测试与专家双重通过。
- [ ] 同步：月份、选择、纬度、因果步骤在三视图无矛盾。
- [ ] 可用性：新用户无需说明可切换月份；所有场景一键复位；因果链可暂停回退；触屏目标和键盘操作合格。
- [ ] 工程：lint、类型、单元、组件、E2E、构建全绿，无持续控制台错误。
- [ ] 性能：教师常用 PC 接近 60 FPS，普通平板低档不低于 30 FPS，输入反馈 p95 < 100ms。
- [ ] 离线：首次在线加载后可断网重启核心课堂。
- [ ] 范围：不得夹带账号、云端、AI、完整气候库或复杂地形。

---

## 阶段 3：P1 真实地球、海陆切断与季风

### Task 13：海陆扰动和气压中心参数模型

**文件：**
- 创建：`src/domain/atmosphere/landSeaModel.ts`
- 创建：`src/data/pressureCenters.ts`
- 创建：`src/features/globe/layers/LandSeaAnomalyLayer.tsx`
- 创建：`src/features/land-sea/LandSeaControls.tsx`
- 创建：`tests/domain/landSeaModel.test.ts`
- 创建：`tests/visual/landSeaScenes.spec.ts`

- [ ] **Step 1：写参数端点测试**

`landSeaContrast = 0` 时无大陆中心、气压带连续、南北近似对称；1 月亚洲高压及北太平洋/北大西洋低压位置合理；7 月亚洲热低压及海洋副热带高压合理；南半球连续性高于北半球。

- [ ] **Step 2：实现“纬向理想场 + 月份大陆异常 + 海洋热惯性 + 平滑衰减”**

所有气压中心来自带有来源说明的本地数据；模型输出异常强度与证据，不求解流体方程。`landSeaContrast` 严格限制 `0..1`。

- [ ] **Step 3：将异常作为附加投影层接入三视图**

该层不得覆盖理想模型 ID；关闭真实海陆后必须恢复阶段 2 的快照。添加快照兼容测试，确保 P1 不破坏 P0。

- [ ] **Step 4：科学与视觉验收**

```powershell
npm run test -- tests/domain/landSeaModel.test.ts tests/domain
npm run test:visual -- tests/visual/landSeaScenes.spec.ts
```

由学科专家审定 1 月/7 月中心位置和“参数化教学模型”标识后提交。

### Task 14：东亚与南亚季风复合因果

**文件：**
- 创建：`src/domain/atmosphere/monsoonModel.ts`
- 创建：`src/scenarios/p1/monsoonPresets.ts`
- 创建：`src/features/monsoon/MonsoonExplorer.tsx`
- 创建：`tests/domain/monsoonModel.test.ts`
- 创建：`tests/e2e/monsoon.spec.ts`

- [ ] **Step 1：写机制组合测试**

南亚夏季风顺序固定为东南信风 → 越赤道 → 北半球右偏 → 印度次大陆热低压吸引 → 西南季风。关闭地转偏向不得输出完整西南季风；关闭海陆差异时东亚季风强度显著下降；各机制可单独显示。

- [ ] **Step 2：实现可解释的合成结果**

输出包含 `direction`、`relativeStrength`、`activeMechanisms`、`missingMechanisms`、`evidence`；不加入复杂地形，只保留 `terrainInfluence` 扩展位且默认禁用。

- [ ] **Step 3：实现分层开关与端到端验证**

学生可逐层开启海陆差异、季节移动、越赤道气流、地转偏向；每次结果变化显示缺失原因。执行：

```powershell
npm run test -- tests/domain/monsoonModel.test.ts
npm run test:e2e -- tests/e2e/monsoon.spec.ts
npm run check
```

### 阶段 3 / P1 验收闸门

- [ ] `landSeaContrast = 0` 完全回归理想地球，P0 全测试继续通过。
- [ ] 1 月与 7 月气压中心通过标准截图和学科审校。
- [ ] 季风关闭任一关键机制后结果按科学规则减弱或不成立，不使用单因解释。
- [ ] 南半球带状连续性显著高于北半球，且界面明确这是参数化表达。
- [ ] `npm run check`、P0 E2E、P1 E2E 和视觉回归全部通过。
- [ ] 退出评审记录版本号、变更范围、已知限制、科学证据清单、测试报告和未解决风险；仅在用户明确授权后创建提交或发布版本。

---

## 阶段 4：P2 学习闭环与气候影响

### Task 15：预测—验证、错误诊断与气候关联

**文件：**
- 创建：`src/domain/assessment/types.ts`
- 创建：`src/domain/assessment/validators.ts`
- 创建：`src/domain/climate/climateControlModel.ts`
- 创建：`src/data/climateLocations.ts`
- 创建：`src/features/student/PredictionCard.tsx`
- 创建：`src/features/student/WindDrawingTask.tsx`
- 创建：`src/features/climate/ClimatePanel.tsx`
- 创建：`tests/domain/assessmentValidators.test.ts`
- 创建：`tests/domain/climateControlModel.test.ts`
- 创建：`tests/e2e/student-learning.spec.ts`

- [ ] **Step 1：先写可定位错误环节的测试**

诊断码至少包括：气压梯度方向错误、南北半球偏转错误、气流去向与风向来源混淆、热力/动力成因混淆、忽略月份、忽略海陆差异。相同错误必须得到稳定诊断码，文案由 UI 映射。

- [ ] **Step 2：实现纯验证器**

验证器输入任务定义、科学快照和学生答案，输出 `{ correct, diagnosisCode, evidenceObjectIds }`；不得读取 DOM 或组件状态。

- [ ] **Step 3：实现气候控制证据链**

热带草原、地中海等首批类型必须引用当前气压带/风带和月份；输出允许包含其他影响因素，禁止把气压带解释成所有气候现象的唯一原因。

- [ ] **Step 4：实现学生流程并验证**

流程：预测 → 提交 → 分环节反馈 → 操作变量 → 再提交 → 揭示因果链。学习记录仅保存在本地，提供清除按钮，不采集身份信息。

```powershell
npm run test -- tests/domain/assessmentValidators.test.ts tests/domain/climateControlModel.test.ts
npm run test:e2e -- tests/e2e/student-learning.spec.ts
npm run check
```

### 阶段 4 / P2 验收闸门

- [ ] 反馈明确指出错误环节，而非只显示对错。
- [ ] 气候图表、月份与当前控制关系同步，解释保留多因素边界。
- [ ] 学生可用键盘或触摸完成核心任务；绘图任务提供非手势替代输入。
- [ ] 本地学习记录可导出和清除，不含个人敏感信息。
- [ ] P0/P1 回归测试全部通过。
- [ ] P2 逐任务保留失败测试、最小实现、重构前后结果和回归结果；退出评审记录版本号、学习目标覆盖、科学证据、已知限制与残余风险。
- [ ] 版本退出标准全部满足后才可标记可发布；任何提交、推送或发布动作仍须用户明确授权。

---

## 阶段 5：发布前调试、优化与课堂验收

### Task 16：系统化调试与性能优化

**文件：**
- 修改：经分析定位的具体组件或模型文件，不预设无证据重构
- 创建：`tests/e2e/regression.spec.ts`
- 修改：`tests/performance/classroom.spec.ts`

- [ ] **Step 1：建立可复现问题模板**

每个缺陷记录：问题 ID、发现版本、来源/提出者、预设 ID、完整参数、浏览器/设备、性能档位、操作序列、预期科学快照、实际快照、控制台信息、截图、最小复现测试、根因、修复版本和验证结果。科学问题额外记录证据对象 ID、证据来源、适用范围、审校人、审校日期和不确定性；没有证据或证据过期时标记为“待审校”，不得包装成确定事实。先把缺陷转成最小失败测试，再修改实现。

- [ ] **Step 2：按层定位三视图不同步**

1. 序列化 `SimulationParameters` 与 `AtmosphereSnapshot`，确认领域输出。
2. 比较三个 projector 的 `sourceId` 和纬度值。
3. 检查 selector 是否因原地修改而失去更新。
4. 检查组件是否缓存了本地科学状态。
5. 修复后加入 `tests/contracts/viewProjection.test.ts` 回归用例。

禁止通过在三个组件中分别增加补偿常量“修好画面”。

- [ ] **Step 3：按层定位方向或成因错误**

先冻结粒子动画，只显示初始气压梯度、偏转弧线和最终风三层；比较领域测试中的向量和 UI 箭头坐标变换。所有坐标系转换集中在 projector，科学模型使用纬度/经度语义，不使用屏幕正负号。

- [ ] **Step 4：优化渲染而不改变教学语义**

使用 React Profiler 和浏览器 Performance 面板确认瓶颈后，依次考虑：稳定 selector、复用 BufferGeometry/Material、实例化重复箭头、按需更新标签、限制 DPR、停止不可见动画、预计算流线、避免透明层过度叠加。每项优化前后运行同一性能场景，并比较科学快照深度相等。

- [ ] **Step 5：检查资源生命周期与长课稳定性**

连续运行 45 分钟的自动场景循环；每 5 分钟记录 heap、Three.js renderer info、DOM 节点、监听器数量。切换场景后几何体、材质、纹理和动画帧必须释放；指标允许预热增长，但 15 分钟后不得持续单调上升。

- [ ] **Step 6：课堂设备矩阵验收**

至少覆盖：1080p 教师 PC、普通平板、触屏一体机、仅集成显卡设备、离线网络。记录启动时间、首次交互、标准/低档 FPS、输入延迟、全屏、截图、翻页笔和触摸行为。

- [ ] **Step 7：最终自动闸门**

```powershell
npm ci
npm run check
npm run test:e2e
npm run test:visual
npx playwright test tests/performance/classroom.spec.ts
```

预期：全绿；构建产物能由静态服务器启动：

```powershell
npx vite preview --host 0.0.0.0
```

使用另一终端执行 Playwright 发布冒烟测试，确认直接访问与刷新均成功。

- [ ] **Step 8：最终人工闸门**

高中地理教师、教研员、前端/三维开发和真实课堂小规模试用分别签署：科学正确、因果不过度简化、风向箭头无歧义、操作可复位、低性能不丢教学信息、45 分钟无明显衰减。任一项不通过必须回到失败测试，不得以“视觉效果可接受”豁免科学错误。

---

## 2. 命令速查与预期结果

```powershell
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
npm run test:visual
npm run check
```

- `npm ci`：严格按锁文件安装，无未提交的锁文件漂移。
- `npm run lint`：零 error；warning 必须有明确处置，不以全局 disable 掩盖。
- `npm run typecheck`：零 TypeScript 错误，禁止用无解释的 `any` 绕过领域类型。
- `npm run test`：所有科学、状态、组件与契约测试通过。
- `npm run test:coverage`：领域层行/分支 ≥ 90%，全项目阈值在基线稳定后设定并只提高不降低。
- `npm run build`：静态构建成功，无循环依赖和超大资源警告未处理。
- `npm run test:e2e`：核心课堂、离线、季风和学习流程按已进入阶段通过。
- `npm run test:visual`：仅允许经过人工审查的基线变化。
- `npm run check`：本地提交前的最小总闸门。

## 3. 发布判定矩阵

| 维度 | 阻断条件 | 证据 |
|---|---|---|
| 科学正确性 | 任一风向、偏转、升降、成因或季移错误；证据缺失、过期或未审校 | 领域测试 + 科学证据清单 + 专家签署 |
| 三视图一致性 | 相同对象 ID 的纬度、成因、状态不一致 | 契约测试 + 标准截图 |
| 教学闭环 | 因果链不能暂停/回退，或反馈无法定位错误 | 组件/E2E + 课堂观察 |
| 无障碍 | 关键操作仅依赖颜色、hover 或精细拖拽 | 键盘测试 + 人工审查 |
| 性能 | 目标设备低于预算且低档仍不合格 | 性能脚本 + 设备记录 |
| 稳定性 | 控制台持续报错、资源持续增长、重置不彻底 | 45 分钟 soak + 回归测试 |
| 离线 | 首次缓存后核心课堂不能断网启动 | offline E2E |
| 工程质量 | lint/typecheck/unit/E2E/build 任一失败 | `npm run check` 与 CI |
| 版本退出 | 未记录版本范围、已知限制、残余风险、测试报告或回滚判断 | 退出评审记录；提交/发布还需用户授权 |

### 3.1 版本退出标准

版本只有在以下条件全部满足时，才能标记为“可发布候选”：所有阶段闸门通过；P1/P2 每项任务有完整 TDD 证据链；科学证据清单逐项绑定模型规则、测试和审校状态；调试记录中的阻断问题已关闭或获明确风险接受；已知限制、回滚方案、设备范围、离线范围和不支持场景已记录；最终 `npm run check`、E2E、视觉和性能报告可复核。标记候选不等于执行发布，任何提交、推送、合并、打标签或发布仍须用户明确授权。

### 3.2 科学证据管理

每条科学规则维护唯一证据对象：`evidenceId`、规则陈述、来源类型、来源定位、适用范围、模型近似、关联测试、关联界面文案、审校状态、审校人和日期。来源类型至少区分教材/课程标准、专家审校、公开科研资料和参数化假设；参数化假设必须在界面和退出评审中明确标注。证据对象变更时必须触发关联测试与审校复核，不得只更新截图或文案。

## 4. 计划自检结论

- 需求覆盖：科学模型、三视图、因果引擎、课堂模式、季节移动、地点、海陆、季风、气候、学习任务、性能、离线和专家审校均有对应阶段与闸门。
- 范围控制：P0、P1、P2 互相独立可交付；P3 的 VR、多人、云端、AI 继续留在真实反馈后的独立规划中。
- 类型一致性：统一使用 `SimulationParameters` → `deriveAtmosphere` → `AtmosphereSnapshot` → projector/view；视图无权反写科学真值。
- 占位扫描：计划未使用未决占位符或无验收条件的泛化步骤。
- 调试原则：任何科学或同步缺陷都先转成失败测试；优化必须证明不改变科学快照。
- 变更治理：需求必须可追溯到用户授权、原始规划文档或用户确认记录；提交与发布不是默认步骤，必须单独取得用户明确授权。
- 证据治理：科学规则、测试、界面解释和审校记录通过 `evidenceId` 关联；证据缺失或状态过期时，版本不得通过科学退出闸门。
