import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import safeStringify from 'fast-safe-stringify';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly sensitiveFields = [
    'password',
    'token',
    'authorization',
    'creditCard',
  ];
  private readonly maxBodySize = 1024; // 1KB

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = crypto.randomBytes(8).toString('hex');
    const startTime = process.hrtime();

    // Log request details
    this.logRequest(requestId, req);

    // Capture response details
    const originalSend = res.send;
    const chunks: Buffer[] = [];

    res.send = (body: any): Response => {
      chunks.push(Buffer.from(body));
      return originalSend.call(res, body);
    };

    // Handle response finish
    res.on('finish', () => {
      const totalTime = process.hrtime(startTime);
      const responseTime = totalTime[0] * 1000 + totalTime[1] / 1000000;
      const responseBody = Buffer.concat(chunks).toString('utf8');

      this.logResponse(requestId, req, res, responseTime, responseBody);
    });

    // Handle errors
    res.on('error', (error) => {
      this.logger.error(
        `[${requestId}] Response error: ${error.message}`,
        error.stack,
      );
    });

    next();
  }

  private logRequest(requestId: string, req: Request) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      query: this.sanitizeData(req.query),
      params: req.params,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeData(req.body),
      clientIp: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || '',
    };

    this.logger.log(
      `[${requestId}] Incoming request: ${safeStringify(logData)}`,
    );
  }

  private logResponse(
    requestId: string,
    req: Request,
    res: Response,
    responseTime: number,
    responseBody: string,
  ) {
    const statusCode = res.statusCode;
    const logLevel =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

    const logData = {
      statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      contentLength: res.getHeader('content-length') || '0',
      body: this.sanitizeResponseBody(
        responseBody,
        res.getHeader('content-type') as string,
      ),
    };

    const message = `[${requestId}] ${req.method} ${req.originalUrl} ${statusCode} [${responseTime.toFixed(2)}ms]`;

    if (logLevel === 'log') {
      this.logger.log(`${message} - ${safeStringify(logData)}`);
    } else if (logLevel === 'warn') {
      this.logger.warn(`${message} - ${safeStringify(logData)}`);
    } else {
      this.logger.error(`${message} - ${safeStringify(logData)}`);
    }
  }

  private sanitizeHeaders(headers: Record<string, any>) {
    const sanitized = { ...headers };

    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;

    // Shorten long headers
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] && sanitized[key].length > 256) {
        sanitized[key] = `${sanitized[key].substring(0, 64)}... [truncated]`;
      }
    });

    return sanitized;
  }

  private sanitizeData(data: any) {
    if (!data) return data;

    const sanitized = JSON.parse(safeStringify(data));

    // Recursively sanitize sensitive fields
    const sanitize = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
          obj[key] = '******';
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    };

    sanitize(sanitized);
    return sanitized;
  }

  private sanitizeResponseBody(body: string, contentType = '') {
    if (!body || !contentType.includes('application/json')) return '[non-json]';

    try {
      const parsed = JSON.parse(body);
      return this.sanitizeData(parsed);
    } catch (e) {
      return body.length > this.maxBodySize
        ? `${body.substring(0, this.maxBodySize)}... [truncated]`
        : body;
    }
  }
}
