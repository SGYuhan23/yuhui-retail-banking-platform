/** Local deployments retain root URLs; Pages uses its repository subdirectory. */
export function sitePath(path: string): string {
  return process.env.PAGES_DEMO && path.startsWith('/')
    ? `${process.env.PAGES_BASE || '/'}${path.slice(1)}`
    : path;
}
