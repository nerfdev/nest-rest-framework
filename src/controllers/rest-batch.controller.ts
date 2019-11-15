import { RestBatchControllerOptions } from './rest-batch-controller-options';
import {
  Get,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { RestAction } from './rest-action.enum';
import { BatchUpdate } from '../viewsets';
import { BaseController } from './base-controller';

export abstract class RestBatchController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> extends BaseController<PrimaryKeyT, DataT, RequestDataT, ResponseDataT> {
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
  ) {
    super(options);
  }

  @Get('')
  async batchGet(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',');
    const pksTransformed = await Promise.all(
      pks.map(pk => this.transformPrimaryKey(pk)),
    );
    const data = await this.viewset.batchRetrieve(pksTransformed);
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformData(d, RestAction.BatchGet));
      }),
    );
    return dataToReturn;
  }

  @Post('')
  async batchPost(@Body() creates: RequestDataT[], @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave = await Promise.all(
      creates.map(r => {
        return Promise.resolve(
          this.transformRequest(r, RestAction.BatchPost, request),
        );
      }),
    );
    const data = await this.viewset.batchCreate(dataToSave);
    await this.runSaveHooks(dataToSave);
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformData(d, RestAction.BatchPost));
      }),
    );
    return dataToReturn;
  }

  @Put('')
  async batchPut(
    @Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>,
    @Req() request,
  ) {
    await this.runAuthHooks(request);
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(
      updates.map(async r => {
        return {
          pk: r.pk,
          data: await Promise.resolve(
            this.transformRequest(r.data, RestAction.BatchPut, request),
          ),
        };
      }),
    );
    const data = await this.viewset.batchReplace(dataToSave);
    await this.runSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformData(d, RestAction.BatchPut));
      }),
    );
    return dataToReturn;
  }

  @Patch('')
  async batchPatch(
    @Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>,
    @Req() request,
  ) {
    await this.runAuthHooks(request);
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(
      updates.map(async r => {
        return {
          pk: r.pk,
          data: await Promise.resolve(
            this.transformRequest(r.data, RestAction.BatchPatch, request),
          ),
        };
      }),
    );
    const data = await this.viewset.batchModify(dataToSave);
    await this.runSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformData(d, RestAction.BatchPatch));
      }),
    );
    return dataToReturn;
  }

  @Delete('')
  async batchDelete(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',');
    const pksTransformed = await Promise.all(
      pks.map(pk => this.transformPrimaryKey(pk)),
    );
    await this.viewset.batchDestroy(pksTransformed);
  }

  private async runSaveHooks(data: DataT[]) {
    const hookPromises = (this.options.batchSaveHooks || []).map(hook =>
      Promise.resolve(hook.execute(data)),
    );
    await Promise.all(hookPromises);
  }
}
