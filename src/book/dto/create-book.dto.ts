import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class CreateBookDto {
    @ApiProperty({ example: 'Muqaddima' })
    @IsString()
    name: string

    @ApiProperty({ example: 80000 })
    @IsNumber()
    price: number

    @ApiProperty({ example: 2025 })
    @IsNumber()
    year: number
}
