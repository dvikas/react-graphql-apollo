import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const FORGOT_PASSWORD_MUTATION = gql`
  mutation FORGOT_PASSWORD_MUTATION($email: String!) {
    requestReset( email: $email) {
      message
    }
  }
`;

export default class Signin extends Component {

  state = {
    email: '',
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation
        mutation={FORGOT_PASSWORD_MUTATION}
        variables={this.state}>
        {
          (requestReset, { error, loading, called }) => {
            return (
              <Form method="post" onSubmit={
                async e => {
                  e.preventDefault();
                  const res = await requestReset();
                  this.setState({
                    email: '',
                    password: ''
                  });
                }
              }>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Forgot password</h2>
                  <Error error={error} />
                  {!error && !loading && called && <p>Please check your inbox for password reset link.</p>}
                  <label htmlFor="email">
                    Email
             <input
                      required
                      type="email"
                      name="email"
                      placeholder="email"
                      value={this.state.email}
                      onChange={this.saveToState}
                    />
                  </label>


                  <button type="submit">Submit</button>

                </fieldset>
              </Form>
            )
          }
        }
      </Mutation>
    )
  }
}
