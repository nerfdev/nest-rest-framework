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
import { BaseController } from './base-controller';

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
      data.map(d => this.transformResponse(d, RestAction.Get)),
    );
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() request) {
    await this.runAuthHooks(request);

    const transformedId = await this.transformPrimaryKey(id);

    const data = await this.viewset.retrieve(transformedId);

    return await this.transformResponse(data, RestAction.GetOne);
  }

  @Post()
  async post(@Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataPreBusinessLogic = await this.transformRequest(
      update,
      RestAction.Post,
      request,
    );
    const dataToSave = await this.transformBusinessLogicSave(
      dataPreBusinessLogic,
    );

    const data = await this.viewset.create(dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformResponse(data, RestAction.Post);
  }

  @Put(':id')
  async put(
    @Param('id') id: string,
    @Body() update: RequestDataT,
    @Req() request,
  ) {
    await this.runAuthHooks(request);

    const dataPreBusinessLogic = await this.transformRequest(
      update,
      RestAction.Put,
      request,
    );

    const transformedId = await this.transformPrimaryKey(id);

    const dataToSave = await this.transformBusinessLogicSave(
      dataPreBusinessLogic,
    );

    const data = await this.viewset.replace(transformedId, dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformResponse(data, RestAction.Put);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() update: RequestDataT,
    @Req() request,
  ) {
    await this.runAuthHooks(request);

    const dataPreBusinessLogic = await this.transformRequest(
      update,
      RestAction.Patch,
      request,
    );

    const transformedId = await this.transformPrimaryKey(id);

    const dataToSave = await this.transformBusinessLogicSave(
      dataPreBusinessLogic,
    );

    const data = await this.viewset.modify(transformedId, dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformResponse(data, RestAction.Patch);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request) {
    await this.runAuthHooks(request);

    const transformedId = await this.transformPrimaryKey(id);

    await Promise.resolve(this.viewset.destroy(transformedId));
  }
}
