import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin( email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signin extends Component {

  state = {
    email: '',
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
        mutation={SIGNIN_MUTATION}
        variables={this.state}>
        {
          (signin, { error, loading }) => {
            return (
              <Form method="post" onSubmit={
                async e => {
                  e.preventDefault();
                  const res = await signin();
                  this.setState({
                    email: '',
                    password: ''
                  });
                }
              }>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Signin for an account</h2>
                  <Error error={error} />

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

                  <button type="submit">Sign In</button>

                </fieldset>
              </Form>
            )
          }
        }
      </Mutation>
    )
  }
}
