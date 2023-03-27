import { HttpException } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

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
