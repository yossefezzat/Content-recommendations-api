import * as _ from 'lodash';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export enum ApplicationAgents {
  CONTENT_RECOMMENDATION_API = 'content-recommendation-api',
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private API_KEYS;

  constructor() {
    this.API_KEYS = [
      {
        key: process.env.API_KEY,
        application: ApplicationAgents.CONTENT_RECOMMENDATION_API,
      },
    ];
    
  }

  async use(req: Request, res: Response, next: () => any) {
    const apiKey = req.get('x-apiKey') || this.getApiKey(req.query.apiKey);

    if (!this.validateApiKey(apiKey)) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Api key is invalid',
      });
    }

    next();
  }
  
  private getApiKey(apiKey) {
    return apiKey ? apiKey : undefined;
  }

  private validateApiKey(apiKey): boolean {
    return this.API_KEYS.map((k) => k.key).includes(apiKey);
  }
}