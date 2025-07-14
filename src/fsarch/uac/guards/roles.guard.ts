import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UacService } from '../uac.service.js';
import { User } from "../../auth/user.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly uacService: UacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user as User;

    for (const role of requiredRoles) {
      if (await this.uacService.hasGrant(user.getId(), [role])) {
        return true;
      }
    }

    return false;
  }
}
