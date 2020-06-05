import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Table from '../styles/Table';
import PropTypes from 'prop-types';

const USER_PERMISSIONS = gql`
  query USER_PERMISSIONS {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSION = gql`
  mutation UPDATE_PERMISSION($permissions: [Permission], $userId: ID!) {
    updatePermission(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;


const POSSIBLE_PERMISSIONS = [
  'ADMIN',
  'USER',
  'ITEM_CREATE',
  'ITEM_UPDATE',
  'ITEM_DELETE',
  'PERMISSION_UPDATE'
]

const Permissions = props => (
  <Query query={USER_PERMISSIONS}>
    {
      ({ data, error, loading }) => {
        if (loading) return <p>Loading...</p>
        if (error) return <Error error={error}></Error>
        return (
          <div>
            Manage Permissions
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {POSSIBLE_PERMISSIONS.map(permission =>
                    <th key={permission}>{permission}</th>)}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <Query query={USER_PERMISSIONS}>
                  {
                    ({ data, loading, error }) => {
                      console.log(data);
                      // return <p>Hello</p>
                      return data.users.map(user => <UserPermissions key={user.id} user={user} />)
                    }
                  }
                </Query>
              </tbody>
            </Table>
          </div>
        )
      }
    }
  </Query>
)

class UserPermissions extends React.Component {
  static dataTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = (e, submitPermission) => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(permission => permission != checkbox.value)
    }
    this.setState({
      permissions: updatedPermissions
    })
    // console.log(submitPermission)
    setTimeout(() => { submitPermission() }, 200);
  }

  render() {
    const user = this.props.user;

    return (
      <Mutation mutation={UPDATE_PERMISSION} variables={{
        permissions: this.state.permissions,
        userId: user.id,
      }}>
        {
          (submitPermission, { loading, error }) => (

            <tr >
              <td>{user.name}</td>
              <td>{user.email}</td>
              {
                POSSIBLE_PERMISSIONS.map(permission => (
                  <td key={permission}>
                    <label htmlFor="{user.id}_PERMS_CHECK"></label>
                    <input id="{user.id}_PERMS_CHECK"
                      value={permission}
                      onChange={(e) => this.handlePermissionChange(e, submitPermission)}
                      checked={this.state.permissions.includes(permission)}
                      type="checkbox" />
                  </td>
                ))
              }
              <td><button onClick={submitPermission}>Updat{loading ? 'ing..' : 'e'}</button></td>
            </tr>
          )
        }
      </Mutation>
    )
  }

}

export default Permissions;