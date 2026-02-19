import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShiftTemplateService } from './shift-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ClaimsGuard } from '../utils/guards/claims.guard';
import { RequireClaims } from '../utils/decorators/require-claims.decorator';
import { AccessClaim } from '../types';
import { OwnerId } from '../utils/decorators/owner-id.decorator';
import { CurrentUser, AuthUser } from '../utils/decorators/current-user.decorator';

@UseGuards(ClaimsGuard)
@Controller('shift-templates')
export class ShiftTemplateController {
  constructor(private readonly shiftTemplatesService: ShiftTemplateService) {}

  @Get()
  @RequireClaims(AccessClaim.READ)
  getByUserId(@OwnerId() ownerId: string) {
    return this.shiftTemplatesService.getByUserId(ownerId);
  }

  @Get(':id')
  @RequireClaims(AccessClaim.READ)
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shiftTemplatesService.getTemplateByUserAndOwner({
      userId: user.id,
      templateId: id,
      claims: user.claims,
    });
  }

  @Post()
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_ALL)
  create(
    @CurrentUser() user: AuthUser,
    @OwnerId() ownerId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.shiftTemplatesService.createTemplate({
      ownerId,
      userId: user.id,
      dto,
    });
  }

  @Patch(':id')
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_ALL)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.shiftTemplatesService.updateTemplate({
      userId: user.id,
      templateId: id,
      dto,
      claims: user.claims,
    });
  }

  @Delete(':id')
  @RequireClaims(AccessClaim.DELETE_SELF, AccessClaim.DELETE_ALL)
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shiftTemplatesService.deleteTemplate({
      userId: user.id,
      templateId: id,
      claims: user.claims,
    });
  }
}
