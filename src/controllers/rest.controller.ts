import { RestControllerOptions } from './rest-controller-options';
import {
  Get,
  Param,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ViewSetQuery } from '../viewsets/viewset-query';
import { RestAction } from './rest-action.enum';
import { BaseController } from './base.controller';

export abstract class RestController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> extends BaseController<PrimaryKeyT, DataT, RequestDataT, ResponseDataT> {
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
  ) {
    super(options);
  }

  @Get('')
  async get(@Query() query: ViewSetQuery, @Req() request) {
    await this.runAuthHooks(request);

    const data = await this.viewset.query(query);

    return await Promise.all(
      data.map(d => this.transformData(d, RestAction.Get)),
    );
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

    const dataToSave = await this.transformRequest(
      update,
      RestAction.Post,
      request,
    );

    const data = await this.viewset.create(dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Post);
  }

  @Put(':id')
  async put(
    @Param('id') id: string,
    @Body() update: RequestDataT,
    @Req() request,
  ) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(
      update,
      RestAction.Put,
      request,
    );

    const transformedId = await this.transformPrimaryKey(id);

    const data = await this.viewset.replace(transformedId, dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Put);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() update: RequestDataT,
    @Req() request,
  ) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(
      update,
      RestAction.Patch,
      request,
    );

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

  private async runSaveHooks(data: DataT) {
    const hookPromises = (this.options.saveHooks || []).map(hook =>
      Promise.resolve(hook.execute(data)),
    );
    await Promise.all(hookPromises);
  }
}
