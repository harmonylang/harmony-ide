import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/styles'

import { Link as RouterLink } from 'react-router-dom'

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  ButtonGroup,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Link,
} from '@material-ui/core'

import { PlayArrow as RunIcon, Save as SaveIcon } from '@material-ui/icons'

import UserAvatar from '../UserAvatar'
import { ReactComponent as HarmonyLogo } from '../../illustrations/ic_harmony.svg'

const styles = (theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
})

class Bar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      menu: {
        anchorEl: null,
      },
    }
  }

  openMenu = (event) => {
    const anchorEl = event.currentTarget

    this.setState({
      menu: {
        anchorEl,
      },
    })
  }

  closeMenu = () => {
    this.setState({
      menu: {
        anchorEl: null,
      },
    })
  }

  render() {
    // Properties
    const { performingAction, user, userData, roles, classes } = this.props

    // Events
    const {
      onRunHarmony,
      onAboutClick,
      onSettingsClick,
      onSignOutClick,
      onSignUpClick,
      onSignInClick,
    } = this.props

    const { menu } = this.state

    const menuItems = [
      {
        name: 'About',
        onClick: onAboutClick,
      },
      {
        name: 'Profile',
        to: user ? `/user/${user.uid}` : null,
      },
      {
        name: 'Settings',
        onClick: onSettingsClick,
      },
      {
        name: 'Sign out',
        divide: true,
        onClick: onSignOutClick,
      },
    ]

    return (
      <AppBar color="default" position="fixed" className={classes.appBar}>
        <Toolbar>
          <Box display="flex" flexGrow={1}>
            <Link
              color="inherit"
              component={RouterLink}
              to="/"
              underline="none"
            >
              <HarmonyLogo height={`2.5em`} />
            </Link>
            <Box ml={2}>
              <Typography color="inherit" variant="h6">
                {process.env.REACT_APP_TITLE}
              </Typography>
            </Box>
          </Box>

          <Box mr={2}>
            <ButtonGroup
              color="default"
              aria-label="outlined secondary button group"
            >
              <Button>
                <RunIcon onClick={onRunHarmony} />
              </Button>
              <Button>
                <SaveIcon />
              </Button>
            </ButtonGroup>
          </Box>

          {user && (
            <>
              {roles.includes('admin') && (
                <Box mr={1}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    variant="outlined"
                  >
                    Admin
                  </Button>
                </Box>
              )}

              <IconButton
                color="inherit"
                disabled={performingAction}
                onClick={this.openMenu}
              >
                <UserAvatar user={Object.assign(user, userData)} />
              </IconButton>

              <Menu
                anchorEl={menu.anchorEl}
                open={Boolean(menu.anchorEl)}
                onClose={this.closeMenu}
              >
                {menuItems.map((menuItem, index) => {
                  if (
                    menuItem.hasOwnProperty('condition') &&
                    !menuItem.condition
                  ) {
                    return null
                  }

                  let component = null

                  if (menuItem.to) {
                    component = (
                      <MenuItem
                        key={index}
                        component={RouterLink}
                        to={menuItem.to}
                        onClick={this.closeMenu}
                      >
                        {menuItem.name}
                      </MenuItem>
                    )
                  } else {
                    component = (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          this.closeMenu()

                          menuItem.onClick()
                        }}
                      >
                        {menuItem.name}
                      </MenuItem>
                    )
                  }

                  if (menuItem.divide) {
                    return (
                      <span key={index}>
                        <Divider />

                        {component}
                      </span>
                    )
                  }

                  return component
                })}
              </Menu>
            </>
          )}

          {!user && (
            <ButtonGroup
              color="inherit"
              disabled={performingAction}
              variant="outlined"
            >
              <Button onClick={onSignUpClick}>Sign up</Button>
              <Button onClick={onSignInClick}>Sign in</Button>
            </ButtonGroup>
          )}
        </Toolbar>
      </AppBar>
    )
  }
}

Bar.defaultProps = {
  performingAction: false,
}

Bar.propTypes = {
  // Properties
  performingAction: PropTypes.bool.isRequired,
  user: PropTypes.object,
  userData: PropTypes.object,
  classes: PropTypes.object.isRequired,

  // Events
  onAboutClick: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  onSignOutClick: PropTypes.func.isRequired,
}

export default withStyles(styles)(Bar)
