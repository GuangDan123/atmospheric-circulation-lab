import type { ReactNode } from 'react'

type ClassroomLayoutProps = Readonly<{
  sectionView: ReactNode
  globeView: ReactNode
  causalPanel: ReactNode
  controls: ReactNode
  timeline: ReactNode
  locationPanel: ReactNode
  keyframes: ReactNode
  teacherToolbar: ReactNode
  performancePanel: ReactNode
}>

export function ClassroomLayout({
  sectionView,
  globeView,
  causalPanel,
  controls,
  timeline,
  locationPanel,
  keyframes,
  teacherToolbar,
  performancePanel,
}: ClassroomLayoutProps) {
  return (
    <div className="classroom-layout">
      <div className="classroom-layout__views">
        <section aria-label="经向剖面视图" className="view-card">
          <h2>经向剖面</h2>
          {sectionView}
        </section>
        <section aria-label="三维全球大气环流球面视图" className="view-card view-card--globe">
          <h2>三维球面</h2>
          {globeView}
        </section>
        {causalPanel}
      </div>
      <div className="classroom-layout__bottom">
        {teacherToolbar}
        {controls}
        {timeline}
        {locationPanel}
        {keyframes}
        {performancePanel}
      </div>
    </div>
  )
}
