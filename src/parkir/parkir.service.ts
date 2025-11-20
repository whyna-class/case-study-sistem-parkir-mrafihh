// src/parkir/parkir.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParkirDto } from './dto/create-parkir-dto';
import { UpdateParkirDto } from './dto/update-parkir-dto';
import { jenisKendaraan, Parkir } from '@prisma/client';
import { FindParkirDto } from './dto/find-parkir-dto';

const RATES = {
  [jenisKendaraan.RODA2]: { firstHour: 3000, nextHour: 2000 },
  [jenisKendaraan.RODA4]: { firstHour: 6000, nextHour: 4000 },
};

@Injectable()
export class ParkirService {
  constructor(private prisma: PrismaService) {}

  private hitungTotal(jenis: jenisKendaraan, durasi: number): number {
    const rate = RATES[jenis];
    if (durasi === 1) return rate.firstHour;

    const next = durasi - 1;
    return rate.firstHour + next * rate.nextHour;
  }

  // CREATE ----------------------------------------------------
  async create(createParkirDto: CreateParkirDto): Promise<Parkir> {
    const { durasi, jenisKendaraan, platNomor } = createParkirDto;

    const total = this.hitungTotal(jenisKendaraan, durasi);

    return this.prisma.parkir.create({
      data: {
        platNomor,
        jenisKendaraan,
        durasi,
        total,
      },
    });
  }

  // FIND ALL ----------------------------------------------------
  async findAll(query: FindParkirDto) {
    const {
      search = '',
      jenisKendaraan,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {}
    // Search berdasarkan plat nomor
    if (search) {
      where.platNomor = { contains: search }
    }

    // Filter berdasarkan jenis kendaraan
    if (jenisKendaraan) {
      where.jenisKendaraan = jenisKendaraan;
    }

    const data = await this.prisma.parkir.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.parkir.count({ where });

    return {
      success: true,
      message: 'Data Parkir berhasil di ambil',
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    }
  }

  // FIND ONE ----------------------------------------------------
async findOne(id: number): Promise<Parkir> {
    const parkir = await this.prisma.parkir.findUnique({
        where: { id },
    });

    if (!parkir) {
        // HANYA MELEMPARKAN ERROR INI JIKA DATA TIDAK DITEMUKAN
        throw new NotFoundException(`Data parkir dengan ID ${id} tidak ditemukan.`);
    }
    return parkir;
}

  // UPDATE (full update) ----------------------------------------
  async update(id: number, updateParkirDto: UpdateParkirDto): Promise<Parkir> {
    // pastikan record ada
    const existing = await this.findOne(id);

    const jenis = updateParkirDto.jenisKendaraan ?? existing.jenisKendaraan;
    const durasi = updateParkirDto.durasi ?? existing.durasi;

    const total = this.hitungTotal(jenis, durasi);

    return this.prisma.parkir.update({
      where: { id },
      data: {
        platNomor: updateParkirDto.platNomor ?? existing.platNomor,
        jenisKendaraan: jenis,
        durasi,
        total,
      },
    });
  }

  // PATCH DURASI -------------------------------------------------
  async updateDurasi(id: number, updateParkirDto: UpdateParkirDto): Promise<Parkir> {
  const existingRecord = await this.findOne(id);

  const newDurasi = updateParkirDto.durasi ?? existingRecord.durasi;
  const jenisKendaraan = existingRecord.jenisKendaraan;

  const newTotal = this.hitungTotal(jenisKendaraan, newDurasi);

  return this.prisma.parkir.update({
    where: { id },
    data: {
      durasi: newDurasi,
      total: newTotal,
    },
  });
}


  // DELETE ----------------------------------------------------
async remove(id: number): Promise<Parkir> {
    await this.findOne(id); 
    return this.prisma.parkir.delete({
        where: { id },
    });
}

  // TOTAL REVENUE ----------------------------------------------
  async totalPendapatan(): Promise<{ totalRevenue: number }> {
    const result = await this.prisma.parkir.aggregate({
      _sum: {
        total: true,
      },
    });

    const totalRevenue = result._sum.total || 0;

    return { totalRevenue };
  }
}
