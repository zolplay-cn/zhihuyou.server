import { Module } from '@nestjs/common'
import { PostService } from '~/services/posts/post.service'
import { PostsController } from '~/controllers/posts.controller'

@Module({
  providers: [PostService],
  controllers: [PostsController],
  exports: [PostService],
})
export class PostModule {}
