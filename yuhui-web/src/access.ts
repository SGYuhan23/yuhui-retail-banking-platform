/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const roles = currentUser?.roles || [];
  return {
    canAdmin: currentUser?.access === 'admin' || roles.includes('ROLE_ADMIN'),
  };
}
