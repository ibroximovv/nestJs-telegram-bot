import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService){}
  async create(createBookDto: CreateBookDto) {
    try {
      return await this.prisma.book.create({ data: createBookDto});
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException
    }
  }

  async findAll() {
    try {
      return await this.prisma.book.findMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException
    }
  }

  async findOne(id: string) {
    try {
      const one = await this.prisma.book.findFirst({ where: { id }});
      if (!one) {
        return { message: 'Book not found' }
      }
      return one
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      const one = await this.prisma.book.findFirst({ where: { id }});
      if (!one) {
        return { message: 'Book not found' }
      }
      return await this.prisma.book.update({ where: { id }, data: updateBookDto});
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException
    }
  }

  async remove(id: string) {
    try {
      const one = await this.prisma.book.findFirst({ where: { id }});
      if (!one) {
        return 'Book not found'
      }
      await this.prisma.book.delete({ where: { id }})
      return 'book deleted successfully';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException
    }
  }
}
