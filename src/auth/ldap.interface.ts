'use strict'

export interface UserInterface {
  [key: string]: any

  dn: string
  controls: any[]
  cn?: string
  memberOf?: string | string[]
  mail?: string
}
