import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION (
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ) {
      id
    }
  }
`;

export default class CreateItems extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
    fileUploaded: true
  }

  handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  uploadFile = async e => {
    console.log('uploading file');
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'sickfits');
    console.log(file)
    this.setState({
      fileUploaded: false
    })
    const res = await fetch('https://api.cloudinary.com/v1_1/dvikas/image/upload', {
      method: 'post',
      body: data
    });
    const resFile = await res.json()
    console.log(resFile);
    this.setState({
      image: resFile.secure_url,
      largeImage: resFile.eager[0].secure_url,
      fileUploaded: true
    })
  }

  render() {
    return (

      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {
          (createItem, { loading, error }) => (

            <Form
              onSubmit={
                async e => {
                  e.preventDefault();
                  const response = await createItem();
                  Router.push({
                    pathname: '/item',
                    query: { id: response.data.createItem.id }
                  })
                  console.log(response);
                }
              }
            >
              <Error error={error} />

              <fieldset disabled={loading} aria-busy={loading}>
                <label htmlFor="file">
                  Upload File
             <input type="file"
                    id="file"
                    name="file"
                    placeholder="file"
                    required
                    onChange={this.uploadFile}
                  />
                </label>

                <label htmlFor="title">
                  Title
             <input type="text"
                    id="title"
                    name="title"
                    placeholder="title"
                    required
                    value={this.state.title}
                    onChange={this.handleChange}
                  />
                </label>

                <label htmlFor="price">
                  Price
             <input type="number"
                    id="price"
                    name="price"
                    placeholder="price"
                    required
                    value={this.state.price}
                    onChange={this.handleChange}
                  />
                </label>

                <label htmlFor="description">
                  Description
             <textarea
                    id="description"
                    name="description"
                    placeholder="description"
                    required
                    value={this.state.description}
                    onChange={this.handleChange}
                  />
                </label>

                <button disabled={!this.state.fileUploaded}
                type="submit">Submit</button>
              </fieldset>
            </Form>
          )
        }
      </Mutation>
    )
  }
}
export { CREATE_ITEM_MUTATION };