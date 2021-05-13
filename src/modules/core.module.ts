import { Global, Module } from '@nestjs/common'
import { HashService } from '~/services/security/hash.service'
import { DatabaseModule } from '~/modules/database.module'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [HashService],
  exports: [DatabaseModule, HashService],
})
export class CoreModule {}
