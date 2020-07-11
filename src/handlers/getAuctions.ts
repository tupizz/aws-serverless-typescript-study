import { APIGatewayProxyHandler } from 'aws-lambda';

import 'source-map-support/register';

import { InternalServerError } from 'http-errors';

import { dynamoDb } from '../common/dynamoDB';
import middleware from '../common/middleware';

const CONFIG_AUCTIONS_TABLE = process.env.CONFIG_AUCTIONS_TABLE;

const handlerFn: APIGatewayProxyHandler = async (_event, _context) => {
  try {
    const result = await dynamoDb
      .scan({
        TableName: CONFIG_AUCTIONS_TABLE,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    throw new InternalServerError();
  }
};

export const handler = middleware(handlerFn);
