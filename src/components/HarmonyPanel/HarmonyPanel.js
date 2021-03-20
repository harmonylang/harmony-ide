import React, { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import harmonyHtml from './charmony-v2'

import { Button, Drawer, Divider } from '@material-ui/core'

const defaultHarmonySrc = ''
const minDrawerWidth = 0
const maxDrawerWidth = 1000

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0,
  },
  drawerPaper: {
    overflow: 'visible',
  },
  toolbar: theme.mixins.toolbar,
  dragger: {
    width: '10px',
    cursor: 'ew-resize',
    padding: '4px 0 0',
    borderTop: '1px solid #ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#e0e0e0',
  },
  analysisBtn: {
    position: 'absolute',
    top: 128,
    left: 0,
    marginLeft: -60,
    zIndex: 100,
    transform: 'rotate(-90deg)',
  },
  harmonyPanel: {
    height: '100%',
    borderWidth: '0px',
  },
}))

export default function HarmonyPanel(props) {
  const classes = useStyles()
  const [harmonyPanelSrc, setHarmonyPanelSrc] = useState(defaultHarmonySrc)
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e) => {
    setDragging(true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('mousemove', handleMouseMove, true)
  }

  const handleMouseUp = () => {
    setDragging(false)
    document.removeEventListener('mouseup', handleMouseUp, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
  }

  const handleMouseMove = useCallback((e) => {
    const newWidth = document.body.offsetWidth - e.clientX + 5
    if (newWidth >= minDrawerWidth && newWidth <= maxDrawerWidth) {
      props.setHarmonyPanelWidth(newWidth, true)
    } else if (newWidth > maxDrawerWidth) {
      props.setHarmonyPanelWidth(maxDrawerWidth, true)
    } else {
      props.setHarmonyPanelWidth(minDrawerWidth, true)
    }
  }, [])

  fetch(harmonyHtml)
    .then((r) => r.text())
    .then((text) => {
      setHarmonyPanelSrc(text)
    })

  return (
    <Drawer
      className={classes.drawer}
      anchor={'right'}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      PaperProps={{ style: { width: props.harmonyPanelState.width } }}
    >
      <div className={classes.toolbar} />
      <Button
        variant="contained"
        className={classes.analysisBtn}
        onClick={() =>
          props.setHarmonyPanelWidth(
            props.harmonyPanelState.savedWidth,
            props.harmonyPanelState.width === 0
          )
        }
      >
        Analysis
      </Button>
      <div
        onMouseDown={(e) => handleMouseDown(e)}
        className={classes.dragger}
      />
      <iframe
        title="HarmonyAnalysis"
        className={classes.harmonyPanel}
        style={{ pointerEvents: dragging ? 'none' : 'auto' }}
        srcDoc={harmonyPanelSrc}
        ref={props.harmonyPanelRef}
      />
      <Divider />
    </Drawer>
  )
}
