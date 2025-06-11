import { Injectable, NotFoundException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

      let userDoc: any = { ...createUserDto, password: hashedPassword };
      // For students, store level as levels[0]
      if (createUserDto.role === 'student' && createUserDto.level) {
        userDoc.levels = [createUserDto.level];
        delete userDoc.level;
      }
      // For teachers, if levels is provided as array, keep as is
      if (createUserDto.role === 'teacher' && Array.isArray(createUserDto.levels)) {
        userDoc.levels = createUserDto.levels;
      } else if (createUserDto.level) {
        userDoc.levels = [createUserDto.level];
      } else {
        userDoc.levels = [];
      }
      const createdUser = new this.userModel(userDoc);

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

  async findByEmail(email: string): Promise<UserDocument> {
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
          userId: user._id.toString(),
          email: user.email,
          username: user.username
        },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      this.logger.log(`Successfully validated user: ${email}`);
      
      // Create user response object with all user data
      const userResponse: UserResponse = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        level: user.levels && user.levels.length > 0 ? user.levels[0] : "2ème année Bac SMA",
        profilePicture: user.profilePicture || "/sk/testimony_4.webp",
        role: user.role,
        phone: user.phone,
        school: user.school,
        subjects: user.subjects?.map(subject => subject.toString()),
        progress: user.progress?.map(p => ({
          subject: p.subject.toString(),
          completedLessons: p.completedLessons.map(lesson => lesson.toString()),
          score: p.score
        }))
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

  async updateProfile(userId: string, body: any, file?: Express.Multer.File): Promise<User> {
    this.logger.log(`[updateProfile] userId: ${userId}`);
    this.logger.log(`[updateProfile] received body: ${JSON.stringify(body)}`);
    if (file) this.logger.log(`[updateProfile] received file: ${file.originalname}`);
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.warn(`[updateProfile] User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Update fields
    const updateData: any = { ...body };
    if (file) {
      updateData.profilePicture = "/uploads/" + file.filename;
    }
    // Reconstruct levels array if present (for teachers) from body (e.g. levels[0], levels[1], etc.)
    const levelsKeys = Object.keys(body).filter(key => key.startsWith('levels['));
    if (levelsKeys.length > 0) {
      const levelsArray = levelsKeys.map(key => body[key]).filter(Boolean);
      updateData.levels = levelsArray;
      console.log("Reconstructed levels array (updateProfile):", levelsArray);
    }
    // Handle level for student
    if (user.role === 'student' && body.level !== undefined) {
      updateData.levels = [body.level];
    }
    this.logger.log(`[updateProfile] user before save: ${JSON.stringify(updateData)}`);
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    this.logger.log(`[updateProfile] user after save: ${JSON.stringify(updatedUser.toObject())}`);
    return updatedUser;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Ancien mot de passe incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Mot de passe mis à jour avec succès.' };
  }
}
