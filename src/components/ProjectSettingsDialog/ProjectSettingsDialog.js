import React, { Component } from 'react'

import PropTypes from 'prop-types'

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core'

class ProjectSettingsDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      entryFile: props.project.entryFile,
      projectTitle: props.project.name,
      alwaysEntry: props.project.settings.alwaysEntry,
      compilerOptions: props.project.settings.compilerOptions,
    }
  }

  handleChangedEntryFile = (event) => {
    this.setState({ entryFile: event.target.value })
  }

  handleChangedProjectTitle = (event) => {
    this.setState({ projectTitle: event.target.value })
  }

  handleChangedCompilerOptions = (event) => {
    this.setState({ compilerOptions: event.target.value })
  }

  handleChangedAlwaysEntry = (event) => {
    this.setState({ alwaysEntry: event.target.checked })
  }

  render() {
    // Dialog Properties
    const { dialogProps } = this.props

    // Custom Properties
    const { project, handleClose, handleSave } = this.props

    return (
      <Dialog fullWidth maxWidth="xs" {...dialogProps}>
        <DialogTitle>Project Settings</DialogTitle>
        <DialogContent>
          <List disablePadding>
            <Box mb={1}>
              <ListItem>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Project Title"
                  type="text"
                  defaultValue={this.state.projectTitle}
                  onChange={this.handleChangedProjectTitle}
                  fullWidth
                />
              </ListItem>
            </Box>
            <Box mb={1}>
              <ListItem>
                <FormControl fullWidth>
                  <InputLabel shrink id="entryfile-label">
                    Entry File
                  </InputLabel>
                  <Select
                    labelId="entryfile-label"
                    id="entryfile"
                    value={this.state.entryFile}
                    onChange={this.handleChangedEntryFile}
                    displayEmpty
                    autoWidth
                  >
                    {project.files.map((t) => (
                      <MenuItem value={t.name} key={t.name}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>
            </Box>
            <Box mb={1}>
              <ListItem>
                <ListItemText
                  primary="Launch Entry File"
                  secondary="Always analyze from the entry file of this project"
                />

                <ListItemSecondaryAction>
                  <Checkbox
                    color="primary"
                    checked={this.state.alwaysEntry}
                    onChange={this.handleChangedAlwaysEntry}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </Box>
            <Box mb={1}>
              <ListItem>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Compiler Options"
                  type="text"
                  defaultValue={this.state.compilerOptions}
                  onChange={this.handleChangedCompilerOptions}
                  fullWidth
                />
              </ListItem>
            </Box>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              let p = project
              p.entryFile = this.state.entryFile
              p.name = this.state.projectTitle
              p.settings.alwaysEntry = (this.state.alwaysEntry) ? this.state.alwaysEntry : false
              p.settings.compilerOptions = (this.state.compilerOptions) ? this.state.compilerOptions : ""
              handleSave(p)
            }}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

ProjectSettingsDialog.propTypes = {
  // Dialog Properties
  dialogProps: PropTypes.object.isRequired,

  // Custom Properties
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
}

export default ProjectSettingsDialog
