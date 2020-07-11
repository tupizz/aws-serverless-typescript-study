import { APIGatewayProxyHandler } from 'aws-lambda';

import 'source-map-support/register';

import { InternalServerError, NotFound } from 'http-errors';

import { dynamoDb } from '../common/dynamoDB';
import middleware from '../common/middleware';

const CONFIG_AUCTIONS_TABLE = process.env.CONFIG_AUCTIONS_TABLE;

const handlerFn: APIGatewayProxyHandler = async (event, _context) => {
  console.log(event);
  const { id } = event.pathParameters;

  console.log(id);

  try {
    const result = await dynamoDb
      .get({
        TableName: CONFIG_AUCTIONS_TABLE,
        Key: { id },
      })
      .promise();

    if (!result.Item) throw new NotFound();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    if (error instanceof NotFound) {
      throw new NotFound();
    }

    throw new InternalServerError();
  }
};

export const handler = middleware(handlerFn);
