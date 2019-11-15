import { ViewSetBatch } from '../viewsets';
import { BaseControllerOptions } from './base-controller-options';
import { BatchHook } from '../hooks';

export interface RestBatchControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
>
  extends BaseControllerOptions<
    PrimaryKeyT,
    DataT,
    RequestDataT,
    ResponseDataT
  > {
  viewset: ViewSetBatch<PrimaryKeyT, DataT>;
  batchSaveHooks?: Array<BatchHook<DataT>>;
}
