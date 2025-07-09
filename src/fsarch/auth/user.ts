import type { IUser } from './types/auth-service.type.js';

export class User implements IUser {
  private readonly id: string;
  private readonly accessToken: string;

  constructor(data: { id: string, accessToken: string }) {
    this.id = data.id;
    this.accessToken = data.accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getId() {
    return this.id;
  }
}
