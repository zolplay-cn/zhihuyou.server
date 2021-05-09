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
import { CreatePostDto, UpdatePostDto } from '~/types/post'
import { Request } from '~/types/http'

@Controller('posts')
export class PostsController {
  @Inject()
  private readonly service!: PostsService

  @Get()
  async getAll() {
    return this.service.getAll()
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreatePostDto, @Req() { user }: Request) {
    return this.service.create(data, user.id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
    @Req() { user }: Request
  ) {
    return this.service.update(data, id, user.id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @Req() { user }: Request) {
    await this.service.delete(id, user.id)

    return { id }
  }
}
