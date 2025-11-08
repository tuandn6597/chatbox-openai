import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { OpenAIService } from './openai.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private openAIService: OpenAIService,
  ) {}

  async createConversation(dto: CreateConversationDto, userId: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      title: dto.title || 'New Conversation',
      userId,
    });
    return await this.conversationRepository.save(conversation);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { userId },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id })
      .andWhere('conversation.userId = :userId', { userId })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const result = await this.conversationRepository.delete({
      id,
      userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
  }

  async sendMessage(dto: CreateMessageDto, userId: string): Promise<{ message: Message; conversation: Conversation }> {
    let conversation: Conversation;

    // If no conversationId, create a new conversation with the first message as title
    if (!dto.conversationId) {
      // Create title from message (first 50 characters)
      const title = dto.content.length > 50 
        ? dto.content.substring(0, 50) + '...' 
        : dto.content;
      
      conversation = this.conversationRepository.create({
        title,
        userId,
      });
      conversation = await this.conversationRepository.save(conversation);
    } else {
      // Find existing conversation
      conversation = await this.conversationRepository.findOne({
        where: { id: dto.conversationId, userId },
        relations: ['messages'],
      });

      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${dto.conversationId} not found`);
      }
    }

    // Save user message
    const userMessage = this.messageRepository.create({
      conversation,
      conversationId: conversation.id,
      role: 'user',
      content: dto.content,
    });
    await this.messageRepository.save(userMessage);

    // Reload conversation to get all messages including the new one
    const updatedConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id: conversation.id })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!updatedConversation) {
      throw new NotFoundException(`Conversation with ID ${conversation.id} not found`);
    }

    // Get conversation history for context
    const history = updatedConversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get AI response
    const aiResponse = await this.openAIService.generateResponse(history);

    // Save AI message
    const assistantMessage = this.messageRepository.create({
      conversation: updatedConversation,
      conversationId: updatedConversation.id,
      role: 'assistant',
      content: aiResponse,
    });
    await this.messageRepository.save(assistantMessage);

    // Reload conversation to get all messages including the assistant message
    const finalConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id: conversation.id })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!finalConversation) {
      throw new NotFoundException(`Conversation with ID ${conversation.id} not found`);
    }

    // Update conversation (updatedAt will be automatically updated by @UpdateDateColumn)
    finalConversation.updatedAt = new Date();
    await this.conversationRepository.save(finalConversation);

    return { message: assistantMessage, conversation: finalConversation };
  }
}

