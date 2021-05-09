import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
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
import { Post as ModelPost } from '~/models/post.model'

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  @Inject()
  private readonly service!: PostsService

  @Get()
  @ApiOkResponse({ type: ModelPost, isArray: true })
  async getAll() {
    return this.service.getAll()
  }

  @Get(':id')
  @ApiOkResponse({ type: ModelPost })
  @ApiNotFoundResponse({ description: 'when the post is not found' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  @ApiOperation({ summary: 'Create a post' })
  @ApiCreatedResponse({ type: ModelPost })
  @ApiUnauthorizedResponse({ description: 'when user not logged in' })
  async create(@Body() data: CreatePostDto, @Req() { user }: Request) {
    return this.service.create(data, user!.id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePostDto, required: false })
  @ApiOkResponse({ type: ModelPost })
  @ApiUnauthorizedResponse({
    description:
      "when the user not logged in or don't have permission to update",
  })
  @ApiNotFoundResponse({ description: 'when the post is not found' })
  @ApiOperation({ summary: 'Update a Post by id' })
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
  @ApiNotFoundResponse({ description: 'when the post cannot be found' })
  @ApiBadRequestResponse({
    description: "when ths user don't have permission to update",
  })
  @ApiUnauthorizedResponse({ description: 'when the user not logged in' })
  @ApiOperation({ summary: 'Delete a post by id' })
  async delete(@Param('id') id: string, @Req() { user }: Request) {
    await this.service.delete(id, user!.id)

    return { id }
  }
}
