import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';
import { TOGGLE_CART_MUTATION } from './Cart';
import { Query, Mutation } from 'react-apollo';

const Nav = () => (

  <User>
    {
      ({ data: { me } }) => (
        <NavStyles>
          {me && (
            <small>{me.email}</small>
          )
          }
          <Link href="/items">
            <a>Items</a>
          </Link>
          {
            me && (
              <>
                <Link href="/sell">
                  <a>Sell</a>
                </Link>
                <Link href="/orders">
                  <a>Orders</a>
                </Link>
                <Link href="/me">
                  <a>Account</a>
                </Link>
                <Signout />
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                  {
                    (toggleCart) => (
                      <button onClick={toggleCart}>My Cart
                        <CartCount count={
                          me.cart.reduce((tally, cartItem) => {
                            return (tally + cartItem.quantity)
                          }, 0)

                        } />
                      </button>
                    )
                  }
                </Mutation>
              </>
            )
          }
          {
            !me && (
              <>
                <Link href="/signup">
                  <a>Signup</a>
                </Link>
              </>
            )
          }
        </NavStyles>
      )
    }
  </User>
);

export default Nav;
