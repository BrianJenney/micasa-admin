import React, { useState, useEffect, FC } from 'react';
import { Form, Input, Button, Space, Select, Upload, Spin } from 'antd';
import { MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { User, FormOptions } from '../types';

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

interface NewBuyerFormProps {
  selectedUser: User[];
  buyerOptions: FormOptions;
}

const NewBuyerForm: FC<NewBuyerFormProps> = ({
  selectedUser,
  buyerOptions
}) => {
  return <></>;
};

export default NewBuyerFormProps;
