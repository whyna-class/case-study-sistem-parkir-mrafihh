import { jenisKendaraan } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, Min, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateParkirDto {

    @IsString({ message: 'Plat nomor harus berupa teks.' })
    @IsNotEmpty({ message: 'Plat nomor tidak boleh kosong.' })
    platNomor: string;

    @IsNotEmpty({ message: 'Jenis kendaraan tidak boleh kosong.' })
    @IsEnum(jenisKendaraan, { message: 'Jenis kendaraan harus RODA2 atau RODA4.' })
    jenisKendaraan: jenisKendaraan;

    @Type(() => Number)
    @IsNumber({}, { message: 'Durasi harus berupa angka.' })
    durasi: number;
}