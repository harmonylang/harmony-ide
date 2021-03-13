import React, { Component } from "react";

import PropTypes from "prop-types";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  InputAdornment,
  Button,
  TextField
} from "@material-ui/core";

class AddFileDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { dialogText: "" }
  }

  handleChangedText = (event) => {
    this.setState({ dialogText: event.target.value })
  }

  render() {
    // Dialog Properties
    const { dialogProps } = this.props;

    // Custom Properties
    const { title, handleClose, handleAddFile } = this.props;

    return (
      <Dialog {...dialogProps}>
        {title && <DialogTitle>{title}</DialogTitle>}

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="File Name"
            type="text"
            onChange={this.handleChangedText}
            fullWidth
            endAdornment={<InputAdornment position="end">.hny</InputAdornment>}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleAddFile(this.state.dialogText)} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddFileDialog.propTypes = {
  // Dialog Properties
  dialogProps: PropTypes.object.isRequired,

  // Custom Properties
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddFile: PropTypes.func.isRequired,
};

export default AddFileDialog;
