import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

const AuthGuard = props => (
  <Query query={CURRENT_USER_QUERY}>
    {
      ({ data }, loading) => {
        if (loading) return <p>Loading...</p>
        if (!data.me) {
          return (
            <>
              <p>You are not authorized to access this page </p>
              <Signin />
            </>
          )
        }
        return props.children;
      }
    }
  </Query>
)
export default AuthGuard;
