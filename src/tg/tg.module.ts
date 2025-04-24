import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [TelegrafModule.forRoot({token: '7973147353:AAGDbfJsFIwOXZIXo36wZiz17D84kIpjcyo'}), BookModule],
  providers: [TgModule]
})
export class TgModule {}
