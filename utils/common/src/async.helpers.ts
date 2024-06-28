export async function asyncLimitSeries<T>(
  limit: number,
  fn: (i: number) => Promise<T>
): Promise<T[]> {
  let response = []

  for (let i = 0; i < limit; i++) {
    const res = await fn(i)
    response.push(res)
  }

  return response
}
