import { User } from '@tma.js/init-data-node';

type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

type SnakeToCamelObject<T> = T extends object
  ? {
      [K in keyof T as K extends string
        ? SnakeToCamel<K>
        : K]: T[K] extends object ? SnakeToCamelObject<T[K]> : T[K];
    }
  : T;

type UserCamelCase = SnakeToCamelObject<User>;

declare global {
  namespace Express {
    interface Request {
      user: UserCamelCase;
    }
  }
}
