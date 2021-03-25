import React, { Component } from 'react'

import readingTime from 'reading-time'

import { MuiThemeProvider } from '@material-ui/core/styles'

import { CssBaseline, Button, Snackbar } from '@material-ui/core'

import { auth, firestore } from '../../firebase'
import authentication from '../../services/authentication'
import appearance from '../../services/appearance'
import drive from '../../services/drive'

import ErrorBoundary from '../ErrorBoundary'
import LaunchScreen from '../LaunchScreen'
import Bar from '../Bar'
import Router from '../Router'
import DialogHost from '../DialogHost'

import JSZip from 'jszip'
import axios from 'axios'
import * as FormData from 'form-data'

import parseCharmony from '../HarmonyPanel/charmony/CharmonyData'
const HARMONY_SERVER_API =
  'http://ec2-3-142-239-249.us-east-2.compute.amazonaws.com:8080/'

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
    title: '',
    defaultValue: '',
    acceptButtonText: '',
    acceptFunction: () => {},
    newFile: true,
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

    const getQueryVariable = (variable) => {
      var query = window.location.search.substring(1)
      var vars = query.split('&')
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (pair[0] == variable) {
          return pair[1]
        }
      }
      return false
    }
    let templateRequest = getQueryVariable('template')
    if (
      templateRequest.length > 0 &&
      this.state.currentProject.activeFile === null
    ) {
      this.addTemplateFile(`${templateRequest}.hny`, `/${templateRequest}.hny`)
    }
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

  addTemplateFile = (fileName, template) => {
    var currentProject = this.state.currentProject
    const app = this
    try {
      axios
        .get(process.env.REACT_APP_HOMEPAGE + '/code' + template, {
          validateStatus() {
            return true
          },
        })
        .then((response) => {
          if (200 <= response.status && response.status < 300) {
            const data = response.data
            currentProject.files.push({
              name: fileName,
              text: data,
              hasChanges: true,
            })
            currentProject.activeFile = fileName
            this.setState({
              currentProject: currentProject,
            })
            this.closeDialog('addFileDialog')
          }
        })
        .catch((e) => {
          //backup: hosting from IDE;
          fetch(`${process.env.PUBLIC_URL}/templates/${template}`)
            .then((t) => t.text())
            .then((text) => {
              currentProject.files.push({
                name: fileName,
                text,
                hasChanges: true,
              })
              currentProject.activeFile = fileName
              this.setState({
                currentProject: currentProject,
              })
              this.closeDialog('addFileDialog')
            })
            .catch(() => {
              app.openSnackbar(e.toString())
              app.updateMessage(e.toString())
            })
        })
    } catch (err) {
      console.log(err)
    }
  }

  addFileToProject = (fileName, template) => {
    var currentProject = this.state.currentProject
    const app = this
    if (currentProject.files.findIndex((e) => e.name === fileName) !== -1) {
      app.openSnackbar(
        'Another file with the same name already exists in this project'
      )
      return
    }
    if (template === '') {
      currentProject.files.push({ name: fileName, text: '', hasChanges: true })
      currentProject.activeFile = fileName
      this.setState({
        currentProject: currentProject,
      })
      this.closeDialog('addFileDialog')
    } else {
      this.addTemplateFile(fileName, template)
    }
  }

  renameFileInProject = (fileName, newFileName) => {
    var currentProject = this.state.currentProject
    const app = this
    if (currentProject.files.findIndex((e) => e.name === newFileName) !== -1) {
      app.openSnackbar(
        'Another file with the same name already exists in this project'
      )
      return
    }
    currentProject.files.forEach((element) => {
      if (element.name === fileName) {
        element.name = newFileName
        element.hasChanges = true
      }
    })
    if (currentProject.activeFile === fileName)
      currentProject.activeFile = newFileName
    if (currentProject.entryFile === fileName)
      currentProject.entryFile = newFileName
    this.setState({
      currentProject: currentProject,
      addFileDialog: { open: false },
    })
  }

  removeFileFromProject = (fileName) => {
    var currentProject = this.state.currentProject
    currentProject.files = currentProject.files.filter((f) => {
      return f.name !== fileName
    })
    if (currentProject.activeFile === fileName)
      currentProject.activeFile = currentProject.files[0].name
    if (currentProject.entryFile === fileName)
      currentProject.entryFile = currentProject.files[0].name
    this.setState({
      currentProject: currentProject,
    })
  }

  setFileAsActive = (fileName) => {
    var currentProject = this.state.currentProject
    currentProject.activeFile = fileName
    this.setState({
      currentProject: currentProject,
    })
  }

  updateEditorValue = (value, event) => {
    var currentProject = this.state.currentProject
    currentProject.files.forEach((element) => {
      if (element.name === currentProject.activeFile) {
        element.text = value
        element.hasChanges = true
      }
    })
    this.setState({ currentProject: currentProject })
  }

  saveCurrentProject = () => {
    if (this.state.user) {
      var currentProject = this.state.currentProject
      currentProject.files.forEach((element) => {
        element.hasChanges = false
      })
      drive.updateProject(currentProject)
      this.setState({ currentProject: currentProject })
    } else {
      this.setState({ signUpDialog: { open: true } })
    }
  }

  saveProjectFile = (fileIndex) => {
    if (this.state.user) {
      var currentProject = this.state.currentProject
      currentProject.files[fileIndex].hasChanges = false
      drive.updateProjectFile(currentProject, fileIndex)
      this.setState({ currentProject: currentProject })
    } else {
      this.setState({ signUpDialog: { open: true } })
    }
  }

  startLoading = () => {
    if (this.state.harmonyPanel.width !== 0) {
      this.harmonyPanelRef.current.contentWindow.location.reload()
    }
    setTimeout(() => {
      this.harmonyPanelRef.current.contentWindow.postMessage({
        command: 'start',
        jsonData: null,
      })
    }, 100)
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
    isOpen = this.state.harmonyPanel.width !== 0
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
      formData.append('version', process.env.REACT_APP_VERSION)
      formData.append('source', 'web-ide')
      try {
        axios
          .post(HARMONY_SERVER_API + 'check', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            validateStatus() {
              return true
            },
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

  openAddFileDialog = () => {
    this.setState({
      addFileDialog: {
        title: 'Add file to project',
        defaultValue: '',
        acceptButtonText: 'Add',
        acceptFunction: (newFile, template) =>
          this.addFileToProject(
            newFile.endsWith('.hny') ? newFile : `${newFile}.hny`,
            template
          ),
        newFile: true,
        open: true,
      },
    })
  }

  openRenameFileDialog = (oldFile) => {
    this.setState({
      addFileDialog: {
        title: `Rename ${oldFile}`,
        defaultValue: oldFile.substring(0, oldFile.lastIndexOf('.')),
        acceptButtonText: 'Rename',
        acceptFunction: (newFile) =>
          this.renameFileInProject(
            oldFile,
            newFile.endsWith('.hny') ? newFile : `${newFile}.hny`
          ),
        newFile: false,
        open: true,
      },
    })
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
                addFileRequest={this.openAddFileDialog}
                renameFileRequest={this.openRenameFileDialog}
                deleteFileRequest={this.removeFileFromProject}
                setFileActive={this.setFileAsActive}
                saveProjectFile={this.saveProjectFile}
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
                    newFile: addFileDialog.newFile,
                    title: addFileDialog.title,
                    defaultValue: addFileDialog.defaultValue,
                    acceptButtonText: addFileDialog.acceptButtonText,
                    handleClose: () => this.closeDialog('addFileDialog'),
                    handleAddFile: addFileDialog.acceptFunction,
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
