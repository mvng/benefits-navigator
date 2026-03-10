import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AssistantService } from './assistant.service';

export class ChatDto {
  message: string;
  session_id?: string;
  conversation_history?: Array<{ role: string; content: string }>;
}

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.assistantService.chat(
      dto.message,
      dto.conversation_history ?? [],
      dto.session_id,
    );

    for await (const chunk of stream as any) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
