import React, { Component } from 'react'

import readingTime from 'reading-time'

import { MuiThemeProvider } from '@material-ui/core/styles'

import { CssBaseline, Button, Snackbar, AppBar } from '@material-ui/core'

import { auth, firestore } from '../../firebase'
import authentication from '../../services/authentication'
import appearance from '../../services/appearance'
import drive from '../../services/drive'

import ErrorBoundary from '../ErrorBoundary'
import LaunchScreen from '../LaunchScreen'
import Bar from '../Bar'
import Router from '../Router'
import DialogHost from '../DialogHost'

import JSZip, { files } from 'jszip'
import axios from 'axios'
import * as FormData from 'form-data'

import parseCharmony from '../HarmonyPanel/charmony/CharmonyData'
const HARMONY_SERVER_API = 'https://harmonylang.herokuapp.com/'

const initialState = {
  ready: false,
  performingAction: false,
  theme: appearance.defaultTheme,
  user: null,
  userData: null,
  currentProject: drive.currentProject,
  editorValue: '',
  analysisValue: {},
  roles: [],

  aboutDialog: {
    open: false,
  },

  signUpDialog: {
    open: false,
  },

  signInDialog: {
    open: false,
  },

  addFileDialog: {
    open: false,
  },

  settingsDialog: {
    open: false,
  },

  deleteAccountDialog: {
    open: false,
  },

  signOutDialog: {
    open: false,
  },

  harmonyPanel: {
    width: 0, // Default Drawer Width
    savedWidth: 900,
  },

  snackbar: {
    autoHideDuration: 0,
    message: '',
    open: false,
  },
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = initialState
    this.harmonyPanelRef = React.createRef()
  }

  resetState = (callback) => {
    this.setState(
      {
        ready: true,
        theme: appearance.defaultTheme,
        user: null,
        userData: null,
        roles: [],
      },
      callback
    )
  }

  openSnackbar = (message, autoHideDuration = 2, callback) => {
    this.setState(
      {
        snackbar: {
          autoHideDuration: readingTime(message).time * autoHideDuration,
          message,
          open: true,
        },
      },
      () => {
        if (callback && typeof callback === 'function') {
          callback()
        }
      }
    )
  }

  closeSnackbar = (clearMessage = false) => {
    const { snackbar } = this.state

    this.setState({
      snackbar: {
        message: clearMessage ? '' : snackbar.message,
        open: false,
      },
    })
  }

  addFileToProject = (fileName) => {
    var currentProject = this.state.currentProject
    currentProject.files.push({ name: fileName, value: '' })
    this.setState({
      currentProject: currentProject,
      addFileDialog: { open: false },
    })
  }

  setFileAsActive = (fileName) => {
    var currentProject = this.state.currentProject
    currentProject.activeFile = fileName
    this.setState({
      currentProject: currentProject,
      addFileDialog: { open: false },
    })
  }

  updateEditorValue = (value, event) => {
    var currentProject = this.state.currentProject
    currentProject.files.forEach((element) => {
      if (element.name === currentProject.activeFile) {
        element.text = value
      }
    })
    this.setState({ currentProject: currentProject })
  }

  saveCurrentProject = () => {
    drive.updateProject(this.state.currentProject)
  }

  startLoading = () => {
    this.harmonyPanelRef.current.contentWindow.postMessage({
      command: 'start',
      jsonData: null,
    })
  }

  updateMessage = (message) => {
    this.harmonyPanelRef.current.contentWindow.postMessage({
      command: 'message',
      jsonData: message,
    })
  }

  loadData = (data) => {
    const harmonyJsonData = parseCharmony(data)
    this.harmonyPanelRef.current.contentWindow.postMessage({
      command: 'load',
      jsonData: harmonyJsonData,
    })
  }

  setHarmonyPanelWidth = (
    width,
    isOpen = this.state.harmonyPanel.width != 0
  ) => {
    this.setState({
      harmonyPanel: { width: isOpen ? width : 0, savedWidth: width },
    })
  }

  runHarmonyAnalysis = () => {
    var zip = new JSZip()
    var currentProject = this.state.currentProject
    currentProject.files.forEach((element) => {
      zip.file(element.name, element.text)
    })
    const app = this
    app.startLoading()
    app.setHarmonyPanelWidth(this.state.harmonyPanel.savedWidth, true)
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      const formData = new FormData()
      formData.append('file', blob, 'files.zip')
      formData.append('main', `["${currentProject.activeFile}"]`)
      formData.append('version', '1.0.0')
      formData.append('source', 'web-ide')
      try {
        axios
          .post(HARMONY_SERVER_API + 'check', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then((response) => {
            if (200 <= response.status && response.status < 300) {
              const data = response.data
              if (data.status === 'FAILURE') {
                const json = data.jsonData
                app.loadData(json)
                return
              }
              app.openSnackbar(data.message)
              app.updateMessage(data.message)
            } else {
              app.openSnackbar(response.data)
            }
          })
          .catch((e) => {
            app.openSnackbar(e.toString())
            app.updateMessage(e.toString())
          })
      } catch (err) {
        console.log(err)
      }
    })
  }

  setTheme = (theme, callback) => {
    if (!theme) {
      this.setState(
        {
          theme: appearance.defaultTheme,
        },
        callback
      )

      return
    }

    this.setState(
      {
        theme: appearance.createTheme(theme),
      },
      callback
    )
  }

  openDialog = (dialogId, callback) => {
    const dialog = this.state[dialogId]

    if (!dialog || dialog.open === undefined || null) {
      return
    }

    dialog.open = true

    this.setState({ dialog }, callback)
  }

  closeDialog = (dialogId, callback) => {
    const dialog = this.state[dialogId]

    if (!dialog || dialog.open === undefined || null) {
      return
    }

    dialog.open = false

    this.setState({ dialog }, callback)
  }

  closeAllDialogs = (callback) => {
    this.setState(
      {
        aboutDialog: {
          open: false,
        },

        addFileDialog: {
          open: false,
        },

        signUpDialog: {
          open: false,
        },

        signInDialog: {
          open: false,
        },

        settingsDialog: {
          open: false,
        },

        deleteAccountDialog: {
          open: false,
        },

        signOutDialog: {
          open: false,
        },
      },
      callback
    )
  }

  deleteAccount = () => {
    this.setState(
      {
        performingAction: true,
      },
      () => {
        authentication
          .deleteAccount()
          .then(() => {
            this.closeAllDialogs(() => {
              this.openSnackbar('Deleted account')
            })
          })
          .catch((reason) => {
            const code = reason.code
            const message = reason.message

            switch (code) {
              default:
                this.openSnackbar(message)
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

  signOut = () => {
    this.setState(
      {
        performingAction: true,
      },
      () => {
        authentication
          .signOut()
          .then(() => {
            this.closeAllDialogs(() => {
              this.openSnackbar('Signed out')
            })
          })
          .catch((reason) => {
            const code = reason.code
            const message = reason.message

            switch (code) {
              default:
                this.openSnackbar(message)
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

  render() {
    const {
      ready,
      performingAction,
      theme,
      user,
      userData,
      roles,
      currentProject,
    } = this.state

    const {
      aboutDialog,
      addFileDialog,
      signUpDialog,
      signInDialog,
      settingsDialog,
      deleteAccountDialog,
      signOutDialog,
    } = this.state

    const { snackbar } = this.state

    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />

        <ErrorBoundary>
          {!ready && <LaunchScreen />}

          {ready && (
            <>
              <Router
                user={user}
                roles={roles}
                theme={theme}
                project={currentProject}
                addFileRequest={() => this.openDialog('addFileDialog')}
                setFileActive={this.setFileAsActive}
                handleEditorChange={this.updateEditorValue}
                harmonyPanelRef={this.harmonyPanelRef}
                setHarmonyPanelWidth={this.setHarmonyPanelWidth}
                harmonyPanelState={this.state.harmonyPanel}
                bar={
                  <Bar
                    performingAction={performingAction}
                    theme={theme}
                    user={user}
                    userData={userData}
                    roles={roles}
                    onRunHarmony={this.runHarmonyAnalysis}
                    onSaveProject={this.saveCurrentProject}
                    onSignUpClick={() => this.openDialog('signUpDialog')}
                    onSignInClick={() => this.openDialog('signInDialog')}
                    onAboutClick={() => this.openDialog('aboutDialog')}
                    onSettingsClick={() => this.openDialog('settingsDialog')}
                    onSignOutClick={() => this.openDialog('signOutDialog')}
                  />
                }
                openSnackbar={this.openSnackbar}
              />

              <DialogHost
                performingAction={performingAction}
                theme={theme}
                user={user}
                userData={userData}
                openSnackbar={this.openSnackbar}
                dialogs={{
                  aboutDialog: {
                    dialogProps: {
                      open: aboutDialog.open,

                      onClose: () => this.closeDialog('aboutDialog'),
                    },
                  },

                  addFileDialog: {
                    dialogProps: {
                      open: addFileDialog.open,
                      onClose: () => this.closeDialog('addFileDialog'),
                    },
                    handleClose: () => this.closeDialog('addFileDialog'),
                    handleAddFile: this.addFileToProject,
                  },

                  signUpDialog: {
                    dialogProps: {
                      open: signUpDialog.open,

                      onClose: (callback) => {
                        this.closeDialog('signUpDialog')

                        if (callback && typeof callback === 'function') {
                          callback()
                        }
                      },
                    },
                  },

                  signInDialog: {
                    dialogProps: {
                      open: signInDialog.open,

                      onClose: (callback) => {
                        this.closeDialog('signInDialog')

                        if (callback && typeof callback === 'function') {
                          callback()
                        }
                      },
                    },
                  },

                  settingsDialog: {
                    dialogProps: {
                      open: settingsDialog.open,

                      onClose: () => this.closeDialog('settingsDialog'),
                    },

                    props: {
                      onDeleteAccountClick: () =>
                        this.openDialog('deleteAccountDialog'),
                    },
                  },

                  deleteAccountDialog: {
                    dialogProps: {
                      open: deleteAccountDialog.open,

                      onClose: () => this.closeDialog('deleteAccountDialog'),
                    },

                    props: {
                      deleteAccount: this.deleteAccount,
                    },
                  },

                  signOutDialog: {
                    dialogProps: {
                      open: signOutDialog.open,

                      onClose: () => this.closeDialog('signOutDialog'),
                    },

                    props: {
                      title: 'Sign out?',
                      contentText:
                        'While signed out you are unable to manage your profile and conduct other activities that require you to be signed in.',
                      dismissiveAction: (
                        <Button
                          color="primary"
                          onClick={() => this.closeDialog('signOutDialog')}
                        >
                          Cancel
                        </Button>
                      ),
                      confirmingAction: (
                        <Button
                          color="primary"
                          disabled={performingAction}
                          variant="contained"
                          onClick={this.signOut}
                        >
                          Sign Out
                        </Button>
                      ),
                    },
                  },
                }}
              />

              <Snackbar
                autoHideDuration={snackbar.autoHideDuration}
                message={snackbar.message}
                open={snackbar.open}
                onClose={this.closeSnackbar}
              />
            </>
          )}
        </ErrorBoundary>
      </MuiThemeProvider>
    )
  }

  componentDidMount() {
    this.onAuthStateChangedObserver = auth.onAuthStateChanged(
      (user) => {
        // The user is not signed in or doesn’t have a user ID.
        if (!user || !user.uid) {
          if (this.userDocumentSnapshotListener) {
            this.userDocumentSnapshotListener()
          }

          this.resetState()

          return
        }

        // The user is signed in, begin retrieval of external user data.
        this.userDocumentSnapshotListener = firestore
          .collection('users')
          .doc(user.uid)
          .onSnapshot(
            (snapshot) => {
              const data = snapshot.data()

              // The user doesn’t have a data point, equivalent to not signed in.
              if (!snapshot.exists || !data) {
                return
              }

              authentication
                .getRoles()
                .then((value) => {
                  this.setTheme(data.theme, () => {
                    this.setState({
                      user: user,
                      userData: data,
                      roles: value || [],
                    })
                  })

                  if (!data.lastActiveProject) {
                    var newProject = drive.createProject()
                    drive.updateProject(newProject)
                    this.setState({ currentProject: newProject, ready: true })
                  } else {
                    drive
                      .retrieveProject(data.lastActiveProject)
                      .then((currentProject) => {
                        this.setState({
                          currentProject: currentProject,
                          ready: true,
                        })
                      })
                  }
                })
                .catch((reason) => {
                  this.resetState(() => {
                    const code = reason.code
                    const message = reason.message

                    switch (code) {
                      default:
                        this.openSnackbar(message)
                        return
                    }
                  })
                })
            },
            (error) => {
              this.resetState(() => {
                const code = error.code
                const message = error.message

                switch (code) {
                  default:
                    this.openSnackbar(message)
                    return
                }
              })
            }
          )
      },
      (error) => {
        this.resetState(() => {
          const code = error.code
          const message = error.message

          switch (code) {
            default:
              this.openSnackbar(message)
              return
          }
        })
      }
    )
  }

  componentWillUnmount() {
    if (this.onAuthStateChangedObserver) {
      this.onAuthStateChangedObserver()
    }

    if (this.userDocumentSnapshotListener) {
      this.userDocumentSnapshotListener()
    }
  }
}

export default App
