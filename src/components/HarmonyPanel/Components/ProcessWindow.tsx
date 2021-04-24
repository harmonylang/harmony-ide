import { CharmonyMacroStep, CharmonyTopLevel } from '../charmony/CharmonyData'
import React, { createRef, useEffect } from 'react'

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

function ProcessBar(props: {
  tid: string
  color: string
  processes: ProcessElement[]
  onClick(p: ProcessElement): void
}) {
  // const processBarHeight = 30
  let time = 0
  return (
    <div style={{ boxSizing: 'border-box', height: '100%' }}>
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
                height: '100%',
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

export default function ProcessWindow(props: {
  toplevel: CharmonyTopLevel
  currentTime: number
  totalDuration: number
  playbackRate: number
  togglePlaybackRate(): void
  processes: ProcessElement[]
  onTimeChange(time: number): void
  onPlayStatus(status: 'play' | 'pause'): void
  playStatus: 'play' | 'pause'
}) {
  const tids = Object.keys(props.toplevel.idToThreadName)

  const playerBar = createRef<HTMLDivElement>()
  const playerWindow = createRef<HTMLDivElement>()

  const windowWidth = window.innerWidth
  let sliderWidth = windowWidth - 140

  return (
    <div style={{ backgroundColor: '#1F1F1F', color: 'white' }}>
      <div style={{ backgroundColor: '#3C3C3C' }}>
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', width: 200 }}>
            <div
              style={{
                flex: 1,
                margin: 6,
                padding: '3px 0',
                cursor: 'pointer',
                backgroundColor: '#252525',
                textAlign: 'center',
              }}
              onClick={() =>
                props.onTimeChange(Math.max(props.currentTime - 1, 0))
              }
            >
              {'<'}
            </div>
            <div
              onClick={() =>
                props.onPlayStatus(
                  props.playStatus === 'play' ? 'pause' : 'play'
                )
              }
              style={{
                flex: 1,
                margin: 6,
                padding: '3px 0',
                cursor: 'pointer',
                backgroundColor: '#252525',
                textAlign: 'center',
              }}
            >
              {props.playStatus === 'play' ? '⏸' : '▶️'}
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
              onClick={() =>
                props.onTimeChange(
                  Math.min(props.currentTime + 1, props.totalDuration)
                )
              }
            >
              {'>'}
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
              onClick={props.togglePlaybackRate}
            >
              {props.playbackRate.toFixed(1)}x
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'inline-block',
            maxWidth: sliderWidth,
            verticalAlign: 'middle',
          }}
        >
          <div style={{ float: 'left', width: 100, textAlign: 'center' }}>
            {timeFormatToHH_MM_SS(props.currentTime)}
          </div>
          <div style={{ float: 'left' }}>
            <input
              type="range"
              style={{ margin: '0 1rem' }}
              value={props.currentTime}
              max={props.totalDuration}
              onChange={(e) => {
                if (playerWindow.current != null && playerBar.current != null) {
                  playerWindow.current.scrollLeft = playerBar.current.offsetLeft
                }
                props.onTimeChange(Number.parseInt(e.target.value))
              }}
            />
          </div>
          <div style={{ float: 'left', width: 100, textAlign: 'center' }}>
            {timeFormatToHH_MM_SS(props.totalDuration)}
          </div>
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
            return (
              <div
                style={{
                  height: 30,
                  paddingLeft: '10%',
                  boxSizing: 'border-box',
                  borderBottom: '1px solid #3C3C3C',
                }}
              >
                P{tid}
              </div>
            )
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
          ref={playerWindow}
        >
          <div
            style={{
              zIndex: 100,
              position: 'relative',
              height: '100%',
              backgroundColor: 'white',
              width: 4,
              left: props.currentTime,
            }}
            ref={playerBar}
          />
          <div style={{ position: 'absolute', zIndex: 0, top: 0 }}>
            {tids.map((tid, idx) => {
              return (
                <div
                  style={{
                    height: 30,
                    boxSizing: 'border-box',
                    borderBottom: '1px solid #3C3C3C',
                  }}
                >
                  <ProcessBar
                    tid={tid}
                    processes={props.processes}
                    color={COLOR_MAP[idx & COLOR_MAP.length]}
                    onClick={(p) => {
                      props.onTimeChange(p.timeStart)
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
