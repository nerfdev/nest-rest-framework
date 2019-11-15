import { RestAction } from './rest-action.enum';
import { RestControllerOptions } from './rest-controller-options';
import { RestBatchControllerOptions } from './rest-batch-controller-options';

export abstract class BaseController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  constructor(
    protected readonly options:
      | RestControllerOptions<PrimaryKeyT, DataT, RequestDataT, ResponseDataT>
      | RestBatchControllerOptions<
          PrimaryKeyT,
          DataT,
          RequestDataT,
          ResponseDataT
        >,
  ) {}

  protected async transformRequest(
    input: RequestDataT,
    action?: RestAction,
    request?: any,
  ) {
    if (!this.options.requestTransformer) {
      // if there is no request transformer, assume the data type is the same as the request type.
      return Promise.resolve((input as any) as DataT);
    }

    return await Promise.resolve(
      this.options.requestTransformer.transform(input, action, request),
    );
  }

  protected async transformPrimaryKey(idParam: string): Promise<PrimaryKeyT> {
    if (!this.options.primaryKeyTransformer) {
      return Promise.resolve(idParam as any);
    }

    return await Promise.resolve(
      this.options.primaryKeyTransformer.transform(idParam),
    );
  }

  protected async transformData(
    input: DataT,
    action?: RestAction,
    request?: any,
  ) {
    if (!this.options.dataTransformer) {
      // if there is no data transformer, assume the data type is the same as the request type.
      return Promise.resolve((input as any) as ResponseDataT);
    }

    return await Promise.resolve(
      this.options.dataTransformer.transform(input, action, request),
    );
  }

  protected async runAuthHooks(request) {
    const hookPromises = (this.options.authHooks || []).map(hook =>
      Promise.resolve(hook.execute(request)),
    );
    await Promise.all(hookPromises);
  }
}
