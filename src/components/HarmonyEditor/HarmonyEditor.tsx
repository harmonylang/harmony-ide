import React from 'react'

import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react'

const HarmonyEditor = ({ theme }) => {
  const monaco = useMonaco()

  return (
    <Editor
      theme={theme.dark ? 'vs-dark' : 'light'}
      defaultLanguage="python"
      defaultValue=""
    />
  )
}

export default HarmonyEditor
