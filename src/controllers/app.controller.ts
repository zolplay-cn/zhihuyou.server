import { Controller, Get } from '@nestjs/common'
import { AppService } from '~/services/app.service'
import { ApiOkResponse } from '@nestjs/swagger'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ description: 'Home route for demo. Will be deleted later.' })
  getHello(): string {
    return this.appService.getHello()
  }
}
