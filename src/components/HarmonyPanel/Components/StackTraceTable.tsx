import React from 'react'
import { CharmonyStackTrace } from '../charmony/CharmonyData'

export default function StackTraceTable(props: { stack: CharmonyStackTrace }) {
  return (
    <table
      style={{ backgroundColor: '#1F1F1F', width: '100%', color: 'white' }}
    >
      <thead>
        <tr>
          <th>Process</th>
          <th>Status</th>
          <th>Stack Trace</th>
          <th>Variables</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Test</td>
          <td>Value</td>
        </tr>
      </tbody>
    </table>
  )
}
