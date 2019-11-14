import { ViewSetQuery } from './viewset-query';

export type BatchUpdate<PrimaryKeyT, DataT> = Array<{
  pk: PrimaryKeyT;
  data: DataT;
}>;

export abstract class ViewSet<PrimaryKeyT, DataT> {
  abstract query?(query?: ViewSetQuery): DataT[] | Promise<DataT[]>;
  abstract create?(data: DataT): DataT | Promise<DataT>;
  abstract retrieve?(pk: PrimaryKeyT): DataT | Promise<DataT>;
  abstract replace?(pk: PrimaryKeyT, data: DataT): DataT | Promise<DataT>;
  abstract modify?(pk: PrimaryKeyT, data: DataT): DataT | Promise<DataT>;
  abstract destroy?(pk: PrimaryKeyT): void | Promise<void>;

  // abstract batchCreate?(data: DataT[]): DataT[] | Promise<DataT[]>;
  // abstract batchRetrieve?(pks: PrimaryKeyT[]): DataT[] | Promise<DataT[]>;
  // abstract batchReplace?(updates: BatchUpdate<PrimaryKeyT, DataT>): DataT[] | Promise<DataT[]>;
  // abstract batchModify?(updates: BatchUpdate<PrimaryKeyT, DataT>): DataT[] | Promise<DataT[]>;
  // abstract batchDestroy?(pks: PrimaryKeyT[]): void | Promise<void>;
}
