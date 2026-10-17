import { json } from '../transport/client';

/** ERP uses POST commands even for removal. Keep this wire protocol in one place. */
export function configurationResource<Row>(collection: string, command: string) {
  const commandPath = (verb: string) => `/erp/${collection}/${verb}_${command}`;
  const save = (verb: string) => async (values?: Record<string, any>) =>
    json<API.CommonResponse>('POST', commandPath(verb), values);

  return {
    list: async () => json<Row>('GET', commandPath('query')),
    create: save('add'),
    update: save('update'),
    remove: async (id: any) => json<API.CommonResponse>('POST', `${commandPath('delete')}/${id}`),
  };
}
