import { Module } from '@nestjs/common'
import { AdminUserService } from '~/services/users/admin.service'
import { UsersController } from '~/controllers/users/users.controller'
import { UserService } from '~/services/users/user.service'

@Module({
  providers: [AdminUserService, UserService],
  controllers: [UsersController],
  exports: [AdminUserService, UserService],
})
export class UserModule {}
