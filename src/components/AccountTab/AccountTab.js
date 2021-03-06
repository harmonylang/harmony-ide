import React, { Component } from 'react'

import PropTypes from 'prop-types'

import validate from 'validate.js'
import moment from 'moment'

import { withStyles } from '@material-ui/core/styles'

import {
  DialogContent,
  Grid,
  Typography,
  Box,
  Fade,
  CircularProgress,
  Badge,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Hidden,
  TextField,
  Tooltip,
  IconButton,
  Divider,
} from '@material-ui/core'

import {
  Photo as PhotoIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  PersonOutline as PersonOutlineIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  DeleteForever as DeleteForeverIcon,
} from '@material-ui/icons'

import constraints from '../../data/constraints'
import authentication from '../../services/authentication'

const styles = (theme) => ({
  dialogContent: {
    paddingTop: theme.spacing(2),
  },

  badge: {
    top: theme.spacing(2),
    right: -theme.spacing(2),
  },

  loadingBadge: {
    top: '50%',
    right: '50%',
  },

  avatar: {
    marginRight: 'auto',
    marginLeft: 'auto',

    width: theme.spacing(14),
    height: theme.spacing(14),
  },

  nameInitials: {
    cursor: 'default',
  },

  personIcon: {
    fontSize: theme.spacing(7),
  },

  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),

    minHeight: 'initial',
  },
})

const initialState = {
  profileCompletion: 0,
  securityRating: 0,
  showingField: '',
  avatar: null,
  avatarUrl: '',
  username: '',
  emailAddress: '',
  performingAction: false,
  loadingAvatar: false,
  sentVerificationEmail: false,
  errors: null,
}

class AccountTab extends Component {
  constructor(props) {
    super(props)

    this.state = initialState
  }

  getNameInitialsOrIcon = () => {
    const { user } = this.props

    if (!user) {
      return null
    }

    const { classes, userData } = this.props

    if (!userData) {
      return <PersonIcon className={classes.personIcon} />
    }

    const nameInitials = authentication.getNameInitials({
      ...user,
      ...userData,
    })

    if (nameInitials) {
      return (
        <Typography className={classes.nameInitials} variant="h2">
          {nameInitials}
        </Typography>
      )
    }

    return <PersonIcon className={classes.personIcon} />
  }

  uploadAvatar = () => {
    const { avatar } = this.state

    if (!avatar) {
      return
    }

    this.setState(
      {
        performingAction: true,
        loadingAvatar: true,
      },
      () => {
        authentication
          .changeAvatar(avatar)
          .then((value) => {
            const { user, userData } = this.props

            this.setState({
              profileCompletion: authentication.getProfileCompletion({
                ...user,
                ...userData,
              }),
            })
          })
          .catch((reason) => {
            const code = reason.code
            const message = reason.message

            switch (code) {
              default:
                this.props.openSnackbar(message)
                return
            }
          })
          .finally(() => {
            this.setState({
              performingAction: false,
              loadingAvatar: false,
              avatar: null,
              avatarUrl: '',
            })
          })
      }
    )
  }

  showField = (fieldId) => {
    if (!fieldId) {
      return
    }

    this.setState({
      showingField: fieldId,
    })
  }

  hideFields = (callback) => {
    this.setState(
      {
        showingField: '',
        username: '',
        emailAddress: '',
        errors: null,
      },
      () => {
        if (callback && typeof callback === 'function') {
          callback()
        }
      }
    )
  }

  changeUsername = () => {
    const { username } = this.state

    const errors = validate(
      {
        username: username,
      },
      {
        username: constraints.username,
      }
    )

    if (errors) {
      this.setState({
        errors: errors,
      })

      return
    }

    this.setState(
      {
        errors: null,
      },
      () => {
        const { userData } = this.props

        if (username === userData.username) {
          return
        }

        this.setState(
          {
            performingAction: true,
          },
          () => {
            authentication
              .changeUsername(username)
              .then(() => {
                const { user, userData } = this.props

                this.setState(
                  {
                    profileCompletion: authentication.getProfileCompletion({
                      ...user,
                      ...userData,
                    }),
                  },
                  () => {
                    this.hideFields()
                  }
                )
              })
              .catch((reason) => {
                const code = reason.code
                const message = reason.message

                switch (code) {
                  default:
                    this.props.openSnackbar(message)
                    return
                }
              })
              .finally(() => {
                this.setState({
                  performingAction: false,
                })
              })
          }
        )
      }
    )
  }

  changeEmailAddress = () => {
    const { emailAddress } = this.state

    const errors = validate(
      {
        emailAddress: emailAddress,
      },
      {
        emailAddress: constraints.emailAddress,
      }
    )

    if (errors) {
      this.setState({
        errors: errors,
      })

      return
    }

    this.setState(
      {
        errors: null,
      },
      () => {
        const { user } = this.props

        if (emailAddress === user.email) {
          return
        }

        this.setState(
          {
            performingAction: true,
          },
          () => {
            authentication
              .changeEmailAddress(emailAddress)
              .then(() => {
                const { user, userData } = this.props

                this.setState(
                  {
                    profileCompletion: authentication.getProfileCompletion({
                      ...user,
                      ...userData,
                    }),
                  },
                  () => {
                    this.hideFields()
                  }
                )
              })
              .catch((reason) => {
                const code = reason.code
                const message = reason.message

                switch (code) {
                  default:
                    this.props.openSnackbar(message)
                    return
                }
              })
              .finally(() => {
                this.setState({
                  performingAction: false,
                })
              })
          }
        )
      }
    )
  }

  verifyEmailAddress = () => {
    this.setState(
      {
        performingAction: true,
      },
      () => {
        authentication
          .verifyEmailAddress()
          .then(() => {
            this.setState(
              {
                sentVerificationEmail: true,
              },
              () => {
                this.props.openSnackbar('Sent verification e-mail')
              }
            )
          })
          .catch((reason) => {
            const code = reason.code
            const message = reason.message

            switch (code) {
              default:
                this.props.openSnackbar(message)
                return
            }
          })
          .finally(() => {
            this.setState({
              performingAction: false,
            })
          })
      }
    )
  }

  changeField = (fieldId) => {
    switch (fieldId) {
      case 'username':
        this.changeUsername()
        return

      case 'email-address':
        this.changeEmailAddress()
        return

      default:
        return
    }
  }

  handleKeyDown = (event, fieldId) => {
    if (!event || !fieldId) {
      return
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }

    const key = event.key

    if (!key) {
      return
    }

    if (key === 'Escape') {
      this.hideFields()
    } else if (key === 'Enter') {
      this.changeField(fieldId)
    }
  }

  handleAvatarChange = (event) => {
    if (!event) {
      return
    }

    const files = event.target.files

    if (!files) {
      return
    }

    const avatar = files[0]

    if (!avatar) {
      return
    }

    const fileTypes = [
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ]

    if (!fileTypes.includes(avatar.type)) {
      return
    }

    if (avatar.size > 20 * 1024 * 1024) {
      return
    }

    this.setState({
      avatar: avatar,
      avatarUrl: URL.createObjectURL(avatar),
    })
  }

  handleUsernameChange = (event) => {
    if (!event) {
      return
    }

    const username = event.target.value

    this.setState({
      username: username,
    })
  }

  handleEmailAddressChange = (event) => {
    if (!event) {
      return
    }

    const emailAddress = event.target.value

    this.setState({
      emailAddress: emailAddress,
    })
  }

  render() {
    // Styling
    const { classes } = this.props

    // Properties
    const { user, userData } = this.props

    // Events
    const { onDeleteAccountClick } = this.props

    const {
      profileCompletion,
      securityRating,
      showingField,
      performingAction,
      loadingAvatar,
      avatar,
      avatarUrl,
      username,
      emailAddress,
      sentVerificationEmail,
      errors,
    } = this.state

    const hasUsername = userData && userData.username

    return (
      <DialogContent classes={{ root: classes.dialogContent }}>
        <Box mb={2}>
          <Hidden xsDown>
            <Grid alignItems="center" container>
              <Grid item xs>
                <Box textAlign="center">
                  <Box mb={1.5}>
                    {avatar && avatarUrl && (
                      <Badge classes={{ badge: classes.badge }}>
                        {loadingAvatar && (
                          <Badge
                            classes={{ badge: classes.loadingBadge }}
                            badgeContent={
                              <Fade
                                style={{ transitionDelay: '1s' }}
                                in={loadingAvatar}
                                unmountOnExit
                              >
                                <CircularProgress size={120} thickness={1.8} />
                              </Fade>
                            }
                          >
                            <Avatar
                              className={classes.avatar}
                              alt="Avatar"
                              src={avatarUrl}
                            />
                          </Badge>
                        )}

                        {!loadingAvatar && (
                          <Avatar
                            className={classes.avatar}
                            alt="Avatar"
                            src={avatarUrl}
                          />
                        )}
                      </Badge>
                    )}

                    {!avatar && !avatarUrl && (
                      <>
                        {user.photoURL && (
                          <Badge classes={{ badge: classes.badge }}>
                            {loadingAvatar && (
                              <Badge
                                classes={{ badge: classes.loadingBadge }}
                                badgeContent={
                                  <Fade
                                    style={{ transitionDelay: '1s' }}
                                    in={loadingAvatar}
                                    unmountOnExit
                                  >
                                    <CircularProgress
                                      size={120}
                                      thickness={1.8}
                                    />
                                  </Fade>
                                }
                              >
                                <Avatar
                                  className={classes.avatar}
                                  alt="Avatar"
                                  src={user.photoURL}
                                />
                              </Badge>
                            )}

                            {!loadingAvatar && (
                              <Avatar
                                className={classes.avatar}
                                alt="Avatar"
                                src={user.photoURL}
                              />
                            )}
                          </Badge>
                        )}

                        {!user.photoURL && (
                          <>
                            {loadingAvatar && (
                              <Badge
                                classes={{ badge: classes.loadingBadge }}
                                badgeContent={
                                  <Fade
                                    style={{ transitionDelay: '1s' }}
                                    in={loadingAvatar}
                                    unmountOnExit
                                  >
                                    <CircularProgress
                                      size={120}
                                      thickness={1.8}
                                    />
                                  </Fade>
                                }
                              >
                                <Avatar className={classes.avatar} alt="Avatar">
                                  {this.getNameInitialsOrIcon()}
                                </Avatar>
                              </Badge>
                            )}

                            {!loadingAvatar && (
                              <Avatar className={classes.avatar} alt="Avatar">
                                {this.getNameInitialsOrIcon()}
                              </Avatar>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Box>

                  {avatar && avatarUrl && (
                    <Button
                      disabled={performingAction}
                      startIcon={<CloudUploadIcon />}
                      variant="outlined"
                      onClick={this.uploadAvatar}
                    >
                      Upload
                    </Button>
                  )}

                  {!avatar && !avatarUrl && (
                    <>
                      <input
                        id="avatar-input"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={this.handleAvatarChange}
                      />

                      <label htmlFor="avatar-input">
                        <Button
                          component="span"
                          disabled={performingAction}
                          startIcon={<PhotoIcon />}
                          variant="outlined"
                        >
                          Choose...
                        </Button>
                      </label>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Hidden>

          <Hidden smUp>
            <Box textAlign="center" mb={3}>
              <Box mb={1.5}>
                {avatar && avatarUrl && (
                  <Badge classes={{ badge: classes.badge }}>
                    {loadingAvatar && (
                      <Badge
                        classes={{ badge: classes.loadingBadge }}
                        badgeContent={
                          <Fade
                            style={{ transitionDelay: '1s' }}
                            in={loadingAvatar}
                            unmountOnExit
                          >
                            <CircularProgress size={120} thickness={1.8} />
                          </Fade>
                        }
                      >
                        <Avatar
                          className={classes.avatar}
                          alt="Avatar"
                          src={avatarUrl}
                        />
                      </Badge>
                    )}

                    {!loadingAvatar && (
                      <Avatar
                        className={classes.avatar}
                        alt="Avatar"
                        src={avatarUrl}
                      />
                    )}
                  </Badge>
                )}

                {!avatar && !avatarUrl && (
                  <>
                    {user.photoURL && (
                      <Badge classes={{ badge: classes.badge }}>
                        {loadingAvatar && (
                          <Badge
                            classes={{ badge: classes.loadingBadge }}
                            badgeContent={
                              <CircularProgress size={120} thickness={1.8} />
                            }
                          >
                            <Avatar
                              className={classes.avatar}
                              alt="Avatar"
                              src={user.photoURL}
                            />
                          </Badge>
                        )}

                        {!loadingAvatar && (
                          <Avatar
                            className={classes.avatar}
                            alt="Avatar"
                            src={user.photoURL}
                          />
                        )}
                      </Badge>
                    )}

                    {!user.photoURL && (
                      <>
                        {loadingAvatar && (
                          <Badge
                            classes={{ badge: classes.loadingBadge }}
                            badgeContent={
                              <Fade
                                style={{ transitionDelay: '1s' }}
                                in={loadingAvatar}
                                unmountOnExit
                              >
                                <CircularProgress size={120} thickness={1.8} />
                              </Fade>
                            }
                          >
                            <Avatar className={classes.avatar} alt="Avatar">
                              {this.getNameInitialsOrIcon()}
                            </Avatar>
                          </Badge>
                        )}

                        {!loadingAvatar && (
                          <Avatar className={classes.avatar} alt="Avatar">
                            {this.getNameInitialsOrIcon()}
                          </Avatar>
                        )}
                      </>
                    )}
                  </>
                )}
              </Box>

              {avatar && avatarUrl && (
                <Button
                  disabled={performingAction}
                  startIcon={<CloudUploadIcon />}
                  variant="outlined"
                  onClick={this.uploadAvatar}
                >
                  Upload
                </Button>
              )}

              {!avatar && !avatarUrl && (
                <>
                  <input
                    id="avatar-input"
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={this.handleAvatarChange}
                  />

                  <label htmlFor="avatar-input">
                    <Button
                      component="span"
                      disabled={performingAction}
                      startIcon={<PhotoIcon />}
                      variant="outlined"
                    >
                      Choose...
                    </Button>
                  </label>
                </>
              )}
            </Box>

            <Grid container>
              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Profile Completion</Typography>

                  {profileCompletion === 0 && (
                    <Typography color="error" variant="h5">
                      {profileCompletion}%
                    </Typography>
                  )}

                  {profileCompletion === 100 && (
                    <Typography color="primary" variant="h5">
                      {profileCompletion}%
                    </Typography>
                  )}

                  {profileCompletion !== 0 && profileCompletion !== 100 && (
                    <Typography color="secondary" variant="h5">
                      {profileCompletion}%
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Security Rating</Typography>

                  {securityRating === 0 && (
                    <Typography color="error" variant="h5">
                      {securityRating}%
                    </Typography>
                  )}

                  {securityRating === 100 && (
                    <Typography color="primary" variant="h5">
                      {securityRating}%
                    </Typography>
                  )}

                  {securityRating !== 0 && securityRating !== 100 && (
                    <Typography color="secondary" variant="h5">
                      {securityRating}%
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Hidden>
        </Box>

        <List disablePadding>
          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <PersonOutlineIcon />
              </ListItemIcon>
            </Hidden>

            {!hasUsername && (
              <ListItemIcon>
                <Tooltip title="No username">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            )}

            {showingField === 'username' && (
              <TextField
                autoComplete="username"
                autoFocus
                disabled={performingAction}
                error={!!(errors && errors.username)}
                fullWidth
                helperText={
                  errors && errors.username
                    ? errors.username[0]
                    : 'Press Enter to change your username'
                }
                label="Username"
                placeholder={hasUsername && userData.username}
                required
                type="text"
                value={username}
                variant="filled"
                InputLabelProps={{ required: false }}
                onBlur={this.hideFields}
                onKeyDown={(event) => this.handleKeyDown(event, 'username')}
                onChange={this.handleUsernameChange}
              />
            )}

            {showingField !== 'username' && (
              <>
                <ListItemText
                  primary="Username"
                  secondary={
                    hasUsername
                      ? userData.username
                      : 'You don’t have a username'
                  }
                />

                <ListItemSecondaryAction>
                  {hasUsername && (
                    <Tooltip title="Change">
                      <div>
                        <IconButton
                          disabled={performingAction}
                          onClick={() => this.showField('username')}
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  )}

                  {!hasUsername && (
                    <Button
                      color="primary"
                      disabled={performingAction}
                      variant="contained"
                      onClick={() => this.showField('username')}
                    >
                      Add
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </>
            )}
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
            </Hidden>

            {user.email && (
              <ListItemIcon>
                <>
                  {user.emailVerified && (
                    <Tooltip title="Verified">
                      <CheckIcon color="primary" />
                    </Tooltip>
                  )}

                  {!user.emailVerified && (
                    <Tooltip title="Not verified">
                      <WarningIcon color="error" />
                    </Tooltip>
                  )}
                </>
              </ListItemIcon>
            )}

            {!user.email && (
              <ListItemIcon>
                <Tooltip title="No e-mail address">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            )}

            {showingField === 'email-address' && (
              <TextField
                autoComplete="email"
                autoFocus
                disabled={performingAction}
                error={!!(errors && errors.emailAddress)}
                fullWidth
                helperText={
                  errors && errors.emailAddress
                    ? errors.emailAddress[0]
                    : 'Press Enter to change your e-mail address'
                }
                label="E-mail address"
                placeholder={user.email}
                required
                type="email"
                value={emailAddress}
                variant="filled"
                InputLabelProps={{ required: false }}
                onBlur={this.hideFields}
                onKeyDown={(event) =>
                  this.handleKeyDown(event, 'email-address')
                }
                onChange={this.handleEmailAddressChange}
              />
            )}

            {showingField !== 'email-address' && (
              <>
                <ListItemText
                  primary="E-mail address"
                  secondary={
                    user.email ? user.email : 'You don’t have an e-mail address'
                  }
                />

                {user.email && !user.emailVerified && (
                  <Box clone mr={7}>
                    <ListItemSecondaryAction>
                      <Tooltip title="Verify">
                        <div>
                          <IconButton
                            color="secondary"
                            disabled={performingAction || sentVerificationEmail}
                            onClick={this.verifyEmailAddress}
                          >
                            <CheckIcon />
                          </IconButton>
                        </div>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </Box>
                )}

                <ListItemSecondaryAction>
                  {user.email && (
                    <Tooltip title="Change">
                      <div>
                        <IconButton
                          disabled={performingAction}
                          onClick={() => this.showField('email-address')}
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  )}

                  {!user.email && (
                    <Button
                      color="primary"
                      disabled={performingAction}
                      variant="contained"
                      onClick={() => this.showField('email-address')}
                    >
                      Add
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </>
            )}
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
            </Hidden>

            <Hidden xsDown>
              <ListItemText
                primary="Signed in"
                secondary={moment(user.metadata.lastSignInTime).format('LLLL')}
              />
            </Hidden>

            <Hidden smUp>
              <ListItemText
                primary="Signed in"
                secondary={moment(user.metadata.lastSignInTime).format('llll')}
              />
            </Hidden>
          </ListItem>

          <Box mt={1} mb={1}>
            <Divider light />
          </Box>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <DeleteForeverIcon />
              </ListItemIcon>
            </Hidden>

            <ListItemText
              primary="Delete account"
              secondary="Accounts can’t be recovered"
            />

            <ListItemSecondaryAction>
              <Button
                color="secondary"
                disabled={performingAction}
                variant="contained"
                onClick={onDeleteAccountClick}
              >
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
    )
  }

  componentDidMount() {
    const { user, userData } = this.props

    this.setState({
      profileCompletion: authentication.getProfileCompletion({
        ...user,
        ...userData,
      }),
      securityRating: authentication.getSecurityRating(user, userData),
    })
  }

  componentWillUnmount() {
    const { avatarUrl } = this.state

    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl)

      this.setState({
        avatarUrl: '',
      })
    }
  }
}

AccountTab.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Properties
  user: PropTypes.object.isRequired,
  userData: PropTypes.object,

  // Functions
  openSnackbar: PropTypes.func.isRequired,

  // Events
  onDeleteAccountClick: PropTypes.func.isRequired,
}

export default withStyles(styles)(AccountTab)
