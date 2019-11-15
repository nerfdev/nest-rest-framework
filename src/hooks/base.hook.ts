export abstract class Hook<DataT> {
  abstract execute(data: DataT): void | Promise<void>;
}
