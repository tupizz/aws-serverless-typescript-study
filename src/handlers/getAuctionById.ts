import { APIGatewayProxyHandler } from 'aws-lambda';

import 'source-map-support/register';

import { InternalServerError, NotFound } from 'http-errors';

import { dynamoDb } from '../common/dynamoDB';
import middleware from '../common/middleware';

const CONFIG_AUCTIONS_TABLE = process.env.CONFIG_AUCTIONS_TABLE;

interface Auction {
  createdAt: Date;
  id: string;
  title: string;
  highestBid: {
    amount: number;
  };
  status: 'OPEN' | 'CLOSED';
}

export const getAuctionById = async (id): Promise<Auction> => {
  try {
    const result = await dynamoDb
      .get({
        TableName: CONFIG_AUCTIONS_TABLE,
        Key: { id },
      })
      .promise();

    if (!result.Item) throw new NotFound();

    return result.Item as Auction;
  } catch (error) {
    if (error instanceof NotFound) {
      throw new NotFound(`Auction with id ${id} was not found.`);
    }

    throw new InternalServerError(
      'Something wrong occurs in ours side, sorry =('
    );
  }
};

const handlerFn: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
};

export const handler = middleware(handlerFn);
