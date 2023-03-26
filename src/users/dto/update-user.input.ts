import { Field, InputType } from '@nestjs/graphql';
import { Length, MaxLength, IsEmail, IsOptional } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(6, 250)
  password?: string;
}
