import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'

import EmptyState from '../EmptyState'
import HarmonyEditor from '../HarmonyEditor'

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

import { ReactComponent as InsertBlockIllustration } from '../../illustrations/insert-block.svg'

const drawerWidth = 240

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
  content: {
    flexGrow: 1,
    display: 'flex',
    width: `calc(100% - ${drawerWidth})`,
    padding: theme.spacing(0),
  },
})

class HomePage extends Component {
  render() {
    const { classes, theme } = this.props

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
              {[
                'diners.hny',
                'peterson.hny',
                'dinersAvoid.hny',
                'New File',
              ].map((text, index, arr) => (
                <ListItem button key={text}>
                  <ListItemIcon>
                    {arr.length - 1 === index ? <AddIcon /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
        <Box className={classes.content}>
          <Box flexGrow={1} mt={8} overflow={'hidden'}>
            <EmptyState
              image={<InsertBlockIllustration />}
              title="RMUIF"
              description="Supercharged version of Create React App with all the bells and whistles."
            />
            <HarmonyEditor theme={theme} />
          </Box>
        </Box>
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
