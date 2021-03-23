import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'

import EmptyState from '../EmptyState'
import HarmonyMonarch from './HarmonyMonarch'
import { HarmonyThemeDark, HarmonyThemeLight } from './HarmonyTheme'
import { ReactComponent as InsertBlockIllustration } from '../../illustrations/insert-block.svg'

import Editor from '@monaco-editor/react'

import { withStyles } from '@material-ui/styles'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
} from '@material-ui/core'
import { Description as FileIcon, Add as AddIcon } from '@material-ui/icons'

import {
  Menu,
  Item,
  Separator,
  contextMenu,
  animation as ContextMenuAnim,
  theme as ContextMenuTheme,
} from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'

import HarmonyPanel from '../HarmonyPanel/HarmonyPanel'

const drawerWidth = 240

const MENU_ID = 'files-context-menu'

const styles = (theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  editorContainer: {
    height: '100%',
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    width: `calc(100% - ${drawerWidth})`,
    padding: theme.spacing(0),
  },
})

class HomePage extends Component {
  handleEditorHarmonyCustomLang(monaco) {
    monaco.editor.defineTheme('harmonyThemeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: HarmonyThemeDark,
    })
    monaco.editor.defineTheme('harmonyThemeLight', {
      base: 'vs',
      inherit: true,
      rules: HarmonyThemeLight,
    })
    monaco.languages.register({
      id: 'harmony',
    })
    monaco.languages.setMonarchTokensProvider('harmony', HarmonyMonarch)
  }

  displayMenu = (e) => {
    contextMenu.show({
      id: MENU_ID,
      event: e,
      props: { id: e.currentTarget.id },
    })
  }

  handleItemClick = ({ event, props, data, triggerEvent }) => {
    switch (event.currentTarget.id) {
      case 'rename':
        this.props.renameFileRequest(props.id)
        break
      case 'delete':
        this.props.deleteFileRequest(props.id)
        break
      default:
        throw new Error('How did you even get here?')
    }
  }

  render() {
    const {
      classes,
      theme,
      project,
      addFileRequest,
      setFileActive,
      saveProjectFile,
      handleEditorChange,
      harmonyPanelRef,
      setHarmonyPanelWidth,
      harmonyPanelState,
    } = this.props

    return (
      <Box className={classes.root}>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              {project &&
                project.files
                  .slice()
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
                  .map((text, index, arr) => (
                    <ListItem
                      button
                      id={`${text.name}`}
                      key={text.name}
                      selected={text.name === project.activeFile}
                      onClick={() => setFileActive(text.name)}
                      onContextMenu={this.displayMenu}
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={text.name + (text.hasChanges ? '*' : '')}
                      />
                    </ListItem>
                  ))}
              <ListItem button key={'add-file'} onClick={addFileRequest}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={'Add File'} />
              </ListItem>
            </List>
          </div>
          <Menu
            id={MENU_ID}
            theme={theme.dark ? ContextMenuTheme.dark : ContextMenuTheme.light}
            animation={ContextMenuAnim.slide}
          >
            <Item id="rename" onClick={this.handleItemClick}>
              Rename
            </Item>
            <Separator />
            <Item id="delete" onClick={this.handleItemClick}>
              Delete
            </Item>
          </Menu>
        </Drawer>
        <Box className={classes.content}>
          <Box flexGrow={1} mt={8} overflow={'hidden'}>
            <EmptyState
              image={<InsertBlockIllustration />}
              title="Welcome to Harmony!"
              description="Sign in to access your files, or start a new one at the top left!"
            />
            {project.activeFile && (
              <div
                className={classes.editorContainer}
                onKeyDown={(event) => {
                  const key = event.key || event.keyCode
                  if (
                    (key === 's' || key === 'S' || key === 83) &&
                    (navigator.platform.match('Mac')
                      ? event.metaKey
                      : event.ctrlKey)
                  ) {
                    event.preventDefault()
                    saveProjectFile(
                      project.files.findIndex(
                        (e) => e.name === project.activeFile
                      )
                    )
                  }
                }}
              >
                <Editor
                  theme={theme.dark ? 'harmonyThemeDark' : 'harmonyThemeLight'}
                  defaultLanguage="harmony"
                  beforeMount={this.handleEditorHarmonyCustomLang.bind(this)}
                  path={project.activeFile}
                  defaultValue={
                    project.files.find((e) => e.name === project.activeFile)
                      .text
                  }
                  onChange={handleEditorChange}
                />
              </div>
            )}
          </Box>
        </Box>
        <HarmonyPanel
          harmonyPanelRef={harmonyPanelRef}
          setHarmonyPanelWidth={setHarmonyPanelWidth}
          harmonyPanelState={harmonyPanelState}
        />
      </Box>
    )
  }
}

HomePage.propTypes = {
  user: PropTypes.object,
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withRouter(HomePage))
