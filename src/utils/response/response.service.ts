import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  success(message: string, data: any = null, status = HttpStatus.OK) {
    return {
      success: true,
      statusCode: status,
      message,
      data,
    };
  }

  error(message: string, status = HttpStatus.BAD_REQUEST, data: any = null) {
    return {
      success: false,
      statusCode: status,
      message,
      data,
    };
  }
}
