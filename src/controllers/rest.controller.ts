import { RestControllerOptions } from './rest-controller-options';
import { Get, Param, Post, Body, Put, Patch, Delete, Query, Req } from '@nestjs/common';
import { BatchUpdate } from '../viewsets/base.viewsets';
import { ViewSetQuery } from '../viewsets/viewset-query';
import { RestAction } from './rest-action.enum';

export abstract class RestController<
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
    protected readonly options: RestControllerOptions<
      PrimaryKeyT,
      DataT,
      RequestDataT,
      ResponseDataT
    >,
  ) {}

  @Get('')
  async get(@Query() query: ViewSetQuery, @Req() request) {
    const data = await this.viewset.list(query);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchGet));
    }));
    return dataToReturn;
  }

  @Get(':id')
  async getOne(@Param('id') id: PrimaryKeyT, @Req() request) {
    const data = await this.viewset.retrieve(id);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.GetOne));
    return dataToReturn;
  }

  @Post()
  async post(@Body() update: RequestDataT, @Req() request) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Post, request));
    const data = await this.viewset.create(dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Post));
    return dataToReturn;
  }

  @Put(':id')
  async put(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Put, request));
    const data = await this.viewset.replace(id, dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Put));
    return dataToReturn;
  }

  @Patch(':id')
  async patch(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Patch, request));
    const data = await this.viewset.modify(id, dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Patch));
    return dataToReturn;
  }

  @Delete(':id')
  async delete(@Param('id') id: PrimaryKeyT, @Req() request) {
    await Promise.resolve(this.viewset.destroy(id));
  }

  @Get('batch')
  async batchGet(@Query('ids') ids: string, @Req() request) {
    const pks = ids.split(',') as any as PrimaryKeyT[];
    const data = await this.viewset.batchRetrieve(pks);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchGet));
    }));
    return dataToReturn;
  }

  @Post('batch')
  async batchPost(@Body() creates: RequestDataT[], @Req() request) {
    const dataToSave = await Promise.all(creates.map(r => {
        return Promise.resolve(this.requestTransformer.transform(r, RestAction.BatchPost, request));
    }));
    const data = await this.viewset.batchCreate(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPost));
    }));
    return dataToReturn;
  }

  @Put('batch')
  async batchPut(@Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>, @Req() request) {
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(updates.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data, RestAction.BatchPut, request)),
        };
    }));
    const data = await this.viewset.batchReplace(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPut));
    }));
    return dataToReturn;
  }

  @Patch('batch')
  async batchPatch(@Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>, @Req() request) {
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(updates.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data, RestAction.BatchPatch, request)),
        };
    }));
    const data = await this.viewset.batchModify(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchPatch));
    }));
    return dataToReturn;
  }

  @Delete('batch')
  async batchDelete(@Query('ids') ids: string, @Req() request) {
    const pks = ids.split(',') as any as PrimaryKeyT[];
    await this.viewset.batchDestroy(pks);
  }
}
