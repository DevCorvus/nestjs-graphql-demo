import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Length, MaxLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  @MaxLength(200)
  email: string;

  @Field()
  @Length(6, 250)
  password: string;
}
