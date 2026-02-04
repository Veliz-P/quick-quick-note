export interface PaginatedResult<T> {
  data: T[];
  pageSize: number;
  lastKey: number | null;
  hasMore: boolean;
}
