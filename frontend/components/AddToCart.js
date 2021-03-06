import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const ADD_TO_CART = gql`
  mutation ADD_TO_CART($id: ID!){
      addToCart(id: $id) {
        id
        quantity
      }
  }
`;

export default class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation mutation={ADD_TO_CART}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={{ id }}>
        {
          (addToCart, { loading }) => (
            <button disabled={loading} onClick={addToCart}>Add{loading && 'ing'} to cart</button>
          )
        }
      </Mutation >
    )
  }
}
