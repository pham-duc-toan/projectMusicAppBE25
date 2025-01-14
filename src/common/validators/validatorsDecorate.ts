import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-array', async: false })
export class IsStringOrArray implements ValidatorConstraintInterface {
  validate(input: any, args: ValidationArguments): boolean {
    if (Array.isArray(input)) {
      // Kiểm tra xem tất cả các phần tử trong mảng có phải là string không
      return input.every((item) => typeof item === 'string');
    }
    // Nếu không phải mảng, kiểm tra input có phải là string không
    return typeof input === 'string';
  }

  defaultMessage(args: ValidationArguments): string {
    return `Không đúng định dạng file`;
  }
}
