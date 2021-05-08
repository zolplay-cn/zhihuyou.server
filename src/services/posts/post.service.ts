import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { PostSubmitDto } from '~/types/post'
import { Post } from '@prisma/client'

@Injectable()
export class PostService {
  @Inject()
  private readonly db!: DatabaseService

  /**
   * create a new post
   *
   * @param submit
   * @param authorId
   */
  async create(submit: PostSubmitDto, authorId: string): Promise<Post> {
    return await this.db.post.create({
      data: {
        authorId,
        ...submit,
      },
    })
  }

  /**
   * update a post
   * @param submit
   * @param id
   * @param authorId
   */
  async update(
    submit: PostSubmitDto,
    id: string,
    authorId: string
  ): Promise<Post> {
    let post = await this.db.post.findFirst({ where: { id } })

    if (!post) {
      throw new NotFoundException(`not post found for id: ${id}`)
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException("you haven't permission to update")
    }

    post = await this.db.post.update({
      where: { id },
      data: submit,
    })

    return post
  }

  /**
   * delete a post by id
   * @param id
   * @param authorId
   */
  async delete(id: string, authorId: string): Promise<void> {
    const post = await this.db.post.findFirst({ where: { id } })

    if (!post) {
      throw new NotFoundException(`not post found for id: ${id}`)
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException("you haven't permission to update")
    }

    try {
      this.db.post.delete({ where: { id } })
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * get a post by post_id
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
      throw new NotFoundException(`Not post found for id: ${id}`)
    }

    return post
  }

  /**
   * get all posts
   */
  async all(): Promise<Array<Post>> {
    const posts = await this.db.post.findMany({
      where: {
        published: true,
      },
    })

    if (posts.length === 0) {
      throw new NotFoundException('no posts had found')
    }

    return posts
  }
}
