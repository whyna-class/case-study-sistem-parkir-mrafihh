import {CreateParkirDto} from './create-parkir-dto';
import {PartialType} from '@nestjs/mapped-types';
import { Type } from 'class-transformer'; 

import { IsNumber, IsOptional } from 'class-validator';

export class UpdateParkirDto extends PartialType(CreateParkirDto) {
  @Type(() => Number)
  @IsNumber({})
    @IsOptional()
  durasi?: number;
}

