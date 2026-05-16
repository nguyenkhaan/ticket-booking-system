import { Roles, UserRole } from '@/bases/decorators/role.decorator';
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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
    CreateVoucherDto,
    UpdateVoucherDto,
    ValidateVoucherDto,
} from './dto/voucher.dto';
import { Public } from '@/bases/decorators/public.decorator';
import { VouchersService } from './voucher.service';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VoucherController {
    constructor(private readonly vouchersService: VouchersService) {}

    @Public()
    @Post('validate')
    @ApiOperation({ summary: 'Validate a voucher code' })
    validate(@Body() validateVoucherDto: ValidateVoucherDto) {
        return this.vouchersService.validate(validateVoucherDto);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new voucher' })
    create(@Body() createVoucherDto: CreateVoucherDto) {
        return this.vouchersService.create(createVoucherDto);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all vouchers' })
    findAll() {
        return this.vouchersService.findAll();
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get voucher by ID' })
    findOne(@Param('id') id: string) {
        return this.vouchersService.findOne(id);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Get(':id/usage')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get voucher usage report' })
    getUsageReport(@Param('id') id: string) {
        return this.vouchersService.getUsageReport(id);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update voucher' })
    update(
        @Param('id') id: string,
        @Body() updateVoucherDto: UpdateVoucherDto,
    ) {
        return this.vouchersService.update(id, updateVoucherDto);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete voucher' })
    remove(@Param('id') id: string) {
        return this.vouchersService.remove(id);
    }
}
