import { ViewSetQuery } from './viewset-query';

export abstract class ViewSet<PrimaryKeyT, DataT> {
  abstract query?(query?: ViewSetQuery): DataT[] | Promise<DataT[]>;
  abstract create?(data: DataT): DataT | Promise<DataT>;
  abstract retrieve?(pk: PrimaryKeyT): DataT | Promise<DataT>;
  abstract replace?(pk: PrimaryKeyT, data: DataT): DataT | Promise<DataT>;
  abstract modify?(pk: PrimaryKeyT, data: DataT): DataT | Promise<DataT>;
  abstract destroy?(pk: PrimaryKeyT): void | Promise<void>;
}
