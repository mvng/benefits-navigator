import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EligibilityService } from './eligibility.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post('sessions')
  @UseGuards(OptionalAuthGuard)
  createSession(@Body() dto: CreateSessionDto) {
    return this.eligibilityService.createSession(dto);
  }

  @Put('sessions/:sessionId/answers')
  saveAnswer(
    @Param('sessionId') sessionId: string,
    @Body() dto: SaveAnswerDto,
  ) {
    return this.eligibilityService.saveAnswer(sessionId, dto);
  }

  @Post('sessions/:sessionId/calculate')
  calculateEligibility(@Param('sessionId') sessionId: string) {
    return this.eligibilityService.calculateEligibility(sessionId);
  }

  @Get('sessions/:sessionId/results')
  getResults(@Param('sessionId') sessionId: string) {
    return this.eligibilityService.getResults(sessionId);
  }
}
