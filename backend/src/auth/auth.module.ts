import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Usuario } from './entities/usuario.entity';
import { Professor } from './entities/professor.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ResetToken } from './entities/reset-token.entity';
import { EmailModule } from '../email/email.module';
import { SophiaModule } from '../sophia/sophia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Professor, RefreshToken, ResetToken]),
    EmailModule,
    SophiaModule,
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
