import {
  Inject,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthService } from '../types/auth-service.type.js';
import { Request } from 'express';
import { ModuleConfigurationService } from '../../configuration/module/module-configuration.service.js';
import { ConfigJwtJwkAuthType } from '../../configuration/config.type.js';
import { JwtService } from '@nestjs/jwt';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { User } from '../user.js';

@Injectable()
export class JwtJwkAuthService implements IAuthService {
  private jwkSet: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    @Inject('AUTH_CONFIG')
    private readonly authConfigService: ModuleConfigurationService<ConfigJwtJwkAuthType>,
  ) {
    this.jwkSet = createRemoteJWKSet(new URL(authConfigService.get().jwkUrl));
  }

  public async signIn(
    username: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    throw new NotImplementedException();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  public async validateRequest(request: any): Promise<User> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.debug('could not get token from header');
      throw new UnauthorizedException();
    }

    let user;

    try {
      const jwtData = await jwtVerify(token, this.jwkSet);

      user = {
        id: jwtData.payload.sub,
      };
      request['user'] = user;
    } catch (error) {
      console.debug('could not verify jwt', error);

      throw new UnauthorizedException(error);
    }

    return new User({
      id: user.id,
      accessToken: token,
    });
  }
}
