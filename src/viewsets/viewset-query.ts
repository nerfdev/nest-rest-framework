export interface ViewSetQuery {
  fields: string[];
  filter: string;
  or: string;
  join: string;
  sort: 'asc' | 'desc';
  limit: number;
  offset: number;
  page: number;
}
