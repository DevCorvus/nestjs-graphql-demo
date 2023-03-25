import { Field, InputType } from '@nestjs/graphql';

// TODO: Validation
@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
