// lib/fetcher.ts
export const fetcher = (url: string) => fetch(url).then(r => r.json());
