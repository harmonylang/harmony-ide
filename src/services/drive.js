import { auth, firestore } from '../firebase'
import _ from 'lodash'

const drive = {}

drive.projects = []

drive.currentProject = {
  uid: '',
  name: 'Anonymous Project',
  entryFile: null,
  activeFile: null,
  settings: {},
  files: [],
}

drive.createProject = () => {
  var lut = []
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16)
  }
  function e7() {
    var d0 = (Math.random() * 0xffffffff) | 0
    var d1 = (Math.random() * 0xffffffff) | 0
    var d2 = (Math.random() * 0xffffffff) | 0
    var d3 = (Math.random() * 0xffffffff) | 0
    /* eslint-disable no-mixed-operators */
    return (
      lut[d0 & 0xff] +
      lut[(d0 >> 8) & 0xff] +
      lut[(d0 >> 16) & 0xff] +
      lut[(d0 >> 24) & 0xff] +
      '-' +
      lut[d1 & 0xff] +
      lut[(d1 >> 8) & 0xff] +
      '-' +
      lut[((d1 >> 16) & 0x0f) | 0x40] +
      lut[(d1 >> 24) & 0xff] +
      '-' +
      lut[(d2 & 0x3f) | 0x80] +
      lut[(d2 >> 8) & 0xff] +
      '-' +
      lut[(d2 >> 16) & 0xff] +
      lut[(d2 >> 24) & 0xff] +
      lut[d3 & 0xff] +
      lut[(d3 >> 8) & 0xff] +
      lut[(d3 >> 16) & 0xff] +
      lut[(d3 >> 24) & 0xff]
    )
    /* eslint-enable no-mixed-operators */
  }

  var project = {
    uid: e7(),
    name: 'Untitled Project',
    entryFile: 'main.hny',
    activeFile: 'main.hny',
    settings: {},
    files: [{ name: 'main.hny', text: '', hasChanges: false }],
  }

  return project
}

drive.getProjectList = () => {
  return new Promise((resolve, reject) => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      reject(new Error('No current user'))

      return
    }

    const uid = currentUser.uid

    if (!uid) {
      reject(new Error('No UID'))

      return
    }

    const userReference = firestore.collection('users').doc(uid)
    const userProjectsReference = userReference.collection('projects')

    userProjectsReference
      .get()
      .then((value) => {
        resolve(value)
      })
      .catch((reason) => {
        reject(reason)
      })
  })
}

drive.updateProject = (project) => {
  return new Promise((resolve, reject) => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      reject(new Error('No current user'))

      return
    }

    const uid = currentUser.uid

    if (!uid) {
      reject(new Error('No UID'))

      return
    }

    const userReference = firestore.collection('users').doc(uid)
    const userProjectsReference = userReference.collection('projects')
    const userDocumentReference = userProjectsReference.doc(project.uid)

    drive.currentProject = project

    userDocumentReference
      .set(project)
      .then((value) => {
        userReference.update({
          lastActiveProject: project.uid,
        })

        resolve(value)
      })
      .catch((reason) => {
        reject(reason)
      })
  })
}

drive.updateProjectFile = (project, fileIndex) => {
  return new Promise((resolve, reject) => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      reject(new Error('No current user'))

      return
    }

    const uid = currentUser.uid

    if (!uid) {
      reject(new Error('No UID'))

      return
    }

    const userReference = firestore.collection('users').doc(uid)
    const userProjectsReference = userReference.collection('projects')
    const userDocumentReference = userProjectsReference.doc(project.uid)

    if (fileIndex >= drive.currentProject.files.length)
      drive.currentProject.files.push(project.files[fileIndex])
    else drive.currentProject.files[fileIndex] = project.files[fileIndex]
    drive.currentProject.activeFile = project.files[fileIndex].name

    userDocumentReference
      .set(drive.currentProject)
      .then((value) => {
        userReference.update({
          lastActiveProject: project.uid,
        })

        resolve(value)
      })
      .catch((reason) => {
        reject(reason)
      })
  })
}

drive.retrieveProject = (projectId) => {
  return new Promise((resolve, reject) => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      reject(new Error('No current user'))

      return
    }

    const uid = currentUser.uid

    if (!uid) {
      reject(new Error('No UID'))

      return
    }

    const userReference = firestore.collection('users').doc(uid)
    const userProjectsReference = userReference.collection('projects')
    const userDocumentReference = userProjectsReference.doc(projectId)

    userDocumentReference
      .get()
      .then((value) => {
        if (value.exists) {
          var project = value.data()
          drive.currentProject = project

          userReference.update({
            lastActiveProject: project.uid,
          })

          resolve(_.cloneDeep(project))
        } else {
          reject(new Error(`No project named ${projectId}`))

          return
        }
      })
      .catch((reason) => {
        reject(reason)
      })
  })
}

export default drive
