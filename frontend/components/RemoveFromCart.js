import React from 'react';
import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART = gql`
  mutation REMOVE_FROM_CART($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  border: 0;
  background: none;
  &:hover{
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }
  update = (cache, payload) => {
    console.log('Remove Item from Cart UPDATE CACHE');
    // 1. Read CACHE
    const data = cache.readQuery({
      query: CURRENT_USER_QUERY
    });
    // 2. Remove that item from CArt
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
    // 3. write it back to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }

  render() {
    return <Mutation mutation={REMOVE_FROM_CART}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      update={this.update}
      optimisticResponse={{
        __typename: 'Mutation',
        removeFromCart: {
          __typename: 'CartItem',
          id: this.props.id
        }
      }}
      variables={{ id: this.props.id }}>
      {
        (removeFromCart, { loading, error }) => (
          <BigButton title="Delete Item" onClick={removeFromCart}>&times;</BigButton >
        )}
    </Mutation>
  }
}

export default RemoveFromCart;