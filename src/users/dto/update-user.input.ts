import { Field, InputType } from '@nestjs/graphql';

// TODO: Validation
@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;
}
