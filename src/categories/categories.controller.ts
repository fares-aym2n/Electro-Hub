import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserTypes } from '../utils/user-types';
import { AuthRolesGuard } from '../users/guards/auth-role.guard';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('/api/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.ADMIN)
  @ApiSecurity('bearer')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.ADMIN)
  @ApiSecurity('bearer')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.ADMIN)
  @ApiSecurity('bearer')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
