import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, Length } from 'class-validator';

@InputType()
export class UpdateTodoInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 100)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
