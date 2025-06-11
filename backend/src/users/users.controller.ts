import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, Put, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './schemas/user.schema';
import { UserResponse } from './interfaces/user-response.interface';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- New: Update profile (with file upload) ---
  @Put('profile')
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: diskStorage({
      destination: './uploads',
      filename (req, file, cb) {
        const username = req.body.username || "user";
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + '-' + (Math.round(Math.random() * 1e9));
        cb(null, username + '-' + uniqueSuffix + '.' + ext);
      },
    }),
  }))
  async updateProfile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User ID is required');
    return this.usersService.updateProfile(userId, body, file);
  }

  // --- New: Change password ---
  @Post('change-password')
  async changePassword(@Body() body: { oldPassword: string; newPassword: string }, @Req() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User ID is required');
    return this.usersService.changePassword(userId, body.oldPassword, body.newPassword);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ user: UserResponse; token: string }> {
    return this.usersService.validateUser(loginDto.email, loginDto.password);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
} 