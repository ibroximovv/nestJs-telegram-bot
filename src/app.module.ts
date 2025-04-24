import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TgModule } from './tg/tg.module';
import { TgUpdate } from './tg/tg.update';
import { PrismaModule } from './prisma/prisma.module';
import { BookModule } from './book/book.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TgModule, PrismaModule, BookModule],
  controllers: [AppController],
  providers: [AppService, TgUpdate, PrismaService],
})
export class AppModule {}
