import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

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
      <Mutation mutation={ADD_TO_CART} variables={{ id }}>
        {
          (addToCart) => (
            <button onClick={addToCart}>Add to cart</button>
          )
        }
      </Mutation >
    )
  }
}
