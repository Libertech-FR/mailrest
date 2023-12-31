/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/": {
    get: operations["AppController_getInfo"];
  };
  "/accounts": {
    get: operations["AccountsController_search"];
    post: operations["AccountsController_create"];
  };
  "/accounts/{account}": {
    get: operations["AccountsController_read"];
    delete: operations["AccountsController_delete"];
    patch: operations["AccountsController_update"];
  };
  "/accounts/{account}/submit": {
    post: operations["AccountsController_submit"];
  };
  "/accounts/changes": {
    get: operations["AccountsController_sse"];
  };
  "/accounts/{account}/mailboxes": {
    get: operations["MailboxesController_search"];
  };
  "/accounts/{account}/messages": {
    get: operations["MessagesController_search"];
  };
  "/accounts/{account}/messages/{seq}": {
    get: operations["MessagesController_read"];
    delete: operations["MessagesController_delete"];
  };
  "/accounts/{account}/messages/{seq}/source": {
    get: operations["MessagesController_source"];
  };
  "/auth/info": {
    get: operations["AuthController_info"];
  };
  "/cron/run": {
    get: operations["CronController_runAll"];
  };
  "/cron/run/{account}": {
    get: operations["CronController_runAccount"];
  };
  "/tokens": {
    post: operations["TokensController_create"];
  };
  "/tokens/{token}": {
    delete: operations["TokensController_delete"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    PaginatedFilterDto: Record<string, never>;
    AccountsMetadataImapAuthV1: {
      user: string;
      pass: string;
      accessToken: string;
    };
    AccountsMetadataImapV1: {
      host: string;
      port: number;
      auth: components["schemas"]["AccountsMetadataImapAuthV1"];
      secure: boolean;
      servername: string;
      disableCompression: boolean;
      tls: Record<string, never>;
      maxIdleTime: number;
    };
    AccountsMetadataSmtpAuthV1: {
      user: string;
      pass: string;
    };
    AccountsMetadataSmtpV1: {
      host: string;
      port: number;
      from: string;
      ignoreTLS: boolean;
      secure: boolean;
      auth: components["schemas"]["AccountsMetadataSmtpAuthV1"];
    };
    AccountsMetadataWebhooksCronV1: {
      enabled: boolean;
      pattern: string;
      seq: string;
    };
    AccountsMetadataWebhooksV1: {
      id: string;
      enabled: boolean;
      url: string;
      secret: string;
      cron: components["schemas"]["AccountsMetadataWebhooksCronV1"];
      alg: string;
    };
    AccountsMetadataV1: {
      id: string;
      name: string;
      imap: components["schemas"]["AccountsMetadataImapV1"];
      smtp: components["schemas"]["AccountsMetadataSmtpV1"];
      webhooks: components["schemas"]["AccountsMetadataWebhooksV1"][];
    };
    PaginatedResponseDto: {
      /** @enum {number} */
      statusCode: 200;
      total: number;
      data: string[];
    };
    ErrorSchemaDto: {
      /** @enum {number} */
      statusCode: 400;
      message: string;
      validations: string[];
      _exception: Record<string, never>;
    };
    NotFoundDto: {
      /** @enum {number} */
      statusCode: 404;
      message: string;
    };
    AccountSubmitedDto: {
      accepted: string[];
      rejected: string[];
      ehlo: string[];
      envelopeTime: number;
      messageTime: number;
      messageSize: number;
      response: string;
      envelope: Record<string, never>;
      messageId: string;
    };
    AccountSubmitDto: {
      to: string[];
      cc: string[];
      bcc: string[];
      replyTo: string[];
      inReplyTo: string;
      subject: string;
      text: string;
      html: string;
      raw: string;
      /** @enum {string} */
      textEncoding: "quoted-printable" | "base64";
      date: string;
      references: string[];
      encoding: string;
      headers: Record<string, never>;
      context: Record<string, never>;
      template: string;
    };
    ListTreeDto: {
      name: string;
      flags: Record<string, never>;
      path: string;
      subscribed: boolean;
      listed: boolean;
      delimiter: string;
      specialUse: string;
      folders: components["schemas"]["ListTreeDto"][];
    };
    MessagesSearchQueryDto: Record<string, never>;
    Set: Record<string, never>;
    Rfc822Dto: {
      name: string;
      address: string;
    };
    EnvelopeContentDto: {
      date: string;
      subject: string;
      from: components["schemas"]["Rfc822Dto"][];
      sender: components["schemas"]["Rfc822Dto"][];
      replyTo: components["schemas"]["Rfc822Dto"][];
      to: components["schemas"]["Rfc822Dto"][];
      inReplyTo: string;
      messageId: string;
    };
    ChildNodeDto: {
      part: string;
      childNodes: components["schemas"]["ChildNodeDto"][];
      type: string;
      parameters: Record<string, never>;
      encoding: string;
      size: number;
      envelope: components["schemas"]["EnvelopeContentDto"];
      lineCount: number;
      language: string[];
      disposition: string;
      dispositionParameters: Record<string, never>;
    };
    BodyStructureDto: {
      childNodes: components["schemas"]["ChildNodeDto"][];
      type: string;
      parameters: Record<string, never>;
      language: string[];
    };
    FetchMessageDto: {
      seq: number;
      flags: components["schemas"]["Set"];
      uid: number;
      envelope: components["schemas"]["EnvelopeContentDto"];
      bodyStructure: components["schemas"]["BodyStructureDto"];
      id: string;
    };
    TokensMetadataAclsV1: {
      resource: string;
      actions: string | Record<string, never>;
    };
    InternalTokensMetadataV1: {
      client_id?: string;
      key?: string;
      ip?: string[];
      acls?: components["schemas"]["TokensMetadataAclsV1"][];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  AppController_getInfo: {
    responses: {
      200: {
        content: never;
      };
    };
  };
  AccountsController_search: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["PaginatedResponseDto"] & {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["AccountsMetadataV1"][];
          };
        };
      };
    };
  };
  AccountsController_create: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["AccountsMetadataV1"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 201;
            data?: components["schemas"]["AccountsMetadataV1"];
          };
        };
      };
      /** @description Schema validation failed */
      400: {
        content: {
          "application/json": components["schemas"]["ErrorSchemaDto"];
        };
      };
    };
  };
  AccountsController_read: {
    parameters: {
      path: {
        account: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["AccountsMetadataV1"];
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  AccountsController_delete: {
    parameters: {
      path: {
        account: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["AccountsMetadataV1"];
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  AccountsController_update: {
    parameters: {
      path: {
        account: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AccountsMetadataV1"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["AccountsMetadataV1"];
          };
        };
      };
      /** @description Schema validation failed */
      400: {
        content: {
          "application/json": components["schemas"]["ErrorSchemaDto"];
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  AccountsController_submit: {
    parameters: {
      path: {
        account: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AccountSubmitDto"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["AccountSubmitedDto"];
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  AccountsController_sse: {
    responses: {
      200: {
        content: never;
      };
    };
  };
  MailboxesController_search: {
    parameters: {
      path: {
        account: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["PaginatedResponseDto"] & {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["ListTreeDto"][];
          };
        };
      };
    };
  };
  MessagesController_search: {
    parameters: {
      query?: {
        mailbox?: unknown;
        limit?: number;
        skip?: number;
      };
      path: {
        account: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["PaginatedResponseDto"] & {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["MessagesSearchQueryDto"][];
          };
        };
      };
    };
  };
  MessagesController_read: {
    parameters: {
      query?: {
        mailbox?: string;
      };
      path: {
        account: string;
        seq: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["FetchMessageDto"];
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  MessagesController_delete: {
    parameters: {
      query?: {
        mailbox?: string;
      };
      path: {
        account: string;
        seq: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            deleted?: boolean;
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  MessagesController_source: {
    parameters: {
      query?: {
        mailbox?: string;
      };
      path: {
        account: string;
        seq: string;
      };
    };
    responses: {
      /** @description The source of the message */
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  AuthController_info: {
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            user?: Record<string, never>;
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
  CronController_runAll: {
    parameters: {
      query: {
        seq: string;
        mailbox: string;
        sync: boolean;
        delete: boolean;
      };
    };
    responses: {
      200: {
        content: never;
      };
    };
  };
  CronController_runAccount: {
    parameters: {
      query: {
        seq: string;
        mailbox: string;
        sync: boolean;
        delete: boolean;
      };
      path: {
        account: string;
      };
    };
    responses: {
      200: {
        content: never;
      };
    };
  };
  TokensController_create: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["InternalTokensMetadataV1"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 201;
            data?: components["schemas"]["InternalTokensMetadataV1"];
          };
        };
      };
      /** @description Schema validation failed */
      400: {
        content: {
          "application/json": components["schemas"]["ErrorSchemaDto"];
        };
      };
    };
  };
  TokensController_delete: {
    parameters: {
      path: {
        token: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            /** @enum {number} */
            statusCode?: 200;
            data?: components["schemas"]["InternalTokensMetadataV1"];
          };
        };
      };
      /** @description Item not found */
      404: {
        content: {
          "application/json": components["schemas"]["NotFoundDto"];
        };
      };
    };
  };
}
