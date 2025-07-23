import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilsService {
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
