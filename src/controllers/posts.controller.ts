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
import { PostService } from '~/services/posts/post.service'
import { AuthGuard } from '~/guards/auth.guard'
import { PostSubmitDto } from '~/types/post'
import { User } from '~/types/user/user.decorator'

@Controller('posts')
export class PostsController {
  @Inject()
  private readonly service!: PostService

  @Post('submit')
  @UseGuards(AuthGuard)
  async create(@Body() data: PostSubmitDto, @User('id') id: string) {
    return this.service.create(data, id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async save(
    @Param('id') id: string,
    @Body() data: PostSubmitDto,
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
    return this.service.all()
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id)
  }
}
