import { Redis } from '@nestjs-modules/ioredis'
import { Logger } from '@nestjs/common'
import { instanceToInstance, plainToInstance, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min, Validate, ValidateNested, validateOrReject } from 'class-validator'
import { existsSync, readFileSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { ImapFlowOptions } from 'imapflow'
import { LRUCache } from 'lru-cache'
import { dirname, join } from 'path'
import { parse, stringify } from 'yaml'
import { UniqueFieldValidator } from '~/unique.field.validator'

export const ACCOUNTS_FILE_PATH = join(dirname(dirname(dirname(__dirname))), '/config/accounts.yml') // TODO: change dirname

export class AccountsFileV1 {
  @IsEnum(['1'])
  public version: string

  @ValidateNested({ each: true })
  @Validate(UniqueFieldValidator, ['id'])
  @Type(() => AccountsMetadataV1)
  public accounts: AccountsMetadataV1[]
}

export class AccountsMetadataImapAuthV1 {
  @IsString()
  public user: string

  @IsString()
  @IsOptional()
  public pass?: string

  @IsString()
  @IsOptional()
  public accessToken?: string

  public toJSON() {
    // Fix to hide auth params in JSON.stringify calls
    // NestJS fill arguments with array of data, so we can check it
    // eslint-disable-next-line prefer-rest-params
    if (arguments.length > 0) {
      const data: any = { user: '******' }
      if (this.pass) data.pass = '******'
      if (this.accessToken) data.accessToken = '******'
      return data
    }
    return this
  }
}

export class AccountsMetadataImapV1 implements ImapFlowOptions {
  @IsString()
  public host: string

  @IsInt()
  @Min(25)
  @Max(65535)
  @IsOptional()
  public port: number

  @ValidateNested()
  @Type(() => AccountsMetadataImapAuthV1)
  public auth: AccountsMetadataImapAuthV1

  @IsBoolean()
  @IsOptional()
  public secure?: boolean

  @IsString()
  @IsOptional()
  public servername?: string

  @IsBoolean()
  @IsOptional()
  public disableCompression?: boolean

  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/ban-types
  public tls?: object
}

export class AccountsMetadataSmtpV1 {
  @IsString()
  public host: string

  @IsInt()
  @Min(25, { message: 'Port must be between 25 and 65535' })
  @Max(65535)
  @IsOptional()
  public port?: number = 25

  @IsBoolean()
  @IsOptional()
  public tls: boolean = false

  @IsString()
  public username: string

  @IsString()
  public password: string

  public toJSON() {
    return {}
  }
}

export class AccountsMetadataV1 {
  [key: string]: unknown

  @IsString()
  public id: string

  @IsString()
  public name: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountsMetadataImapV1)
  public imap?: AccountsMetadataImapV1

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountsMetadataSmtpV1)
  public smtp?: AccountsMetadataSmtpV1
}

export default async function setupAccounts(): Promise<any[]> {
  try {
    if (existsSync(ACCOUNTS_FILE_PATH)) {
      Logger.verbose('Account file found, validating...', 'setupAccounts')
      return await validateAccounts()
    }
  } catch (err) {
    Logger.error(err)
    process.exit(1)
  }
}

export async function validateAccounts(): Promise<any[]> {
  const data = readFileSync(ACCOUNTS_FILE_PATH, 'utf8')
  const yml = parse(data)
  const schema = plainToInstance(AccountsFileV1, yml)

  try {
    await validateOrReject(schema, {
      whitelist: true,
    })
  } catch (errors) {
    const err = new Error(`Invalid accounts`)
    err.message = errors.map((e) => e.toString()).join(', ') //TODO: improve error message
    throw err
  }

  return yml.accounts
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export async function writeAccountsFile(data: AccountsFileV1, cache?: LRUCache<string, AccountsFileV1>): Promise<void> {
  const schema = instanceToInstance(data)
  try {
    await validateOrReject(schema, {
      whitelist: true,
    })
    const yml = stringify(schema)
    await writeFile(ACCOUNTS_FILE_PATH, yml)
    if (cache) {
      Logger.debug(`writeAccountsFile: ${ACCOUNTS_FILE_PATH} to cache`, 'setup/writeAccountsFile')
      cache.set(ACCOUNTS_FILE_PATH, schema)
    }
  } catch (errors) {
    console.log('errors', errors)
    const err: Error & any = new Error(`Invalid accounts`)
    err.message = errors.map((e) => e.toString()).join(', ') //TODO: improve error message
    err.errors = errors.map((e) => e.toString()) //TODO: improve error message
    throw err
  }
}

export async function readAccountsFile(cache?: LRUCache<string, AccountsFileV1>): Promise<AccountsFileV1> {
  if (cache && cache.has(ACCOUNTS_FILE_PATH)) {
    Logger.debug(`readAccountsFile: ${ACCOUNTS_FILE_PATH} from cache`, 'setup/readAccountsFile')
    return cache.get(ACCOUNTS_FILE_PATH)
  }
  const data = await readFile(ACCOUNTS_FILE_PATH, 'utf8')
  const yml = parse(data)
  const schema = plainToInstance(AccountsFileV1, yml)
  if (cache && !cache.has(ACCOUNTS_FILE_PATH)) {
    Logger.debug(`readAccountsFile: ${ACCOUNTS_FILE_PATH} to cache`, 'setup/readAccountsFile')
    cache.set(ACCOUNTS_FILE_PATH, schema)
  }
  return schema
}
