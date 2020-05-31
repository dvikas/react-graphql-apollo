import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signup extends Component {

  state = {
    email: '',
    name: '',
    password: ''
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {
          (signup, { error, loading }) => {
            return (
              <Form method="post" onSubmit={
                async e => {
                  e.preventDefault();
                  const res = await signup();
                  this.setState({
                    email: '',
                    name: '',
                    password: ''
                  });
                }
              }>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Signup for an account</h2>
                  <Error error={error} />
                  <label htmlFor="name">
                    Name
             <input
                      required
                      type="text"
                      name="name"
                      placeholder="name"
                      value={this.state.name}
                      onChange={this.saveToState}
                    />
                  </label>

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
