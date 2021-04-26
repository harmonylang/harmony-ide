import React, { useState, useEffect } from 'react'

import { useParams, useHistory, Link } from 'react-router-dom'

import { 
  Grid, 
  GridList, 
  Fab, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'

import { format } from 'timeago.js';

import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons'

import { firestore } from '../../firebase'

import EmptyState from '../EmptyState'

import Loader from '../Loader'
import UserCard from '../UserCard'

import { ReactComponent as ErrorIllustration } from '../../illustrations/error.svg'
import { ReactComponent as NoDataIllustration } from '../../illustrations/no-data.svg'

const useStyles = makeStyles({
  grid: {
    padding: "0.5em",
    width: '100%',
  },
  card: {
    margin: "1em"
  },
  projectButton: {
    padding: '0.2em',
    marginTop: '0em',
    marginLeft: '0em',
    float: 'right',
  },
  fab: {
    position: 'fixed',
    bottom: '1.5em',
    right: '1.5em',
    float: "right | bottom"
  }
})

function UserPage(props) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(null)
  const [deleteSelection, setDeleteSelection] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { userId } = useParams()
  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    return firestore
      .collection('users')
      .doc(userId)
      .onSnapshot(
        (snapshot) => {
          setLoading(false)
          setUser(snapshot.data())
          var projectsList = []
          props.drive
            .getProjectList()
            .then((projectsSnapshot) => {
              projectsSnapshot.forEach((p) => {
                projectsList.push(p.data());
              })
              setProjects(projectsList)
            })
        },
        (error) => {
          setLoading(false)
          setError(error)
        }
      )
  }, [userId])

  if (error) {
    return (
      <EmptyState
        image={<ErrorIllustration />}
        title="Couldn’t retrieve user."
        description="Something went wrong when trying to retrieve the requested user."
        button={
          <Fab
            variant="extended"
            color="primary"
            onClick={() => window.location.reload()}
          >
            <Box clone mr={1}>
              <RefreshIcon />
            </Box>
            Retry
          </Fab>
        }
      />
    )
  }

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return (
      <EmptyState
        image={<NoDataIllustration />}
        title="User doesn’t exist."
        description="The requested user doesn’t exist."
        button={
          <Fab variant="extended" color="primary" component={Link} to="/">
            <Box clone mr={1}>
              <HomeIcon />
            </Box>
            Home
          </Fab>
        }
      />
    )
  }

  const hasProfile = user.firstName && user.lastName && user.username

  if (hasProfile) {
    return (
      <Grid className={classes.grid} container justify="center" spacing={5}>
        <Grid item xs={4}>
          <UserCard user={user} />
        </Grid>
      </Grid>
    )
  }

  const deleteProject = (project) => {
    if (user) {
      var projectRemoved = projects.filter(function(value, index, arr){ 
        return value.uid != project.uid;
      });
      props.drive.deleteProject(project.uid, ((projectRemoved.length > 0) ? projectRemoved[0].uid : ""))
      
      setProjects(projectRemoved)
    }
  }

  return (
    <Box mt={8}>
      <GridList className={classes.grid} cols={4} cellHeight={160}>
        {projects && projects.map((project) => (
          <Card className={classes.card} key={project.uid}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {format(project.lastUpdated)}
              </Typography>
              <Typography variant="h5" component="h2">
                {project.name}
              </Typography>
              <Typography color="textSecondary">
                {project.files.length} {(project.files.length === 1) ? "file" : "files"}
              </Typography>
            </CardContent>
            <CardActions style={{ float: "right" }}>
              <IconButton
                className={classes.projectButton}
                onClick={() => {
                  history.push(`/project/${project.uid}`)
                  history.go(0)
                }}
              >
                <PlayIcon fontSize="small" />
              </IconButton>
              <IconButton
                className={classes.projectButton}
                onClick={() => props.downloadProject(project)}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
              <IconButton
                className={classes.projectButton}
                onClick={() => {
                  setDeleteSelection(project)
                  setOpenDeleteDialog(true)
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </GridList>
      <Fab className={classes.fab} color="primary" aria-label="add" onClick={() => {
        var newProject = props.drive.createProject()
        props.drive.updateProject(newProject).then(() => {
          history.push(`/project/${newProject.uid}`)
          history.go(0)
        })
      }}>
        <AddIcon />
      </Fab>
      {deleteSelection && (
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{`Delete ${deleteSelection.name}?`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this project?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
                deleteProject(deleteSelection)
                setOpenDeleteDialog(false)
              }} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
    
  )
}

export default UserPage
