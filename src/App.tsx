import { MonsoonExplorer } from './features/monsoon/MonsoonExplorer'
import { useMemo, useState } from 'react'
import { ClassroomLayout } from './components/layout/ClassroomLayout'
import { mediterraneanLocation } from './data/locations'
import { CausalPanel } from './features/causal-panel/CausalPanel'
import { SimulationControls } from './features/control-panel/SimulationControls'
import { GlobeView } from './features/globe/GlobeView'
import { KeyframePanel } from './features/keyframes/KeyframePanel'
import { LandSeaControls } from './features/land-sea/LandSeaControls'
import { LocationPanel } from './features/location/LocationPanel'
import { MapProjection } from './features/map-projection/MapProjection'
import { MeridionalSection } from './features/meridional-section/MeridionalSection'
import { PredictionCard } from './features/student/PredictionCard'
import { PerformancePanel } from './features/settings/PerformancePanel'
import {
  TeacherToolbar,
  type TeacherKeyBindings,
} from './features/teacher/TeacherToolbar'
import { MonthTimeline } from './features/timeline/MonthTimeline'
import {
  detectDeviceCapabilities,
  getPerformanceProfile,
  type LabelDensity,
} from './rendering/performance/profile'
import {
  selectAtmosphereSnapshot,
  useSimulationStore,
} from './state/simulationStore'

import './styles/tokens.css'
import './styles/classroom.css'
import './App.css'

const teacherKeyBindings: TeacherKeyBindings = {
  previous: 'PageUp',
  next: 'PageDown',
  togglePlayback: ' ',
}

function App() {
  const state = useSimulationStore()
  const snapshot = selectAtmosphereSnapshot(state)
  const [locationLocked, setLocationLocked] = useState(true)
  const [manualLabelDensity, setManualLabelDensity] =
    useState<LabelDensity | null>(null)
  const capabilities = useMemo(() => detectDeviceCapabilities(), [])
  const detectedProfile = useMemo(
    () => getPerformanceProfile(capabilities),
    [capabilities],
  )
  const performanceProfile = useMemo(
    () =>
      getPerformanceProfile(
        capabilities,
        state.performanceTier === 'auto' ? undefined : state.performanceTier,
      ),
    [capabilities, state.performanceTier],
  )
  const labelDensity =
    manualLabelDensity ?? performanceProfile.labelDensity

  function enterFullscreen(): void {
    void document.documentElement.requestFullscreen?.()
  }

  function captureScreenshot(): void {
    const canvas = document.querySelector('canvas')
    if (!(canvas instanceof HTMLCanvasElement)) return

    const link = document.createElement('a')
    link.download = 'three-cell-circulation.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <main>
      <header className="app-header">
        <p className="app-header__eyebrow">高中地理 · 因果探究</p>
        <h1>三圈环流因果探究平台</h1>
        <p>从太阳辐射、地转偏向到副热带高压的动力成因</p>
      </header>
      <ClassroomLayout
        sectionView={
          <>
            <MeridionalSection
              snapshot={snapshot}
              selectedPressureBeltId={state.selectedPressureBeltId}
              onSelectPressureBelt={state.selectPressureBelt}
            />
            <MapProjection
              snapshot={snapshot}
              selectedPressureBeltId={state.selectedPressureBeltId}
              onSelectPressureBelt={state.selectPressureBelt}
            />
          </>
        }
        globeView={
          <GlobeView
            snapshot={snapshot}
            visibleLayers={state.visibleLayers}
            selectedPressureBeltId={state.selectedPressureBeltId}
            explodedViewProgress={state.explodedViewProgress}
            performanceProfile={performanceProfile}
            labelDensity={labelDensity}
            onSelectPressureBelt={state.selectPressureBelt}
          />
        }
        causalPanel={
          <CausalPanel
            coriolisEnabled={state.coriolisEnabled}
            selectedPressureBeltId={state.selectedPressureBeltId}
            teachingStep={state.teachingStep}
            playback={state.playback}
            speed={state.playbackSpeed}
            onTeachingStepChange={state.setTeachingStep}
            onPrevious={state.previousTeachingStep}
            onNext={state.nextTeachingStep}
            onPlaybackChange={state.setPlayback}
          />
        }
        teacherToolbar={
          <TeacherToolbar
            playing={state.playback === 'playing'}
            speed={state.playbackSpeed}
            labelDensity={labelDensity}
            keyBindings={teacherKeyBindings}
            onPrevious={state.previousTeachingStep}
            onNext={state.nextTeachingStep}
            onPlaybackChange={(playing) =>
              state.setPlayback(playing ? 'playing' : 'paused')
            }
            onSpeedChange={state.setPlaybackSpeed}
            onLabelDensityChange={setManualLabelDensity}
            onFullscreen={enterFullscreen}
            onReset={state.reset}
            onScreenshot={captureScreenshot}
          />
        }
        controls={
          <>
            <SimulationControls
              month={state.month}
              coriolisEnabled={state.coriolisEnabled}
              rotationDirection={state.rotationDirection}
              rotationStrength={state.rotationStrength}
              canUndo={state.history.past.length > 0}
              canRedo={state.history.future.length > 0}
              onUndo={state.undo}
              onRedo={state.redo}
              onRotationDirectionChange={state.setRotationDirection}
              onRotationStrengthChange={state.setRotationStrength}
              frictionStrength={state.frictionStrength}
              explodedViewProgress={state.explodedViewProgress}
              visibleLayers={state.visibleLayers}
              onMonthChange={state.setMonth}
              onCoriolisChange={state.setCoriolisEnabled}
              onFrictionChange={state.setFrictionStrength}
              onExplodedViewChange={state.setExplodedViewProgress}
              onLayerChange={state.setVisibleLayer}
            />
            <PredictionCard
              key={state.resetVersion}
              snapshot={snapshot}
              onApplyPreset={state.applyPreset}
              onPause={() => state.setPlayback('paused')}
            />
            <MonsoonExplorer
              snapshot={snapshot}
              onApplyPreset={state.applyPreset}
              onSeasonalShiftChange={state.setSeasonalShiftScale}
              onCrossEquatorialChange={state.setCrossEquatorialEnabled}
              onCoriolisChange={state.setCoriolisEnabled}
              onLandSeaChange={state.setLandSeaContrast}
            />
            <LandSeaControls
              landSeaContrast={state.landSeaContrast}
              onChange={state.setLandSeaContrast}
            />
          </>
        }
        timeline={
          <MonthTimeline month={state.month} onMonthChange={state.setMonth} />
        }
        locationPanel={
          <LocationPanel
            location={mediterraneanLocation}
            snapshot={snapshot}
            locked={locationLocked}
            onLockedChange={setLocationLocked}
            onMonthChange={state.setMonth}
          />
        }
        keyframes={<KeyframePanel onApplyPreset={state.applyPreset} />}
        performancePanel={
          <PerformancePanel
            detectedTier={detectedProfile.tier}
            selectedTier={state.performanceTier}
            onTierChange={state.setPerformanceTier}
          />
        }
      />
    </main>
  )
}

export default App
