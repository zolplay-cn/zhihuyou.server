import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { PostsService } from '~/services/posts.service'
import { AuthGuard } from '~/guards/auth.guard'
import { CreatePostDto, UpdatePostDto, DeletePostResponse } from '~/types/post'
import { Request } from '~/types/http'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Post as PostModel } from '~/models/post.model'

@ApiTags('posts')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('posts')
export class PostsController {
  @Inject()
  private readonly service!: PostsService

  @Get()
  @ApiOkResponse({ type: PostModel, isArray: true })
  async getAll() {
    return this.service.getAll()
  }

  @Get(':id')
  @ApiOkResponse({ type: PostModel })
  @ApiNotFoundResponse({ description: 'When the post is not found.' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  @ApiOperation({ summary: 'Create a post' })
  @ApiCreatedResponse({ type: PostModel })
  @ApiUnauthorizedResponse({ description: 'Requires authentication.' })
  async create(@Body() data: CreatePostDto, @Req() { user }: Request) {
    return this.service.create(data, user!.id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePostDto, required: false })
  @ApiOkResponse({ type: PostModel })
  @ApiUnauthorizedResponse({
    description:
      "When the user is not logged in or they don't have the permission to update.",
  })
  @ApiNotFoundResponse({ description: 'When the post is not found.' })
  @ApiOperation({ summary: 'Update a post' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
    @Req() { user }: Request
  ) {
    return this.service.update(data, id, user!.id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: DeletePostResponse })
  @ApiNotFoundResponse({ description: 'When the post is not found.' })
  @ApiBadRequestResponse({
    description: "When ths user doesn't have the permission to update.",
  })
  @ApiUnauthorizedResponse({ description: 'When the user is not logged in.' })
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@Param('id') id: string, @Req() { user }: Request) {
    await this.service.delete(id, user!.id)

    return { id }
  }
}
