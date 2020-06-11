import React from 'react';
import Downshift, {resetIdCounter} from 'downshift';
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

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id
    }
  })
}

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
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift onChange={routeToItem}
          itemToString={item => (item === null ? '' : item.title)}>
          {
            ({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (

              <div>
                <ApolloConsumer>
                  {
                    (search) => <input
                      {
                      ...getInputProps({
                        type: 'search',
                        onChange: e => {
                          e.persist();
                          this.fetchList(e, search)
                        },
                        placeholder: 'Search for an item...',
                        className: this.state.loading ? 'loading' : '',
                        id: 'search'
                      })
                      }
                    />
                  }
                </ApolloConsumer>
                {
                  isOpen && (
                    <DropDown>
                      {
                        this.state.items.map((item, index) => (
                          <DropDownItem
                            {
                            ...getItemProps({
                              item
                            })
                            }
                            highlighted={index === highlightedIndex}
                            key={item.id}
                          >
                            <img height="50" src={item.image} alt={item.title} />{item.title}
                          </DropDownItem>
                        ))
                      }
                      {
                        !this.state.items.length && !this.state.loading && inputValue && (
                          <DropDownItem>
                            Nothing found for "{inputValue}"
                          </DropDownItem>
                        )
                      }
                    </DropDown>
                  )
                }
              </div>
            )}
        </Downshift>
      </SearchStyles>
    )
  }
}

export default Search;