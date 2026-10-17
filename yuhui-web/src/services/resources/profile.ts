import { json, multipart, serviceUrl } from '../transport/client';
import { getAuthToken } from '@/utils/auth';

export async function user_profile() {
  return json<API.BaseResponse<API.AuthUser>>('GET', `/user/profile`);
}

export async function user_profile_update(data: Partial<API.AuthUserUpdate>) {
  return json<API.BaseResponse<void>>('PUT', `/user/profile`, data);
}

export async function user_profile_password(oldPassword: string, newPassword: string) {
  return json<API.BaseResponse<void>>('PUT', `/user/profile/password`, { oldPassword, newPassword });
}

export async function user_profile_avatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return multipart<API.BaseResponse<{ url: string }>>('POST', `/user/profile/avatar`, formData);
}

export async function user_profile_oauth_bindings() {
  return json<API.BaseResponse<API.AuthOAuthBinding[]>>('GET', `/user/profile/oauth-bindings`);
}

export function oauth_bind_authorize_url(provider: string) {
  const token = getAuthToken();
  const query = token ? `?access_token=${encodeURIComponent(token)}` : '';
  return serviceUrl(`/user/profile/oauth-bindings/${provider}/authorize${query}`);
}

export async function user_profile_oauth_unbind(provider: string) {
  return json<API.BaseResponse<void>>('DELETE', `/user/profile/oauth-bindings/${provider}`);
}

export async function user_profile_bind_email(method: string, target: string, code: string) {
  return json<API.BaseResponse<void>>('POST', `/user/profile/email`, { method, target, code });
}

export async function user_profile_unbind_email() {
  return json<API.BaseResponse<void>>('DELETE', `/user/profile/email`);
}

export async function user_profile_bind_phone(method: string, target: string, code: string) {
  return json<API.BaseResponse<void>>('POST', `/user/profile/phone`, { method, target, code });
}

export async function user_profile_unbind_phone() {
  return json<API.BaseResponse<void>>('DELETE', `/user/profile/phone`);
}
