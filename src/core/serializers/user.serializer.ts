import { User as UserObject } from '@prisma/client'
import { Serializer } from '~/core/serializers/serializer'
import { User } from '~/models/user.model'

export class UserSerializer extends Serializer<UserObject, User> {
  /**
   * @inheritDoc
   */
  protected modelClass = User
}
