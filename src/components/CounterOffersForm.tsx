import React from 'react';

const counterOfferMutation: string = `
mutation addCounterOffer(
    $buyerId: String!,
    $sellerId: String!,
    $pdfUrl: String!,
    $expirationTime:String
  ){
    addCounterOffer (buyerId:$buyerId, sellerId:$sellerId, pdfUrl: $pdfUrl, expirationTime: $expirationTime){
      _id
      counterOffers {
        name
        signatureId
        counterOfferId
        expirationTime
        completed
      }
    }
  }
`;

const addBuyerMutation: string = `
mutation createBuyer($buyerName: String!, $sellerId:String!) {
    createBuyer(buyerName: $buyerName, sellerId: $sellerId) {
      _id
      counterOffers{
        name
        expirationTime
        counterOfferId
      }
    }
  }
`;
