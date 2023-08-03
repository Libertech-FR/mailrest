'use strict'
import { AbstractService } from '~/abstract.service'
import { readFileSync } from 'fs'
import { pick } from 'lodash'
import { Injectable } from '@nestjs/common'
import { PackageJson } from 'types-package-json/'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class AppService {
  protected package: Partial<PackageJson>

  public constructor(protected moduleRef: ModuleRef) {
    this.package = JSON.parse(readFileSync('package.json', 'utf-8'))
  }

  public getInfo(): Partial<PackageJson> {
    return pick(this.package, ['name', 'version'])
  }
}
