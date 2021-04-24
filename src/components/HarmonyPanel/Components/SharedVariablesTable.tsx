import React from 'react'
import ReactTooltip from 'react-tooltip'
import styles from './SharedVariablesTable.module.css'
import DropDownPane from './DropDownPane'

/**
 * Creates an html-tag string which is customized for colors based on
 * the type of the given value.
 */
function HtmlValue(props: { v: unknown }): JSX.Element {
  const v = props.v
  const create = (color: string, value: string) => (
    <span style={{ color: color }}>{value}</span>
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

function ObjectCollapseable(props: {
  summary: string
  object: Record<string, unknown>
}) {
  return (
    <details>
      <summary>{props.summary}</summary>
      {Object.entries(props.object).map(([k, v]) => {
        if (v == null || typeof v !== 'object') {
          return (
            <p>
              {k}: <HtmlValue v={v} />
            </p>
          )
        } else if (typeof v === 'object') {
          const header = Array.isArray(v) ? '[Array]' : '[object Object]'
          return (
            <ObjectCollapseable
              summary={`${k}: ${header}`}
              object={(v as Record<string, unknown>) || {}}
            />
          )
        }
        return <div />
      })}
    </details>
  )
}

export default function SharedVariablesTable(props: {
  values: Record<string, unknown>
  height?: number
}) {
  return (
    <DropDownPane
      header={'Shared Variables'}
      height={props.height}
      className={styles.sharedVariableTable}
    >
      <ObjectCollapseable summary={'Shared Variables'} object={props.values} />
    </DropDownPane>
  )
}
