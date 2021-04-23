import React from 'react'
import AssemblyCodeTable from './Components/AssemblyCodeTable'
import StackTraceTable from './Components/StackTraceTable'
import SharedVariablesTable from './Components/SharedVariablesTable'
import ProcessTable from './Components/ProcessTable'
import { CharmonyTopLevel } from './charmony/CharmonyData'

export default function HarmonyPanel(props: { toplevel: CharmonyTopLevel }) {
  return (
    <div>
      <StackTraceTable
        stack={{
          tid: 'P1',
          fullStatus: 'FAILURE',
          status: 'FAILURE',
          atomic: 0,
          readonly: 1,
          interruptLevel: 0,
          callStack: [],
        }}
      />
      <AssemblyCodeTable
        code={[
          {
            assembly: [
              {
                assembly: 'PUSH 1',
                explain: 'pushes 1',
              },
              {
                assembly: 'JUMP 154',
                explain: 'jumps to pc 154',
              },
            ],
            sourceCode: 'print()',
            line: '1',
            file: 'source.hny',
            initialPc: 1,
          },
        ]}
      />

      <SharedVariablesTable values={{ k: 1, g: 3, p: { d: 'Atom' } }} />

      <ProcessTable toplevel={props.toplevel} />
    </div>
  )
}
