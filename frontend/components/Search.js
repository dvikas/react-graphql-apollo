import React from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';

import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";


const SEARCH_ITEM_QUERY = gql`
  query SEARCH_ITEM_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        {title_contains: $searchTerm},
        {description_contains: $searchTerm}
      ]
    }) {
      id
      image
      title
    }
  }
`;

class Search extends React.Component {

  state = {
    items: [],
    loading: false
  }

  fetchList = debounce(async (e, search) => {
    this.setState({ loading: true });
    const res = await search.query({
      query: SEARCH_ITEM_QUERY,
      variables: { searchTerm: e.target.value }
    });
    this.setState({
      items: res.data.items,
      loading: false
    })
  }, 350);

  render() {
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {
              (search) => <input type="search" onChange={(e) => {
                e.persist();
                this.fetchList(e, search)
              }
              } />
            }
          </ApolloConsumer>
          <DropDown>
            {
              this.state.items.map(item => (
                <DropDownItem key={item.id}>
                  <img height="50" src={item.image} alt={item.title} />{item.title}
                </DropDownItem>
              ))
            }
          </DropDown>
        </div>
      </SearchStyles>
    )
  }
}

export default Search;