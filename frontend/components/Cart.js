import React from 'react'
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

const Cart = () => (
  <CartStyles open>
    <header>
      <CloseButton>&times;</CloseButton>
      <Supreme>Your Cart</Supreme>
      <p>
        You have 10 Items in your cart.
      </p>
    </header>
    <footer>
      <p>$10.00 </p>
      <SickButton>Checkout</SickButton>
    </footer>
  </CartStyles>
);

export default Cart;
