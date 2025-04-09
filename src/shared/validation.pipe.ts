import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    const exceptionObj = _.map(errors, (error) => {
      return {
        code: `${error.property.toUpperCase()}_IS_INVALID`,
        message: `${error.property} is invalid.`,
      };
    });

    if (errors.length > 0) {
      throw new BadRequestException(exceptionObj);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: Array<() => void> = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
