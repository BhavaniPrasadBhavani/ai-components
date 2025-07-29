import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get('stream/:sessionId')
  async streamGeneration(
    @Param('sessionId') sessionId: string,
    @Query('prompt') prompt: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    console.log(`[AI Controller] Stream request received - SessionId: ${sessionId}, Prompt length: ${prompt?.length || 0}`);
    
    if (!prompt) {
      console.error('[AI Controller] No prompt provided');
      throw new BadRequestException('Prompt is required');
    }

    if (!token) {
      console.error('[AI Controller] No token provided');
      throw new BadRequestException('Authentication token is required');
    }

    // Verify JWT token manually for SSE
    let user;
    try {
      const decoded = this.jwtService.verify(token);
      user = await this.usersService.findById(decoded.sub);
      if (!user) {
        console.error('[AI Controller] User not found for token');
        throw new BadRequestException('Invalid user');
      }
      console.log(`[AI Controller] User authenticated: ${user.email}`);
    } catch (error) {
      console.error('[AI Controller] Token verification failed:', error.message);
      throw new BadRequestException('Invalid or expired token');
    }

    // Set up Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
    });

    try {
      console.log(`[AI Controller] Starting AI generation for session: ${sessionId}`);
      
      // Get the stream from AI service
      const stream = await this.aiService.streamComponentGeneration(
        sessionId,
        user.id,
        prompt,
      );

      let fullResponse = '';
      let chunkCount = 0;

      console.log(`[AI Controller] Stream initiated, processing chunks...`);

      // Stream the response
      for await (const chunk of stream) {
        chunkCount++;
        fullResponse += chunk;
        
        // Send the chunk to the client
        res.write(`data: ${JSON.stringify({ 
          type: 'chunk', 
          content: chunk 
        })}\n\n`);
      }

      console.log(`[AI Controller] Processed ${chunkCount} chunks, extracting code...`);

      // Extract and send the final code
      const extractedCode = this.aiService.extractCodeFromResponse(fullResponse);
      
      console.log(`[AI Controller] Code extracted - TSX: ${extractedCode.tsx.length} chars, CSS: ${extractedCode.css.length} chars`);
      
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        content: fullResponse,
        code: extractedCode,
      })}\n\n`);

      res.write('data: [DONE]\n\n');
      res.end();
      
      console.log(`[AI Controller] Stream completed successfully`);
    } catch (error) {
      console.error(`[AI Controller] Stream error:`, error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message || 'Unknown error occurred',
      })}\n\n`);
      res.end();
    }
  }
}
