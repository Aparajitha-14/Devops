/**
 * Placeholder mongoose types for local dev to silence TypeScript errors.
 * This is intentionally minimal — it provides the pieces used in this project.
 *
 * If you install @types/mongoose or the real `mongoose` package types, remove this file.
 */

declare module 'mongoose' {
  export type AnyObject = Record<string, any>;

  export interface Document {
    _id?: any;
    [key: string]: any;
  }

  export interface SchemaOptions {
    timestamps?: boolean | { createdAt?: string; updatedAt?: string };
    collection?: string;
    [key: string]: any;
  }

  export class Schema<T = any> {
    constructor(definition?: AnyObject, options?: SchemaOptions);
    // minimal instance members (if referenced)
    paths?: AnyObject;
  }

  export interface Model<T = any> {
    new (doc?: Partial<T>): T;
    (doc?: Partial<T>): T;
    find(query?: AnyObject): Promise<T[]>;
    findOne(query?: AnyObject): Promise<T | null>;
    findById(id: any): Promise<T | null>;
    findByIdAndUpdate(id: any, update: AnyObject, opts?: AnyObject): Promise<any>;
    findOneAndUpdate(query: AnyObject, update: AnyObject, opts?: AnyObject): Promise<any>;
    create(doc: Partial<T> | Partial<T>[]): Promise<T | T[]>;
    save(): Promise<T>;
    deleteOne(query?: AnyObject): Promise<any>;
    sort(...args: any[]): any;
    // allow arbitrary calls used in code
    [key: string]: any;
  }

  export function model<T = any>(name: string, schema?: Schema<T>, collection?: string): Model<T>;
  export const models: Record<string, Model>;
  export function connect(uri: string, opts?: AnyObject): Promise<any>;
  export const connection: any;

  // Default export shape (minimal)
  const mongoose: {
    Schema: typeof Schema;
    model: typeof model;
    models: typeof models;
    connect: typeof connect;
    connection: typeof connection;
    // allow additional runtime properties
    [key: string]: any;
  };

  export default mongoose;
}
