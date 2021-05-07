import { Module } from '@nestjs/common'
import { UserService } from '~/services/users/user.service'
import { UsersController } from '~/controllers/users/users.controller'

@Module({
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UserModule {}
