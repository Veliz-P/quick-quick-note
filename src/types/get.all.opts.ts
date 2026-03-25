export interface GetAllOpts {
  pageSize?: number | undefined;
  onlyDeleted?: boolean | undefined;
  lastKey?: unknown;
  search?: string | undefined;
  exclude?: number[] | undefined;
}
