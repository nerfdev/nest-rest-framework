import { RestBatchControllerOptions} from './rest-batch-controller-options';
import { Get, Post, Body, Put, Patch, Delete, Query, Req } from '@nestjs/common';
import { RestAction } from './rest-action.enum';

export abstract class RestBatchController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  get viewset() {
    return this.options.viewset;
  }

  get requestTransformer() {
    return this.options.requestTransformer;
  }

  get dataTransformer() {
    return this.options.dataTransformer;
  }

  constructor(
    protected readonly options: RestBatchControllerOptions<
      PrimaryKeyT,
      DataT,
      RequestDataT,
      ResponseDataT
    >,
  ) {}

  @Get('')
  async batchGet(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',') as any as PrimaryKeyT[];
    const data = await this.viewset.batchRetrieve(pks);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchGet));
    }));
    return dataToReturn;
  }

  @Post('')
  async batchPost(@Body() creates: RequestDataT[], @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave = await Promise.all(creates.map(r => {
        return Promise.resolve(this.requestTransformer.transform(r, RestAction.BatchPost, request));
    }));
    const data = await this.viewset.batchCreate(dataToSave);
    await this.runSaveHooks(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPost));
    }));
    return dataToReturn;
  }

  @Put('')
  async batchPut(@Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>, @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(updates.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data, RestAction.BatchPut, request)),
        };
    }));
    const data = await this.viewset.batchReplace(dataToSave);
    await this.runSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPut));
    }));
    return dataToReturn;
  }

  @Patch('')
  async batchPatch(@Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>, @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(updates.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data, RestAction.BatchPatch, request)),
        };
    }));
    const data = await this.viewset.batchModify(dataToSave);
    await this.runSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPatch));
    }));
    return dataToReturn;
  }

  @Delete('')
  async batchDelete(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',') as any as PrimaryKeyT[];
    await this.viewset.batchDestroy(pks);
  }

  private async runAuthHooks(request) {
    const hookPromises = (this.options.authHooks || []).map(hook => Promise.resolve(hook.execute(request)));
    await Promise.all(hookPromises);
  }

  private async runSaveHooks(data: DataT[]) {
    const hookPromises = (this.options.batchSaveHooks || []).map(hook => Promise.resolve(hook.execute(data)));
    await Promise.all(hookPromises);
  }
}
