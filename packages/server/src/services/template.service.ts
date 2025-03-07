import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import * as lodash from 'lodash';
import { TemplateEntity } from '@entities/template.entity';
import { OutUser, UserService } from '@services/user.service';
import { TemplateDto } from '@dtos/template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepo: Repository<TemplateEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  /**
   * 按 id 查取
   * @param user
   * @param dto
   * @returns
   */
  public async findById(id: string) {
    const document = await this.templateRepo.findOne(id);
    return instanceToPlain(document);
  }

  /**
   * 按 id 查取一组
   * @param user
   * @param dto
   * @returns
   */
  public async findByIds(ids: string[]) {
    const documents = await this.templateRepo.findByIds(ids);
    return documents.map((doc) => instanceToPlain(doc));
  }

  /**
   * 新建模板
   * @param user
   * @param dto
   * @returns
   */
  async create(user: OutUser, dto: TemplateDto) {
    const data = {
      createUserId: user.id,
      ...dto,
      content: '{}',
      state: Buffer.from(new Uint8Array()),
    };
    const res = await this.templateRepo.create(data);
    const ret = await this.templateRepo.save(res);
    return ret;
  }

  /**
   * 更新模板
   * @param id
   * @param tag
   */
  async getTemplate(user, id) {
    const template = await this.templateRepo.findOne(id);

    if (user.id !== template.createUserId && !template.isPublic) {
      throw new HttpException('您不是模板创建者，无法编辑', HttpStatus.FORBIDDEN);
    }

    const createUser = await this.userService.findById(template.createUserId);
    // @ts-ignore
    template.createUser = createUser;
    return template;
  }

  /**
   * 更新模板
   * @param id
   * @param tag
   */
  async updateTemplate(user, id, dto: TemplateDto & { id: string }) {
    const old = await this.templateRepo.findOne(id);

    if (user.id !== old.createUserId) {
      throw new HttpException('您不是模板创建者，无法编辑', HttpStatus.FORBIDDEN);
    }

    const newData = await this.templateRepo.merge(old, dto);
    return this.templateRepo.save(newData);
  }

  async deleteTemplate(user, id) {
    const data = await this.templateRepo.findOne(id);
    if (user.id !== data.createUserId) {
      throw new HttpException('您不是模板创建者，无法删除', HttpStatus.FORBIDDEN);
    }
    return this.templateRepo.remove(data);
  }

  /**
   * 更新模板使用量
   * @param user
   * @param templateId
   * @returns
   */
  async useTemplate(user: OutUser, templateId) {
    const data = await this.templateRepo.findOne(templateId);
    if (user.id !== data.createUserId && !data.isPublic) {
      throw new HttpException('您不是模板创建者，无法编辑', HttpStatus.FORBIDDEN);
    }
    const newData = await this.templateRepo.merge(data, {
      usageAmount: data.usageAmount + 1,
    });
    return this.templateRepo.save(newData);
  }

  /**
   * 获取公开模板
   * @param queryParams
   * @returns
   */
  async getPublicTemplates(queryParams) {
    const query = this.templateRepo
      .createQueryBuilder('template')
      .where('template.isPublic=:isPublic')
      .orderBy('template.createdAt', 'DESC')
      .setParameter('isPublic', true);

    const { page = 1, pageSize = 12 } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);
    const [data, count] = await query.getManyAndCount();

    await Promise.all(
      data.map(async (template) => {
        const createUser = await this.userService.findById(template.createUserId);
        // @ts-ignore
        template.createUser = createUser;
        return template;
      })
    );

    return { data, total: count };
  }

  /**
   * 获取个人模板
   * @param queryParams
   * @returns
   */
  async getOwnTemplates(user: OutUser, queryParams) {
    const query = this.templateRepo
      .createQueryBuilder('template')
      .where('template.createUserId=:createUserId')
      .orderBy('template.createdAt', 'DESC')
      .setParameter('createUserId', user.id);
    const { page = 1, pageSize = 12 } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);
    const [data, count] = await query.getManyAndCount();

    await Promise.all(
      data.map(async (template) => {
        const createUser = await this.userService.findById(template.createUserId);
        // @ts-ignore
        template.createUser = createUser;
        return template;
      })
    );

    return { data, total: count };
  }
}
