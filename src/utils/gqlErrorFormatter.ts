import { HttpException } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

// This is probably not the best way to handle errors in GraphQL but it's a simplified "solution"
export function gqlErrorFormatter(
  error: GraphQLFormattedError,
): GraphQLFormattedError {
  const originalError = error.extensions?.originalError as HttpException;

  if (originalError) {
    return originalError;
  } else {
    return error;
  }
}
