import ForgotPassword from '../components/ForgotPassword'
import styled from 'styled-components';

const Column = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(300px, 1fr));
  grid-gap: 20px;
`;
const ForgotPasswordPage = props => (
  <Column>
    <ForgotPassword />
  </Column>
);

export default ForgotPasswordPage;
