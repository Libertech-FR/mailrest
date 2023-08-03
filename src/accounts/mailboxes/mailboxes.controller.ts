import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailboxesService } from './mailboxes.service';
import { CreateMailboxDto } from './dto/create-mailbox.dto';
import { UpdateMailboxDto } from './dto/update-mailbox.dto';

@Controller('mailboxes')
export class MailboxesController {
  constructor(private readonly mailboxesService: MailboxesService) {}

  @Post()
  create(@Body() createMailboxDto: CreateMailboxDto) {
    return this.mailboxesService.create(createMailboxDto);
  }

  @Get()
  findAll() {
    return this.mailboxesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailboxesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMailboxDto: UpdateMailboxDto) {
    return this.mailboxesService.update(+id, updateMailboxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailboxesService.remove(+id);
  }
}
