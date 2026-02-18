export interface PaginatedResult<T> {
  data: T[];
  pageSize: number;
  lastKey: unknown | null;
  hasMore: boolean;
}
