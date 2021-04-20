import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom'

import AdminPage from '../AdminPage'
import UserPage from '../UserPage'
import NotFoundPage from '../NotFoundPage'

class Router extends Component {
  render() {
    // Properties
    const { user, roles, bar, projectPage } = this.props

    return (
      <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
        {bar}

        <Switch>
          <Route path="/" exact>
            {projectPage}
          </Route>

          <Route path="/admin">
            {user && roles.includes('admin') ? (
              <AdminPage />
            ) : (
              <Redirect to="/" />
            )}
          </Route>

          <Route path="/user/:userId">
            {user ? <UserPage /> : <Redirect to="/" />}
          </Route>

          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </BrowserRouter>
    )
  }
}

Router.propTypes = {
  // Properties
  user: PropTypes.object,
  roles: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  bar: PropTypes.element,

  // Functions
  openSnackbar: PropTypes.func.isRequired,
}

export default Router
