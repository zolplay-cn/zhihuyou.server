import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { PostsService } from '~/services/posts.service'
import { AuthGuard } from '~/guards/auth.guard'
import { CreatePostDto, UpdatePostDto } from '~/types/post'
import { User } from '~/core/decorators/user.decorator'

@Controller('posts')
export class PostsController {
  @Inject()
  private readonly service!: PostsService

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreatePostDto, @User('id') id: string) {
    return this.service.create(data, id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async save(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
    @User('id') userId: string
  ) {
    return this.service.update(data, id, userId)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @User('id') userId: string) {
    await this.service.delete(id, userId)

    return { id }
  }

  @Get()
  async all() {
    return this.service.getAll()
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id)
  }
}
