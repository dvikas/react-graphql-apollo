import Items from './index'

const ItemsHome = props => (
  <div>
    <Items page={parseInt(props.query.page) || 1} />
  </div>
)
export default ItemsHome;