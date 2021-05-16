import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import {
  CreateUserDto,
  ForceUpdatePasswordDto,
  SearchUserDto,
  UpdatePasswordDto,
  UpdatePasswordSuccessfulResponse,
  UpdateRoleDto,
  UpdateUserDto,
} from '~/types/user/user'
import { Role } from '@prisma/client'
import { Roles } from '~/core/decorators/roles.decorator'
import { AdminUserService } from '~/services/users/admin.service'
import { User } from '~/models/user.model'
import { Serializer } from '~/core/decorators/serializer.decorator'
import { UserService } from '~/services/users/user.service'
import { Request } from '~/types/http'

@ApiTags('user')
@Controller('users')
export class UsersController {
  @Inject()
  private readonly service!: AdminUserService

  @Inject()
  private readonly userService!: UserService

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiConflictResponse({ description: 'Email ${input} already exists.' })
  @ApiCreatedResponse({ type: User })
  @Serializer(User)
  async create(@Body() data: CreateUserDto) {
    return await this.service.create(data)
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateUserDto })
  @ApiNotFoundResponse({ description: 'The User to update is not found.' })
  @ApiOperation({ summary: 'Updates a user' })
  @ApiOkResponse({ type: User })
  @Serializer(User)
  async update(@Body() data: UpdateUserDto, @Param('id') id: string) {
    return await this.service.update(data, id)
  }

  @Put('password/:id')
  @Roles(Role.ADMIN)
  @ApiBody({ type: ForceUpdatePasswordDto })
  @ApiNotFoundResponse({ description: 'The User to update is not found.' })
  @ApiOperation({ summary: 'Updates a user password' })
  @ApiOkResponse({ type: UpdatePasswordSuccessfulResponse })
  async updatePassword(
    @Body() data: ForceUpdatePasswordDto,
    @Param('id') id: string
  ) {
    return {
      data: await this.service.updatePassword(data, id),
    }
  }

  @Put('role/:id')
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateRoleDto })
  @ApiNotFoundResponse({ description: 'The User to update is not found.' })
  @ApiOperation({ summary: 'Updates a user role' })
  @ApiOkResponse({ type: User })
  @Serializer(User)
  async updateRole(@Body() data: UpdateRoleDto, @Param('id') id: string) {
    return await this.service.updateRole(data, id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiNotFoundResponse({ description: 'The User to delete does not exists.' })
  @ApiOkResponse({ type: User, description: 'return already deleted user' })
  @ApiOperation({ summary: 'Deletes a user' })
  @Serializer(User)
  async remove(@Param('id') id: string) {
    return await this.service.remove(id)
  }

  @Get('search')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: User, isArray: true })
  @ApiQuery({ type: SearchUserDto })
  @ApiOperation({ summary: 'Search users by email/firstname/lastname' })
  @Serializer(User)
  async search(@Query() data: SearchUserDto) {
    return await this.service.search(data)
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: User })
  @Serializer(User)
  async getUser(@Param('id') id: string) {
    return await this.service.getUser(id)
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: User, isArray: true })
  @Serializer(User)
  async getAllUser() {
    return await this.service.getAllUser()
  }

  @Put('update/me')
  @Roles(Role.USER)
  @ApiBody({ type: UpdateUserDto })
  @ApiForbiddenResponse({ description: "You don't have the permission." })
  @ApiOperation({ summary: 'Updates own user info' })
  @ApiOkResponse({ type: User })
  @Serializer(User)
  async updateMe(@Body() data: UpdateUserDto, @Req() { user }: Request) {
    return await this.userService.update(data, user!.id)
  }

  @Put('me/password')
  @Roles(Role.USER)
  @ApiBody({ type: UpdatePasswordDto })
  @ApiOperation({ summary: 'Updates own password' })
  @ApiOkResponse({ type: UpdatePasswordSuccessfulResponse })
  @ApiBadRequestResponse({ description: 'password is incorrect' })
  async updateMyPassword(
    @Body() data: UpdatePasswordDto,
    @Req() { user }: Request
  ) {
    return {
      data: await this.userService.updatePassword(data, user!.id),
    }
  }
}
