import { PartialType } from '@nestjs/swagger';
import { CreateMailboxDto } from './create-mailbox.dto';

export class UpdateMailboxDto extends PartialType(CreateMailboxDto) {}
