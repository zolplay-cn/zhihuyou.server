import { Serializer } from '~/core/serializers/serializer'
import { Post as PostObject } from '@prisma/client'
import { Post } from '~/models/post.model'

export class PostSerializer extends Serializer<PostObject, Post> {
  /**
   * @inheritDoc
   */
  protected modelClass = Post
}
