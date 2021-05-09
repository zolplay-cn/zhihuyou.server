import { Global, Module } from '@nestjs/common'
import { HashService } from '~/services/security/hash.service'
import { DatabaseModule } from '~/modules/database.module'
import { SerializerModule } from '~/modules/serializer.module'

@Global()
@Module({
  imports: [DatabaseModule, SerializerModule],
  providers: [HashService],
  exports: [DatabaseModule, SerializerModule, HashService],
})
export class CoreModule {}
