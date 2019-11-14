
export type BatchUpdate<PrimaryKeyT, DataT> = Array<{
    pk: PrimaryKeyT;
    data: DataT;
  }>;

export abstract class ViewSetBatch<PrimaryKeyT, DataT> {
    abstract batchCreate(data: DataT[]): DataT[] | Promise<DataT[]>;
    abstract batchRetrieve(pks: PrimaryKeyT[]): DataT[] | Promise<DataT[]>;
    abstract batchReplace(updates: BatchUpdate<PrimaryKeyT, DataT>): DataT[] | Promise<DataT[]>;
    abstract batchModify(updates: BatchUpdate<PrimaryKeyT, DataT>): DataT[] | Promise<DataT[]>;
    abstract batchDestroy(pks: PrimaryKeyT[]): void | Promise<void>;
}
