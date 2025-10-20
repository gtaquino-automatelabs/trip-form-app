import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@trip-form-app/shared';

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = { error: Error | null };

export abstract class BaseRepository<T> {
  constructor(
    protected supabase: SupabaseClient<Database>,
    protected tableName: keyof Database['public']['Tables']
  ) {}

  protected handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'string') {
      return new Error(error);
    }
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error('An unknown error occurred');
  }

  protected async executeQuery<TResult>(
    query: PromiseLike<{ data: TResult | null; error: any }>
  ): Promise<{ data: TResult | null; error: Error | null }> {
    try {
      const { data, error } = await query;
      if (error) {
        return { data: null, error: this.handleError(error) };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  protected async executeTransaction<TResult>(
    callback: (client: SupabaseClient<Database>) => Promise<TResult>
  ): Promise<{ data: TResult | null; error: Error | null }> {
    try {
      const result = await callback(this.supabase);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }
}