import { CharmonyExecutedCode } from '../charmony/CharmonyData'
import ReactTooltip from 'react-tooltip'
import React from 'react'
import DropDownPane from './DropDownPane'

export default function AssemblyCodeTable(props: {
  code: CharmonyExecutedCode[]
  height?: number
}) {
  return (
    <DropDownPane height={props.height} header={'Assembly'}>
      <>
        <table
          style={{
            backgroundColor: '#1F1F1F',
            width: '100%',
            fontFamily: 'monospace',
          }}
        >
          <tbody>
            {props.code.map((c) => {
              const { assembly, file, line, sourceCode, initialPc } = c
              return (
                <>
                  <tr>
                    <td />
                    <td>
                      <span style={{ color: '#A4D7A7' }}>{file}:</span>{' '}
                      <span style={{ color: '#778585' }}>
                        {line} {sourceCode}
                      </span>
                    </td>
                  </tr>
                  {assembly.map((a, pcOffset) => {
                    const { assembly, explain } = a
                    const pc = initialPc + pcOffset
                    return (
                      <>
                        <tr>
                          <td style={{ color: '#778585' }}>{pc}</td>
                          <td style={{ color: '#E7E7E7' }} data-tip={explain}>
                            {assembly}
                          </td>
                        </tr>
                      </>
                    )
                  })}
                </>
              )
            })}
          </tbody>
        </table>
        <ReactTooltip />
      </>
    </DropDownPane>
  )
}