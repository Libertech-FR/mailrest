function commonPipe(prefix: string, search: string, fields: string[]): string {
  const filters = []
  for (const field of fields) {
    filters.push(`${field}=${search}`)
  }
  return prefix + '(' + filters.join(')(') + ')'
}

export function pipeOr(search: string, fields: string[]): string {
  return commonPipe('|', search, fields)
}

export function pipeAnd(search: string, fields: string[]): string {
  return commonPipe('&', search, fields)
}
