import React, { useEffect, useState } from 'react'
import AssemblyCodeTable from './Components/AssemblyCodeTable'
import StackTraceTable from './Components/StackTraceTable'
import SharedVariablesTable from './Components/SharedVariablesTable'
import ProcessWindow from './Components/ProcessWindow'
import {
  CharmonyMacroStep,
  CharmonyMicroStep,
  CharmonyTopLevel,
} from './charmony/CharmonyData'
import test from './test.json'

type ProcessElement = {
  timeStart: number
  macroStep: CharmonyMacroStep
}

function organizeMacroSteps(
  macroSteps: CharmonyMacroStep[]
): {
  processes: ProcessElement[]
  totalDuration: number
} {
  let time = 0
  const tidsSet = new Set<string>()
  const tids: string[] = []
  const processes = macroSteps.map((mas) => {
    tidsSet.add(mas.tid)
    const e = { macroStep: mas, timeStart: time }
    time += mas.duration
    return e
  })
  tidsSet.forEach((v) => tids.push(v))
  return { processes, totalDuration: time }
}

const playbackRatesArray = [1, 2, 0.5]

export default function HarmonyPanel(props: { toplevel?: CharmonyTopLevel }) {
  const jsonData: CharmonyTopLevel = test as any
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [playStatus, setPlayStatus] = useState<'play' | 'pause'>('pause')
  const [playbackRateIdx, setPlaybackRateIdx] = useState(0)

  const { processes, totalDuration } = organizeMacroSteps(jsonData.macroSteps)
  useEffect(() => {
    if (playStatus === 'play') {
      const interval = setInterval(() => {
        if (currentTime + 1 >= totalDuration) {
          clearInterval(interval)
          setPlayStatus('pause')
        }
        setCurrentTime(currentTime + 1)
      }, 100 / playbackRatesArray[playbackRateIdx])
      return () => clearInterval(interval)
    }
  }, [currentTime, playStatus, playbackRateIdx, totalDuration])
  const currentSlice =
    jsonData.slices[
      jsonData.microSteps[Math.min(currentTime, jsonData.microSteps.length - 1)]
        .sliceIdx
    ]

  return (
    <div>
      <StackTraceTable stack={currentSlice.idToStackTrace} height={400} />
      <AssemblyCodeTable code={jsonData.executedCode} />
      <SharedVariablesTable values={currentSlice.sharedValues} />

      <ProcessWindow
        toplevel={jsonData}
        playbackRate={playbackRatesArray[playbackRateIdx]}
        togglePlaybackRate={() => {
          setPlaybackRateIdx((playbackRateIdx + 1) % playbackRatesArray.length)
        }}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        onPlayStatus={setPlayStatus}
        processes={processes}
        totalDuration={totalDuration}
        playStatus={playStatus}
      />
    </div>
  )
}
