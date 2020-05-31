import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import styled from 'styled-components'
import Head from 'next/head'

const SingleItemStyle = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1ft;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: {id: $id}) {
      id
      title
      description
      largeImage
    }
  }
`;

export default class SingleItem extends Component {
  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{ id: this.props.id }}
      >
        {
          ({ error, loading, data }) => {
            if (error) return 'Error!!';
            if (loading) return 'Loading...';
            if (!data.item) return `Item not found for ${this.props.id}`
            return <SingleItemStyle>
              <Head>
                <title>{data.item.title}</title>
              </Head>
              <img src={data.item.largeImage} alt={data.item.title} />
              <div className="details">
                <h2>Viewing {data.item.title}</h2>
                <p>{data.item.description}</p>
              </div>
            </SingleItemStyle>
          }
        }
      </Query>
    )
  }
}
