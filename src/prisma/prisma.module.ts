import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BookService } from 'src/book/book.service';

@Module({
  exports: [PrismaService],
  providers: [PrismaService, BookService]
})
export class PrismaModule {}
