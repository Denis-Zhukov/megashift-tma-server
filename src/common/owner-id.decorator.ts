import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

interface OwnerIdDecoratorOptions {
  required?: boolean;
}

export const OwnerId = createParamDecorator(
  (
    options: OwnerIdDecoratorOptions = { required: true },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const ownerId = request.query.ownerId;

    if (options.required && !ownerId) {
      throw new BadRequestException('Query parameter "ownerId" is required');
    }

    if (ownerId && !/^\d+$/.test(ownerId)) {
      throw new BadRequestException(
        'Query parameter "ownerId" must be a numeric string',
      );
    }

    return ownerId;
  },
);
