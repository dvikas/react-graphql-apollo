import ResetPassword from '../components/ResetPassword'
import styled from 'styled-components';

const Column = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(300px, 1fr));
  grid-gap: 20px;
`;
const ResetPasswordPage = props => (
  <Column>
    <ResetPassword token={props.query.token} />
  </Column>
);

export default ResetPasswordPage;
