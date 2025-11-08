import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(@Body() dto: CreateConversationDto, @Request() req) {
    return await this.chatService.createConversation(dto, req.user.id);
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return await this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req) {
    return await this.chatService.getConversation(id, req.user.id);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(@Param('id') id: string, @Request() req) {
    await this.chatService.deleteConversation(id, req.user.id);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() dto: CreateMessageDto, @Request() req) {
    const result = await this.chatService.sendMessage(dto, req.user.id);
    return result;
  }
}

