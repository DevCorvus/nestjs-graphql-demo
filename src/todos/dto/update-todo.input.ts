import { Field, InputType } from '@nestjs/graphql';

// TODO: Validation
@InputType()
export class UpdateTodoInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  done?: boolean;
}
