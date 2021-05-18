import {
  Body,
  Controller,
  Inject,
  Put,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { ProfileService } from '~/services/users/profile.service'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AuthGuard } from '~/guards/auth.guard'
import {
  SaveProfileResponse,
  SaveProfileStatusDto,
  SaveProfileWithStatusDto,
} from '~/types/user/profile'
import { Request } from '~/types/http'
import { ProfileStatusService } from '~/services/users/status.service'
import modelFactory from '~/core/model/model.factory'
import { ProfileClient } from '~/models/profile.model'
import { ProfileStatusClient } from '~/models/profile-status.model'
import { isNumber } from 'class-validator'

@ApiTags('profile')
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  @Inject()
  private readonly service!: ProfileService

  @Inject()
  private readonly statusService!: ProfileStatusService

  @Put()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SaveProfileWithStatusDto })
  @ApiUnauthorizedResponse({ description: 'You muse be logged in to proceed' })
  @ApiOperation({ summary: 'Save the profile of user' })
  @ApiCreatedResponse({ type: SaveProfileResponse })
  async save(@Body() data: SaveProfileWithStatusDto, @Req() { user }: Request) {
    const profile = await this.service.save(data.profile, user!.id)

    const response: SaveProfileResponse = {}

    if (data.status) {
      this.validateStatusDto(data.status)

      response.status = modelFactory.make(
        ProfileStatusClient,
        await this.statusService.save(data.status, profile.id)
      )
    }

    response.profile = modelFactory.make(ProfileClient, profile)

    return response
  }

  /**
   * Validates profile status dto
   *
   * @param data
   * @private
   */
  private validateStatusDto(data: SaveProfileStatusDto): void {
    if (data.clearInterval && !isNumber(data.clearInterval)) {
      throw new BadRequestException('clearInterval must be a number')
    }
  }
}
