export abstract class BatchHook<DataT> {
  abstract execute(data: DataT[]): void | Promise<void>;
}
