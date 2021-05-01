import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super()
  }

  onModuleInit = async () => await this.$connect()
  onModuleDestroy = async () => await this.$disconnect()
}
