import { Injectable } from '@nestjs/common'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { uniqBy } from 'lodash'

@ValidatorConstraint({ name: 'unique', async: true })
@Injectable()
export class UniqueFieldValidator implements ValidatorConstraintInterface {
  public validate = async (values: object[], args: ValidationArguments): Promise<boolean> => {
    const [fieldName] = args.constraints
    return uniqBy(values, fieldName).length === values.length
  }

  defaultMessage(args: ValidationArguments) {
    const [fieldName] = args.constraints
    return `${fieldName} must be unique`
  }
}
