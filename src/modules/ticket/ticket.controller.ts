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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { Public } from '@/bases/decorators/public.decorator';
import { Roles, UserRole } from '@/bases/decorators/role.decorator';
import {
    CreateTicketCategoryDto,
    UpdateTicketCategoryDto,
} from './dto/ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) {}
    @ApiOperation({
        summary: 'Get all tickets of a concert',
    })
    @HttpCode(HttpStatus.OK)
    @Get('/concert/:concertId')
    async getTicketConcert(@Param('/:concertId') concertId: string) {
        return await this.ticketService.findByConcert(concertId);
    }
    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get ticket category by ID' })
    findOne(@Param('id') id: string) {
        return this.ticketService.findOne(id);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create ticket category' })
    create(@Body() createTicketCategoryDto: CreateTicketCategoryDto) {
        return this.ticketService.create(createTicketCategoryDto);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update ticket category' })
    update(
        @Param('id') id: string,
        @Body() updateTicketCategoryDto: UpdateTicketCategoryDto,
    ) {
        return this.ticketService.update(id, updateTicketCategoryDto);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Delete ticket category' })
    remove(@Param('id') id: string) {
        return this.ticketService.remove(id);
    }
    
}
