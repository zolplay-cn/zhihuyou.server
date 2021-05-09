import { Module } from '@nestjs/common'
import { UserSerializer } from '~/core/serializers/user.serializer'
import { PostSerializer } from '~/core/serializers/post.serializer'

@Module({
  providers: [
    {
      provide: UserSerializer,
      useValue: new UserSerializer(),
    },
    {
      provide: PostSerializer,
      useValue: new PostSerializer(),
    },
  ],
  exports: [UserSerializer, PostSerializer],
})
export class SerializerModule {}
