import Link from 'next/link';
import CreateItem from '../components/CreateItems';
import AuthGuard from '../components/AuthGuard';

const Sell = props => (
  <AuthGuard>
    <CreateItem />
  </AuthGuard>
);

export default Sell;
