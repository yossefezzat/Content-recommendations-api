import { Injectable } from '@nestjs/common';
import { Content } from '../entities/content.entity';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ContentRepository extends Repository<Content> {
  constructor(private readonly dataSource: DataSource) {
      super(Content, dataSource.createEntityManager());
  }

  async createContent(contentData: Partial<Content>): Promise<Content> {
    const content = this.create(contentData);
    return this.save(content);
  }

  applyTypeFilter(queryBuilder: SelectQueryBuilder<Content>, type?: string) {
    if (type) {
      queryBuilder.andWhere('content.type = :type', { type });
    }
  }
  
  applyTagFilters(queryBuilder: SelectQueryBuilder<Content>, tags?: string[]) {
    if (!tags || tags.length === 0) return;
  
    const tagConditions = tags.map((_, index) => `content.tags LIKE :tag${index}`);
    const tagParams = Object.fromEntries(
      tags.map((tag, i) => [`tag${i}`, `%${tag}%`]),
    );
  
    queryBuilder.andWhere(`(${tagConditions.join(' OR ')})`, tagParams);
  }
  
  applySorting(queryBuilder: SelectQueryBuilder<Content>) {
    queryBuilder.orderBy('content.createdAt', 'DESC');
  }
  
  applyPagination(
    queryBuilder: SelectQueryBuilder<Content>,
    page: number,
    pageSize: number,
  ) {
    const offset = (page - 1) * pageSize;
    queryBuilder.skip(offset).take(pageSize);
  }
}