import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreatePostDto, UpdatePostDto } from '~/types/post'
import modelFactory from '~/core/model/model.factory'
import { Post } from '~/models/post.model'
import { CoreService } from '~/services/common/core.service'

@Injectable()
export class PostsService extends CoreService {
  protected getLangUseModel(): string {
    return 'Post'
  }

  /**
   * Creates a new post.
   *
   * @param data
   * @param authorId
   */
  async create(data: CreatePostDto, authorId: string) {
    return new Post(
      await this.db.post.create({
        data: {
          ...data,
          authorId,
        },
      })
    )
  }

  /**
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
  ): Promise<Post | undefined> {
    const post = await this.db.post.findFirst({ where: { id } })

    if (!post) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.id', { args: { id } })
      )
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException(
        await this.lang.get('error.bad_request.update')
      )
    }

    return new Post(
      await this.db.post.update({
        where: { id },
        data: data,
      })
    )
  }

  /**
   * Deletes a post by id.
   *
   * @param id
   * @param authorId
   */
  async delete(id: string, authorId: string) {
    const post = await this.db.post.findUnique({ where: { id } })

    if (!post) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.id', { args: { id } })
      )
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException(
        await this.lang.get('error.bad_request.delete')
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
  async findById(id: string) {
    const post = await this.db.post.findFirst({
      where: {
        id,
        published: true,
      },
    })

    if (!post) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.id', { args: { id } })
      )
    }

    return new Post(post)
  }

  /**
   * Gets all posts.
   */
  async getAll() {
    return modelFactory.makeAll(
      Post,
      await this.db.post.findMany({
        where: {
          published: true,
        },
      })
    )
  }
}
