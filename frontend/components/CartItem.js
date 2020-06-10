import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';


const CartItemStyle = styled.li`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3, p{
    margin: 0;
  }
`;

const CartItem = ({ item }) => {
  if (!item.item) return <li>Item has been removed or unavailable.
        <RemoveFromCart id={item.id} />
  </li>;
  return <CartItemStyle>
    <img src={item.item.image} width="90" alt={item.item.title} />
    <div className="cart-item-details">
      <h3>{item.item.title}</h3>
      <p>{formatMoney(item.item.price * item.quantity)}
        {' - '}
        <em>
          {item.quantity} &times; {formatMoney(item.item.price)}
        </em>
      </p>
    </div>
    <RemoveFromCart id={item.id} />
  </CartItemStyle>
}

export default CartItem;
