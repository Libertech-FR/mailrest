import { Logger } from '@nestjs/common'
import { plainToInstance, Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Max,
  Min,
  ValidateNested,
  validateOrReject,
} from 'class-validator'
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { parse } from 'yaml'

export const ACCOUNTS_FILE_PATH = join(dirname(dirname(dirname(__dirname))), '/config/accounts.yml') // TODO: change dirname

export class AccountsFileV1 {
  @IsEnum(['1'])
  version: string

  @ValidateNested({ each: true })
  @Type(() => AccountsMetadataV1)
  accounts: AccountsMetadataV1[]
}

export class AccountsMetadataImapV1 {
  @IsString()
  host: string

  @IsInt()
  @Min(25)
  @Max(65535)
  @IsOptional()
  port?: number = 25

  @IsBoolean()
  @IsOptional()
  tls: boolean = false

  @IsString()
  username: string

  @IsString()
  password: string
}

export class AccountsMetadataSmtpV1 {
  @IsString()
  host: string

  @IsInt()
  @Min(25, { message: 'Port must be between 25 and 65535' })
  @Max(65535)
  @IsOptional()
  port?: number = 25

  @IsBoolean()
  @IsOptional()
  tls: boolean = false

  @IsString()
  username: string

  @IsString()
  password: string
}

export class AccountsMetadataV1 {
  [key: string]: unknown

  @IsString()
  id: string

  @IsString()
  name: string

  @ValidateNested()
  @Type(() => AccountsMetadataImapV1)
  imap: AccountsMetadataImapV1

  @ValidateNested()
  @Type(() => AccountsMetadataSmtpV1)
  smtp: AccountsMetadataSmtpV1
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

async function validateAccounts(): Promise<any[]> {
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
