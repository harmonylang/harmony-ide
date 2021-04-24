import React, { useState } from 'react'
import { CharmonyStackTrace } from '../charmony/CharmonyData'
import styles from './StackTraceTable.module.css'

/**
 * Creates an html-tag string which is customized for colors based on
 * the type of the given value.
 */
function createHtmlValue(v: unknown) {
  const create = (color: string, value: string) => (
    <span style={{ color }}>{value}</span>
  )
  if (typeof v === 'string') {
    if (v.startsWith('?')) {
      return create('#ed85ff', `${v}`)
    } else {
      return create('#bc6021', `"${v}"`)
    }
  }
  if (typeof v === 'boolean' || typeof v === 'number') {
    const s = v.toString()
    return create('#24a583', s[0].toUpperCase() + s.substring(1))
  }
  if (v == null) {
    return create('#a01c1c', 'None')
  } else {
    return create('#ffffff', JSON.stringify(v))
  }
}

function colorOfStatus(status: string) {
  switch (status) {
    case 'running':
      return '#30ea30'
    case 'running atomic':
      return '#12dd96'
    case 'runnable':
      return '#0b3fcf'
    case 'failed':
      return '#d71616'
    case 'blocked':
      return '#701f1f'
    case 'terminated':
      return '#fff000'
    case 'choosing':
      return '#19a7ee'
    default:
      return '#9b9b9b'
  }
}

function CallStackColumns(props: { stack: CharmonyStackTrace }) {
  const stack = props.stack
  const [callStackIdx, setCallStackIdx] = useState(0)
  const stackTrace = stack.callStack[callStackIdx]
  return (
    <>
      <td className={styles.stackTraceColumn}>
        {stack.callStack.map((call, idx) => {
          return (
            <div
              style={{
                cursor: 'pointer',
                color: 'rgb(71,226,92)',
                textDecoration: 'underline',
                width: 'auto',
              }}
              onClick={() => setCallStackIdx(idx)}
            >
              {call.method}
            </div>
          )
        })}
        {stack.failure != null && (
          <div style={{ color: '#d71616' }}>{stack.failure}</div>
        )}
      </td>
      <td className={styles.variablesColumn}>
        {stackTrace != null &&
          Object.entries(stackTrace.vars).map(([name, value]) => {
            return (
              <div>
                {name} = {createHtmlValue(value)}
              </div>
            )
          })}
      </td>
    </>
  )
}

export default function StackTraceTable(props: {
  stack: Record<string, CharmonyStackTrace>
  height?: number
  minWidth?: number
}) {
  return (
    <div className={styles.stackTraceTable}>
      <div style={{ minWidth: props.minWidth || 1000 }}>
        <table>
          <thead>
            <tr>
              <th className={styles.processColumn}>Process</th>
              <th className={styles.statusColumn}>Status</th>
              <th className={styles.stackTraceColumn}>Stack Trace</th>
              <th className={styles.variablesColumn}>Variables</th>
            </tr>
          </thead>
          <tbody style={{ height: props.height || 200 }}>
            {Object.entries(props.stack).map(([id, stack]) => {
              return (
                <tr>
                  <td className={styles.processColumn}>P{id}</td>
                  <td
                    className={styles.statusColumn}
                    style={{ color: colorOfStatus(stack.fullStatus) }}
                  >
                    {stack.fullStatus}
                  </td>
                  <CallStackColumns stack={stack} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
