export const errMsg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

export const errStack = (e: unknown): string | undefined =>
  e instanceof Error ? e.stack : undefined;

type AxiosLike = { response?: { status?: number; data?: unknown } };
const asAxios = (e: unknown): AxiosLike | null =>
  typeof e === 'object' && e !== null ? (e as AxiosLike) : null;

export const isAxios401 = (e: unknown): boolean =>
  asAxios(e)?.response?.status === 401;

export const axiosDetail = (e: unknown): unknown =>
  asAxios(e)?.response?.data ?? asAxios(e)?.response?.status ?? errMsg(e);
