import { Logger } from '@nestjs/common'
import { instanceToInstance, plainToInstance, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min, Validate, ValidateNested, validateOrReject } from 'class-validator'
import { existsSync, readFileSync } from 'node:fs'
import { readFile, writeFile } from 'fs/promises'
import { ImapFlowOptions } from 'imapflow'
import { LRUCache } from 'lru-cache'
import { resolve } from 'node:path'
import { parse, stringify } from 'yaml'
import { UniqueFieldValidator } from '~/_common/validators/unique.field.validator'
import { ApiProperty } from '@nestjs/swagger'

export const ACCOUNTS_FILE_PATH = resolve('./config/accounts.yml')

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
  @ApiProperty()
  public user: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public pass?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public accessToken?: string

  // noinspection JSUnusedGlobalSymbols
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
  @ApiProperty()
  public host: string

  @IsInt()
  @Min(25)
  @Max(65535)
  @IsOptional()
  @ApiProperty()
  public port: number

  @ValidateNested()
  @Type(() => AccountsMetadataImapAuthV1)
  @ApiProperty()
  public auth: AccountsMetadataImapAuthV1

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public secure?: boolean

  @IsString()
  @IsOptional()
  @ApiProperty()
  public servername?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public disableCompression?: boolean

  @IsObject()
  @IsOptional()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-types
  public tls?: object

  @IsInt()
  @Min(5_000)
  @Max(60_000)
  @IsOptional()
  @ApiProperty()
  public maxIdleTime: number = 60_000
}

export class AccountsMetadataSmtpAuthV1 {
  @IsString()
  @ApiProperty()
  public user: string

  @IsString()
  @ApiProperty()
  public pass: string
}

export class AccountsMetadataSmtpV1 {
  @IsString()
  @ApiProperty()
  public host: string

  @IsInt()
  @Min(25, { message: 'Port must be between 25 and 65535' })
  @Max(65535)
  @IsOptional()
  @ApiProperty()
  public port?: number = 25

  @IsString()
  @IsOptional()
  @ApiProperty()
  public from?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public ignoreTLS: boolean = false

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public secure: boolean = true

  @ValidateNested()
  @IsOptional()
  @Type(() => AccountsMetadataSmtpAuthV1)
  @ApiProperty()
  public auth?: AccountsMetadataSmtpAuthV1

  // noinspection JSUnusedGlobalSymbols
  public toJSON() {
    // Fix to hide auth params in JSON.stringify calls
    // NestJS fill arguments with array of data, so we can check it
    // eslint-disable-next-line prefer-rest-params
    if (arguments.length > 0) {
      const data: any = { }
      return data
    }
    return this
  }
}

export class AccountsMetadataWebhooksCronV1 {
  @IsBoolean()
  @ApiProperty()
  public enabled: boolean

  @IsString()
  @ApiProperty()
  public pattern: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public seq: string
}

export enum AccountsMetadataWebhookAlg {
  SHA256 = 'sha256',
}

export class AccountsMetadataWebhooksV1 {
  @IsString()
  @ApiProperty()
  public id: string

  @IsBoolean()
  @ApiProperty()
  public enabled: boolean

  @IsString()
  @ApiProperty()
  public url: string

  @IsString()
  @ApiProperty()
  public secret: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountsMetadataWebhooksCronV1)
  @ApiProperty()
  public cron?: AccountsMetadataWebhooksCronV1

  @IsOptional()
  @IsEnum(AccountsMetadataWebhookAlg)
  @ApiProperty()
  public alg: string = AccountsMetadataWebhookAlg.SHA256

  // noinspection JSUnusedGlobalSymbols
  public toJSON() {
    // Fix to hide auth params in JSON.stringify calls
    // NestJS fill arguments with array of data, so we can check it
    // eslint-disable-next-line prefer-rest-params
    if (arguments.length > 0) {
      const data: any = { ...this }
      if (data.secret) data.secret = '******'
      return data
    }
    return this
  }
}

export class AccountsMetadataV1 {
  [key: string]: unknown

  @IsString()
  @ApiProperty()
  public id: string

  @IsString()
  @ApiProperty()
  public name: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountsMetadataImapV1)
  @ApiProperty()
  public imap?: AccountsMetadataImapV1

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountsMetadataSmtpV1)
  @ApiProperty()
  public smtp?: AccountsMetadataSmtpV1

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AccountsMetadataWebhooksV1)
  @Validate(UniqueFieldValidator, ['id'])
  @ApiProperty({ type: [AccountsMetadataWebhooksV1] })
  public webhooks?: AccountsMetadataWebhooksV1[]
}

export default async function setupAccounts(): Promise<AccountsMetadataV1[]> {
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

export async function validateAccounts(): Promise<AccountsMetadataV1[]> {
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
