import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { CreatePostDto, UpdatePostDto } from '~/types/post'
import { Post } from '@prisma/client'

@Injectable()
export class PostsService {
  @Inject()
  private readonly db!: DatabaseService

  /**
   * Creates a new post.
   *
   * @param data
   * @param authorId
   */
  async create(data: CreatePostDto, authorId: string): Promise<Post> {
    return await this.db.post.create({
      data: {
        ...data,
        authorId,
      },
    })
  }

  /*
   * Updates a post.
   *
   * @param data
   * @param id
   * @param authorId
   */
  async update(
    data: UpdatePostDto,
    id: string,
    authorId: string
  ): Promise<Post> {
    let post = await this.db.post.findFirst({ where: { id } })

    if (!post) {
      throw new NotFoundException(`Post cannot be found for id: ${id}.`)
    }

    if (post.authorId !== authorId) {
      throw new UnauthorizedException(
        "You don't have the permission to update this post."
      )
    }

    post = await this.db.post.update({
      where: { id },
      data: data,
    })

    return post
  }

  /**
   * Deletes a post by id.
   *
   * @param id
   * @param authorId
   */
  async delete(id: string, authorId: string): Promise<void> {
    const post = await this.db.post.findUnique({ where: { id } })

    if (!post) {
      throw new NotFoundException(`Post cannot be found for id: ${id}.`)
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException(
        "You don't have the permission to delete this post."
      )
    }

    try {
      await this.db.post.delete({ where: { id } })
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * Finds a post by id.
   *
   * @param id post_id
   */
  async findById(id: string): Promise<Post> {
    const post = await this.db.post.findFirst({
      where: {
        id,
        published: true,
      },
    })

    if (!post) {
      throw new NotFoundException(`Post cannot be found for id: ${id}.`)
    }

    return post
  }

  /**
   * Gets all posts.
   */
  async getAll(): Promise<Array<Post>> {
    return await this.db.post.findMany({
      where: {
        published: true,
      },
    })
  }
}
