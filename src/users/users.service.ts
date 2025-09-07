import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, AuthProvider } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    // Check if user with this email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // For local auth, ensure password is provided
    if (
      createUserDto.authProvider === AuthProvider.LOCAL ||
      !createUserDto.authProvider
    ) {
      if (!createUserDto.password) {
        throw new Error('Password is required for local authentication');
      }
    }

    // Generate verification token for email verification
    const verificationToken = uuidv4();

    const user = this.usersRepository.create({
      ...createUserDto,
      verificationToken,
    });

    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Handle email change: check if new email already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    // Update user properties
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = '';

    return this.usersRepository.save(user);
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    // Generate reset token
    const resetToken = uuidv4();

    // Set token expiration (24 hours)
    const expiresDate = new Date();
    expiresDate.setHours(expiresDate.getHours() + 24);

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresDate;
    await this.usersRepository.save(user);

    return resetToken;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      return null;
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = '';

    // Clear the expiration date by setting it to a past date
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    user.resetPasswordExpires = pastDate;

    return this.usersRepository.save(user);
  }

  async findOrCreateFromOAuth(
    email: string,
    firstName: string,
    lastName: string,
    provider: AuthProvider,
  ): Promise<User> {
    // Check if user exists with this email
    let user = await this.findByEmail(email);

    // If user exists, update provider details if they're different
    if (user) {
      if (user.authProvider !== provider) {
        user.authProvider = provider;
        user = await this.usersRepository.save(user);
      }
      return user;
    }

    // If user doesn't exist, create a new one
    const newUser = this.usersRepository.create({
      email,
      firstName,
      lastName,
      authProvider: provider,
      isEmailVerified: true, // OAuth emails are considered verified
    });

    return this.usersRepository.save(newUser);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
