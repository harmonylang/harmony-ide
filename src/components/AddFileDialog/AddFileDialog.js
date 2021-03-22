import React, { Component } from 'react'

import PropTypes from 'prop-types'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core'

import { templates } from '../App/templates'

class AddFileDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dialogText: '',
      template: '',
    }
  }

  handleChangedText = (event) => {
    this.setState({ dialogText: event.target.value })
  }

  handleChangedTemplate = (event) => {
    this.setState({ template: event.target.value })
  }

  render() {
    // Dialog Properties
    const { dialogProps } = this.props

    // Custom Properties
    const {
      newFile,
      title,
      defaultValue,
      acceptButtonText,
      handleClose,
      handleAddFile,
    } = this.props

    const { template } = this.state

    return (
      <Dialog {...dialogProps}>
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>
          {newFile && (
            <FormControl fullWidth>
              <InputLabel shrink id="template-label">
                Template
              </InputLabel>
              <Select
                labelId="template-label"
                id="template"
                value={template}
                onChange={this.handleChangedTemplate}
                displayEmpty
                autoWidth
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {templates.map((t) => (
                  <MenuItem value={t.path}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="File Name"
            type="text"
            defaultValue={defaultValue}
            onChange={this.handleChangedText}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">.hny</InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleAddFile(this.state.dialogText, this.state.template)
            }
            color="primary"
          >
            {acceptButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

AddFileDialog.propTypes = {
  // Dialog Properties
  dialogProps: PropTypes.object.isRequired,

  // Custom Properties
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddFile: PropTypes.func.isRequired,
}

export default AddFileDialog
