import { Injectable, NotFoundException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './interfaces/user-response.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    this.logger.log('UsersService initialized');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Attempting to create user with email: ${createUserDto.email}`);
      this.logger.debug('User data:', JSON.stringify(createUserDto, null, 2));
      
      const { email, username } = createUserDto;

      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { username }]
      }).exec();

      if (existingUser) {
        this.logger.warn(`User with email ${email} or username ${username} already exists`);
        throw new ConflictException('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      this.logger.debug('Password hashed successfully');

      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword
      });

      this.logger.debug('User model created, attempting to save...');
      const savedUser = await createdUser.save();
      this.logger.log(`Successfully created user with ID: ${savedUser._id}`);
      this.logger.debug('Saved user data:', JSON.stringify(savedUser.toObject(), null, 2));
      
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      this.logger.error('Error details:', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async validateUser(email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    try {
      this.logger.log(`Attempting to validate user with email: ${email}`);
      
      // Find user by email
      const user = await this.findByEmail(email);
      this.logger.debug('Found user in database:', JSON.stringify(user, null, 2));
      
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          username: user.username
        },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      this.logger.log(`Successfully validated user: ${email}`);
      
      // Create user response object with all user data
      const userResponse: UserResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level || "2ème année Bac SMA",
        profilePicture: user.profilePicture || "/sk/testimony_4.webp",
        role: user.role,
        phone: user.phone,
        school: user.school,
        subjects: user.subjects,
        progress: user.progress
      };
      
      this.logger.debug('Sending user response:', JSON.stringify(userResponse, null, 2));
      
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
