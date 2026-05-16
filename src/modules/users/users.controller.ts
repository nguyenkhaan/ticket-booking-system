import { Public } from '@/bases/decorators/public.decorator';
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
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { Roles, UserRole } from '@/bases/decorators/role.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}
    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }
    @Get()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Find all users in system',
    })
    async findAll() {
        return await this.userService.findAll();
    }
    @Get('/:id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get user by id',
    }) 
    async findById(@Param('id') id: string) {
        return await this.userService.findOne(id) 
    }
    @Patch('/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user information' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return await this.userService.update(id , updateUserDto) 
    }
    @Delete('/:id')
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete user (Admin only)',
    })
    async remove(@Param('id') id: string) {
        return await this.userService.remove(id) 
    }
}
