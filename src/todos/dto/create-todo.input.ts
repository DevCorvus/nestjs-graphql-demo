import { Field, InputType } from '@nestjs/graphql';

// TODO: Validation
@InputType()
export class CreateTodoInput {
  @Field()
  title: string;
}
