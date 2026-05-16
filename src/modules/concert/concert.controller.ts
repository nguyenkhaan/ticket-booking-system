import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConcertService } from './concert.service';
import { Public } from '@/bases/decorators/public.decorator';
import { ConcertStatus } from '@prisma/client';
import { Roles, UserRole } from '@/bases/decorators/role.decorator';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';
import type { Request } from 'express';
@Controller('concerts')
@ApiTags('Concerts')
export class ConcertController {
    constructor(private readonly concertService: ConcertService) {}
    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all concerts' })
    findAll(@Query('status') status?: ConcertStatus) {
        return this.concertService.findAll(status);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get concert by ID' })
    findOne(@Param('id') id: string) {
        return this.concertService.findOne(id);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create concert' })
    create(@Body() createConcertDto: CreateConcertDto, @Req() req: Request) {
        const userId = (req.user as any).sub;
        return this.concertService.create(createConcertDto, userId);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update concert' })
    update(
        @Param('id') id: string,
        @Body() updateConcertDto: UpdateConcertDto,
    ) {
        return this.concertService.update(id, updateConcertDto);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Delete concert' })
    remove(@Param('id') id: string) {
        return this.concertService.remove(id);
    }
}
