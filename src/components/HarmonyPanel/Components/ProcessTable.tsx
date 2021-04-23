import { CharmonyMacroStep, CharmonyTopLevel } from '../charmony/CharmonyData'
import React, { createRef, useEffect, useState } from 'react'

const COLOR_MAP = [
  '#c62828',
  '#AD1457',
  '#6A1B9A',
  '#4527A0',
  '#283593',
  '#1565C0',
  '#0277BD',
  '#00838F',
  '#00695C',
  '#2E7D32',
  '#558B2F',
  '#9E9D24',
  '#F9A825',
  '#FF8F00',
  '#EF6C00',
  '#D84315',
  '#4E342E',
  '#424242',
  '#37474F',
]
/**
 * ECMA2016 / ES6
 */
const convertHexToRGBA = (hexCode: string, opacity: number) => {
  let hex = hexCode.replace('#', '')
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r},${g},${b},${opacity / 100})`
}

type ProcessElement = {
  timeStart: number
  macroStep: CharmonyMacroStep
}

function organizeMacroSteps(
  macroSteps: CharmonyMacroStep[]
): {
  tids: string[]
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
  return { processes, tids, totalDuration: time }
}

function ProcessBar(props: {
  tid: string
  color: string
  processes: ProcessElement[]
  onClick(p: ProcessElement): void
}) {
  const processBarHeight = 30
  let time = 0
  return (
    <div
      style={{
        boxSizing: 'border-box',
      }}
    >
      {props.processes
        .filter((x) => x.macroStep.tid === props.tid)
        .map((p) => {
          const marginLeft = p.timeStart - time
          time = p.timeStart + p.macroStep.duration
          const width = p.macroStep.duration
          return (
            <div
              onClick={() => props.onClick(p)}
              style={{
                width: width,
                height: processBarHeight,
                boxSizing: 'border-box',
                border: `1px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: 3,
                cursor: 'pointer',
                marginLeft: marginLeft,
                backgroundColor: convertHexToRGBA(props.color, 100),
                display: 'inline-block',
                overflow: 'scroll',
              }}
            />
          )
        })}
    </div>
  )
}

function timeFormatToHH_MM_SS(t: number): string {
  let hours: number | string = Math.floor(t / 3600)
  let minutes: number | string = Math.floor((t - hours * 3600) / 60)
  let seconds: number | string = t - hours * 3600 - minutes * 60

  if (hours < 10) {
    hours = '0' + hours
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return hours + ':' + minutes + ':' + seconds
}

export default function ProcessTable(props: { toplevel: CharmonyTopLevel }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerBar = createRef<HTMLDivElement>()
  const { processes, tids, totalDuration } = organizeMacroSteps(
    props.toplevel.macroSteps
  )

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (currentTime + 1 >= totalDuration) {
          clearInterval(interval)
          setIsPlaying(false)
        }
        setCurrentTime(currentTime + 1)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentTime, isPlaying, totalDuration])

  useEffect(() => {
    playerBar.current?.scrollIntoView()
  }, [playerBar])

  const windowWidth = window.innerWidth
  let sliderWidth = windowWidth - 140

  return (
    <div style={{ backgroundColor: '#1F1F1F', color: 'white' }}>
      <div style={{ backgroundColor: '#3C3C3C' }}>
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', width: 140 }}>
            <div
              style={{
                flex: 1,
                margin: 6,
                padding: '3px 0',
                cursor: 'pointer',
                backgroundColor: '#252525',
                textAlign: 'center',
              }}
            >
              {'<'}
            </div>
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                flex: 1,
                margin: 6,
                padding: '3px 0',
                cursor: 'pointer',
                backgroundColor: '#252525',
                textAlign: 'center',
              }}
            >
              {isPlaying ? '⏸' : '▶️'}
            </div>
            <div
              style={{
                flex: 1,
                margin: 6,
                padding: '3px 0',
                cursor: 'pointer',
                backgroundColor: '#252525',
                textAlign: 'center',
              }}
            >
              {'>'}
            </div>
          </div>
        </div>
        <div style={{ display: 'inline-block', width: sliderWidth }}>
          <span style={{ width: 100 }}>
            {timeFormatToHH_MM_SS(currentTime)}
          </span>
          <input
            type="range"
            style={{ maxWidth: 500, width: sliderWidth / 2, margin: '0 1rem' }}
            value={currentTime}
            max={totalDuration}
            onChange={(e) => setCurrentTime(Number.parseInt(e.target.value))}
          />
          <span>{timeFormatToHH_MM_SS(totalDuration)}</span>
        </div>
      </div>

      {/* Video Progress */}
      <div
        style={{
          backgroundColor: '#1F1F1F',
          height: 300,
          overflowY: 'scroll',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            height: '100%',
            borderRight: '1px solid green',
            verticalAlign: 'top',
            width: '8%',
          }}
        >
          {tids.map((tid) => {
            return <div style={{ height: 30, paddingLeft: '10%' }}>P{tid}</div>
          })}
        </div>
        <div
          style={{
            float: 'right',
            width: '90%',
            height: '100%',
            position: 'relative',
            display: 'inline-block',
            overflowX: 'scroll',
            whiteSpace: 'nowrap',
            borderLeft: '1px solid green',
            overflowY: 'hidden',
          }}
        >
          <div
            style={{
              zIndex: 100,
              position: 'relative',
              height: '100%',
              backgroundColor: 'white',
              width: 4,
              left: currentTime,
            }}
            ref={playerBar}
          />
          <div style={{ position: 'absolute', zIndex: 0, top: 0 }}>
            {tids.map((tid, idx) => {
              return (
                <div style={{ height: 30 }}>
                  <ProcessBar
                    tid={tid}
                    processes={processes}
                    color={COLOR_MAP[idx & COLOR_MAP.length]}
                    onClick={(p) => {
                      setCurrentTime(p.timeStart)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
