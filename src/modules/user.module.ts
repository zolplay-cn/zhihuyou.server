import { Module } from '@nestjs/common'
import { UserService } from '~/services/users/user.service'
import { AuthController } from '~/controllers/users/auth.controller'
import { UsersController } from '~/controllers/users/users.controller'

@Module({
  imports: [],
  providers: [UserService],
  controllers: [AuthController, UsersController],
  exports: [UserService],
})
export class UserModule {}
