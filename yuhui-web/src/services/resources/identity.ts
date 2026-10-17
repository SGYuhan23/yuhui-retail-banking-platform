import { json, serviceUrl } from '../transport/client';

export async function user_login_methods() {
  return json<API.BaseResponse<API.LoginMethod[]>>('GET', `/user/login-methods`);
}

export async function user_login(options: { username: string; password: string }) {
  return json<API.BaseResponse<API.UserLoginResponse>>('POST', `/user/login`, options);
}

export async function user_send_code(options: { method: API.LoginMethod; target: string }) {
  return json<API.BaseResponse<void>>('POST', `/user/send-code`, options);
}

export async function user_login_by_code(options: {
  method: API.LoginMethod;
  target: string;
  code: string;
}) {
  return json<API.BaseResponse<API.UserLoginResponse>>('POST', `/user/login-by-code`, options);
}

export function oauth_authorize_url(provider: string) {
  return serviceUrl(`/user/oauth/${provider}/authorize`);
}

export async function user_refresh(refreshToken: string) {
  return json<API.BaseResponse<API.UserLoginResponse>>('POST', `/user/refresh`, { refreshToken });
}

export async function user_logout(refreshToken?: string) {
  return json<API.BaseResponse<void>>('POST', `/user/logout`, refreshToken ? { refreshToken } : {});
}

export async function user_me() {
  return json<API.BaseResponse<API.UserInfoResponse>>('GET', `/user/me`);
}

export async function auth_users(keyword = '', page = 1, size = 10) {
  return json<API.BaseResponse<API.AuthPage<API.AuthUser>>>('GET', `/auth/users?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
}

export async function auth_user_detail(userId: string) {
  return json<API.BaseResponse<API.AuthUser>>('GET', `/auth/users/${userId}`);
}

export async function auth_user_update(userId: string, data: Partial<API.AuthUserUpdate>) {
  return json<API.BaseResponse<void>>('PUT', `/auth/users/${userId}`, data);
}

export async function auth_user_status(userId: string, status: 0 | 1) {
  return json<API.BaseResponse<void>>('PUT', `/auth/users/${userId}/status`, { status });
}

export async function auth_user_assign_roles(userId: string, roleIds: string[]) {
  return json<API.BaseResponse<void>>('PUT', `/auth/users/${userId}/roles`, { roleIds });
}

export async function auth_user_delete(userId: string) {
  return json<API.BaseResponse<void>>('DELETE', `/auth/users/${userId}`);
}

export async function auth_roles() {
  return json<API.BaseResponse<API.AuthRole[]>>('GET', `/auth/roles`);
}

export async function auth_role_create(data: { code: string; name: string; description?: string }) {
  return json<API.BaseResponse<API.AuthRole>>('POST', `/auth/roles`, data);
}

export async function auth_role_update(roleId: string, data: { name: string; description?: string }) {
  return json<API.BaseResponse<void>>('PUT', `/auth/roles/${roleId}`, data);
}

export async function auth_role_delete(roleId: string) {
  return json<API.BaseResponse<void>>('DELETE', `/auth/roles/${roleId}`);
}

export async function auth_role_assign_permissions(roleId: string, permissionIds: string[]) {
  return json<API.BaseResponse<void>>('PUT', `/auth/roles/${roleId}/permissions`, { permissionIds });
}

export async function auth_permissions() {
  return json<API.BaseResponse<API.AuthPermission[]>>('GET', `/auth/permissions`);
}

export async function auth_permission_create(data: {
  code: string;
  name: string;
  resource?: string;
  action?: string;
  description?: string;
}) {
  return json<API.BaseResponse<API.AuthPermission>>('POST', `/auth/permissions`, data);
}

export async function auth_permission_delete(permissionId: string) {
  return json<API.BaseResponse<void>>('DELETE', `/auth/permissions/${permissionId}`);
}

export async function auth_login_methods() {
  return json<API.BaseResponse<API.AuthLoginMethodConfig[]>>('GET', `/auth/login-methods`);
}

export async function auth_login_method_save(
  method: string,
  data: { enabled: 0 | 1; usePlatformConfig: 0 | 1; configJson?: string },
) {
  return json<API.BaseResponse<void>>('PUT', `/auth/login-methods/${encodeURIComponent(method)}`, data);
}
