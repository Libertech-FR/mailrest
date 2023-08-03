import { Injectable } from '@nestjs/common';
import { CreateMailboxDto } from './dto/create-mailbox.dto';
import { UpdateMailboxDto } from './dto/update-mailbox.dto';

@Injectable()
export class MailboxesService {
  create(createMailboxDto: CreateMailboxDto) {
    return 'This action adds a new mailbox';
  }

  findAll() {
    return `This action returns all mailboxes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mailbox`;
  }

  update(id: number, updateMailboxDto: UpdateMailboxDto) {
    return `This action updates a #${id} mailbox`;
  }

  remove(id: number) {
    return `This action removes a #${id} mailbox`;
  }
}
