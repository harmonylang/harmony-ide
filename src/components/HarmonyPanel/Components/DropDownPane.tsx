import React, { useState } from 'react'

export default function DropDownPane(props: {
  children: JSX.Element
  header: string
  height?: number
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className={props.className}>
      <div style={{ backgroundColor: '#3C3C3C', width: '100%' }}>
        <div
          style={{
            color: 'white',
            fontFamily: 'monospace',
            padding: 10,
            fontSize: 20,
            width: 'auto',
            display: 'inline-block',
          }}
        >
          {props.header}
        </div>
        <div
          style={{
            color: 'white',
            fontFamily: 'monospace',
            fontSize: 20,
            height: '100%',
            marginRight: 10,
            marginTop: 5,
            display: 'inline-block',
            cursor: 'pointer',
            float: 'right',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '🔼' : '🔽'}
        </div>
      </div>

      <div
        style={{
          height: props.height || 240,
          overflow: 'scroll',
          width: '100%',
          display: isOpen ? 'inherit' : 'none',
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
