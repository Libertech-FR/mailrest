import { DynamicModule, Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'
import { MailboxesModule } from './mailboxes/mailboxes.module'
import { MessagesModule } from './messages/messages.module'

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [MailboxesModule, MessagesModule],
})
export class AccountsModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'accounts',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ]),
      ],
    }
  }
}
