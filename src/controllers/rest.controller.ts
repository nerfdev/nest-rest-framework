import { RestControllerOptions } from './rest-controller-options';
import { Get, Param, Post, Body, Put, Patch, Delete, Query, Req } from '@nestjs/common';
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
    await this.runAuthHooks(request);

    const data = await this.viewset.query(query);

    return await Promise.all(data.map(d => this.transformData(d, RestAction.Get)));
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() request) {
    await this.runAuthHooks(request);

    const transformedId = await this.transformPrimaryKey(id);

    const data = await this.viewset.retrieve(transformedId);

    return await this.transformData(data, RestAction.GetOne);
  }

  @Post()
  async post(@Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Post, request);

    const data = await this.viewset.create(dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Post);
  }

  @Put(':id')
  async put(@Param('id') id: string, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Put, request);

    const transformedId = await this.transformPrimaryKey(id);

    const data = await this.viewset.replace(transformedId, dataToSave);

    await this.runSaveHooks(dataToSave);
    
    return await this.transformData(data, RestAction.Put);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Patch, request);

    const transformedId = await this.transformPrimaryKey(id);

    const data = await this.viewset.modify(transformedId, dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Patch);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request) {
    await this.runAuthHooks(request);

    const transformedId = await this.transformPrimaryKey(id);

    await Promise.resolve(this.viewset.destroy(transformedId));
  }

  private async transformRequest(input: RequestDataT, action?: RestAction, request?: any) {
    if (!this.options.requestTransformer) {
      // if there is no request transformer, assume the data type is the same as the request type.
      return Promise.resolve(input as any as DataT);
    }

    return await Promise.resolve(this.options.requestTransformer.transform(input, action, request));
  }

  private async transformPrimaryKey(idParam: string): Promise<PrimaryKeyT> {
    if (!this.options.primaryKeyTransformer) {
      return Promise.resolve(idParam as any);
    }

    return await Promise.resolve(this.options.primaryKeyTransformer.transform(idParam));
  }

  private async transformData(input: DataT, action?: RestAction, request?: any) {
    if (!this.options.dataTransformer) {
      // if there is no data transformer, assume the data type is the same as the request type.
      return Promise.resolve(input as any as ResponseDataT);
    }

    return await Promise.resolve(this.options.dataTransformer.transform(input, action, request));
  }

  private async runAuthHooks(request) {
    const hookPromises = (this.options.authHooks || []).map(hook => Promise.resolve(hook.execute(request)));
    await Promise.all(hookPromises);
  }

  private async runSaveHooks(data: DataT) {
    const hookPromises = (this.options.saveHooks || []).map(hook => Promise.resolve(hook.execute(data)));
    await Promise.all(hookPromises);
  }
}
