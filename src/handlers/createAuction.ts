import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

import 'source-map-support/register';

import { InternalServerError, UnprocessableEntity } from 'http-errors';

import { dynamoDb } from '../common/dynamoDB';
import middleware from '../common/middleware';

const CONFIG_AUCTIONS_TABLE = process.env.CONFIG_AUCTIONS_TABLE;

interface RequestDTO {
  title: string;
}

const handlerFn: APIGatewayProxyHandler = async (event, _context) => {
  const { title } = (event.body as unknown) as RequestDTO;

  if (!title) {
    throw new UnprocessableEntity();
  }

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    await dynamoDb
      .put({
        TableName: CONFIG_AUCTIONS_TABLE,
        Item: auction,
      })
      .promise();
  } catch (error) {
    throw new InternalServerError();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
};

export const handler = middleware(handlerFn);
