import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

import 'source-map-support/register';

import {
  InternalServerError,
  UnprocessableEntity,
  BadRequest,
} from 'http-errors';

import { dynamoDb } from '../common/dynamoDB';
import middleware from '../common/middleware';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { getAuctionById } from './getAuctionById';

interface RequestDTO {
  amount: number;
}

const handlerFn: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters;

  const { amount } = (event.body as unknown) as RequestDTO;

  const auction = await getAuctionById(id);

  if (!amount) {
    throw new UnprocessableEntity('Amount not provided');
  }

  if (auction.highestBid.amount >= amount) {
    throw new BadRequest(
      'The amount provided was lower than actual highest bid'
    );
  }

  const params: DocumentClient.UpdateItemInput = {
    TableName: process.env.CONFIG_AUCTIONS_TABLE,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ result: result.Attributes }),
    };
  } catch (error) {
    throw new InternalServerError();
  }
};

export const handler = middleware(handlerFn);
