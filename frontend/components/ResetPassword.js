import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User'

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      name
      email
    }
  }
`;

export default class ResetPassword extends Component {

  state = {
    resetToken: this.props.token,
    confirmPassword: '',
    password: ''
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation
        refetchQueries={[{
          query: CURRENT_USER_QUERY
        }]}
        mutation={RESET_PASSWORD_MUTATION}
        variables={this.state}>
        {
          (resetPassword, { error, loading }) => {
            return (
              <Form method="post" onSubmit={
                async e => {
                  e.preventDefault();
                  const res = await resetPassword();
                  console.log(res);
                  this.setState({
                    password: '',
                    confirmPassword: ''
                  });
                }
              }>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Reset password</h2>
                  <Error error={error} />

                  <label htmlFor="password">
                    Password
             <input
                      required
                      type="password"
                      name="password"
                      placeholder="password"
                      value={this.state.password}
                      onChange={this.saveToState}
                    />
                  </label>

                  <label htmlFor="password">
                    Confirm Password
             <input
                      required
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={this.state.confirmPassword}
                      onChange={this.saveToState}
                    />
                  </label>

                  <button type="submit">Register</button>

                </fieldset>
              </Form>
            )
          }
        }
      </Mutation>
    )
  }
}
