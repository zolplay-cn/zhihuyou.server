import { Module } from '@nestjs/common'
import { ProfileService } from '~/services/users/profile.service'
import { ProfileStatusService } from '~/services/users/status.service'
import { ProfileController } from '~/controllers/users/profile.controller'

@Module({
  providers: [ProfileService, ProfileStatusService],
  controllers: [ProfileController],
  exports: [ProfileService, ProfileStatusService],
})
export class ProfileModule {}
