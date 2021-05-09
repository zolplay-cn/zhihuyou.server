import { Request as ExpressRequest } from 'express'
import { User } from '~/models/user.model'

export interface Request extends ExpressRequest {
  user: User
}
