import { Command, On, Start, Update, Use } from "nestjs-telegraf";
import { BookService } from "src/book/book.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Context, Markup } from "telegraf";
import axios from "axios";
import * as xlsx from "xlsx";
import { Message } from "telegraf/typings/core/types/typegram";
import { repl } from "@nestjs/core";

const CHANNEL_ID = '@ibroximov13';

interface BookRow {
  name: string;
  price: number;
  year: number;
}

export async function checkSubscription(ctx: Context, channelId: string) {
  try {
    const userId = ctx.from?.id || ctx.message?.from?.id || ctx.callbackQuery?.from?.id;
    if (!userId) return false;

    const member = await ctx.telegram.getChatMember(channelId, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    return false;
  }
}

@Update()
export class TgUpdate {
  constructor(private readonly prisma: PrismaService, private readonly book: BookService) {}

  @Use()
  async botUse(ctx: Context, next: () => Promise<void>) {
    const isSubscribed = await checkSubscription(ctx, CHANNEL_ID);
    if (isSubscribed) {
      await next();
    } else {
      await ctx.reply(
        `Kanalga obuna bo'lish kerak`,
        Markup.inlineKeyboard([
          Markup.button.url('Ilyosbek Ibroximov', 'https://t.me/ibroximov13'),
        ])
      );
    }
  }

  @Start()
  async onStart(ctx: Context) {
    const data = await this.prisma.user.findFirst({ where: { tg_id: ctx.from?.id } });
    if (data) {
      ctx.reply(`Qayta tashrifingizdan bagoyatda xursandmiz ${data.first_name}`);
    } else {
      await this.prisma.user.create({
        data: {
          tg_id: ctx.from?.id ?? 0,
          username: ctx.from?.username ?? '',
          first_name: ctx.from?.first_name ?? '',
          last_name: ctx.from?.last_name ?? '',
        },
      });
      ctx.reply(`Botimizga xush kelibsiz ${ctx.from?.first_name}`);
    }
  }

  @Command('get')
  async getAllBooks(ctx: Context) {
    const data = await this.book.findAll();

    if (!data.length) {
      return ctx.reply('📚 Kitoblar topilmadi.');
    }

    const message = data
      .map(
        (book, i) =>
          `${i + 1}. ${book.name}  \n ID: ${book.id}\n Narxi: ${book.price} so'm\n Yili: ${book.year}\n`
      )
      .join('\n----------------------\n');
    ctx.reply(message);
  }

  @Command('add')
  async createBook(ctx: Context) {
    ctx.reply('Name, Price, Year ustunlaridan iborat .xlsx faylini yuboring');
  }

  @On('document')
  async handleExcelFile(ctx: Context) {
    if (!('message' in ctx) || !ctx.message || !('document' in ctx.message)) {
      return ctx.reply('Iltimos, Excel faylini yuboring.');
    }

    const document = ctx.message.document;
    const mimeType = document.mime_type;

    if (mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return ctx.reply('Faqat .xlsx (Excel) fayl yuboring.');
    }

    const fileId = document.file_id;

    try {
      const file = await ctx.telegram.getFile(fileId);
      if (!file.file_path) {
        return ctx.reply('Faylni yuklab olishda xato yuz berdi: Fayl yoli topilmadi.');
      }

      console.log('File path:', file.file_path); 

      const fileUrl = `https://api.telegram.org/file/bot7973147353:AAGDbfJsFIwOXZIXo36wZiz17D84kIpjcyo/${file.file_path}`;
      console.log('File URL:', fileUrl); 

      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];

      const rows = xlsx.utils.sheet_to_json(sheet, {
        header: ['name', 'price', 'year'], 
        raw: false,
      });

      console.log('Excel rows:', rows); 

      if (!rows.length) {
        return ctx.reply('Excel faylda malumotlar topilmadi.');
      }

      let successCount = 0;

      for (const row of rows as BookRow[]) {
        const name = row.name;
        const price = Number(row.price);
        const year = Number(row.year);

        if (name && !isNaN(price) && !isNaN(year)) {
          await this.book.create({
            name: String(name),
            price,
            year,
          });
          successCount++;
        } else {
          console.log('Notogri qator:', row); 
        }
      }

      if (successCount > 0) {
        await ctx.reply(`${successCount} ta kitob muvaffaqiyatli qoshildi.`);
      } else {
        await ctx.reply('Yaroqli malumotlar topilmadi. Name, Price, Year ustunlari togri ekanligini tekshiring.');
      }
    } catch (error) {
      console.error('Xato tafsilotlari:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? error.response.data : null,
      });
      await ctx.reply(`Excel faylni qayta yuboring. Xatolik: ${error.message}`);
    }
  }

  @Command('delete')
  async deleteBook(ctx: Context) {
    await ctx.reply(`Ochirmoqchi bolgan kitob ID sini yuboring`)
  }

  @On('text')
  async onText(ctx: Context) {
    const message = ctx.message as Message.TextMessage
    const data = await this.book.remove(message.text)
    ctx.reply(data)
  }
}