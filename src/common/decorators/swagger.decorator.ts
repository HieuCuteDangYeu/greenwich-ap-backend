import {
  ApiProperty,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IsOptional, ValidateIf } from 'class-validator';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';

/**
 * Type-safe property options for Swagger documentation
 */
interface SwaggerPropertyOptions {
  description: string;
  example?: any;
  required?: boolean;
  type?: any;
  writeOnly?: boolean;
  readOnly?: boolean;
  enum?: any;
  isArray?: boolean;
  default?: any;
}

/**
 * Decorator factory that creates a property decorator
 * combining Swagger documentation and validation
 */
export function SwaggerProperty(
  options: SwaggerPropertyOptions,
): PropertyDecorator {
  const decorator: PropertyDecorator = (
    target: object,
    propertyKey: string | symbol,
  ): void => {
    // Create a validated copy of options
    const validatedOptions = {
      ...options,
      required: options.required !== false,
    };

    // Apply the ApiProperty decorator
    ApiProperty(validatedOptions)(target, propertyKey);

    // Apply optional validation if needed
    if (options.required === false) {
      IsOptional()(target, propertyKey);
      ValidateIf((_, value) => value !== null && value !== undefined)(
        target,
        propertyKey,
      );
    }
  };

  return decorator;
}

/**
 * Common API responses that can be reused across controllers
 */
export const CommonApiResponses = () =>
  applyDecorators(
    ApiBadRequestResponse({ description: 'Bad Request - Invalid input data' }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid credentials',
    }),
    ApiForbiddenResponse({
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error' }),
  );

/**
 * Standard CRUD API responses for entities
 */
export const CrudApiResponses = <T extends Type<unknown>>(entity: T) =>
  applyDecorators(
    CommonApiResponses(),
    ApiCreatedResponse({
      description: 'Resource created successfully',
      type: entity,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Resource retrieved/updated successfully',
      type: entity,
    }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
  );

/**
 * Base controller decorator with common Swagger setup
 */
export const ApiController = (
  tag: string,
  options?: {
    requireAuth?: boolean;
    description?: string;
  },
) =>
  applyDecorators(
    ApiTags(tag),
    ...(options?.requireAuth !== false ? [ApiBearerAuth('access-token')] : []),
  );

/**
 * Standard Create operation decorator
 */
export const ApiCreateOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({
      summary: summary || `Create new ${entity.name.toLowerCase()}`,
    }),
    ApiCreatedResponse({
      description: `The ${entity.name.toLowerCase()} has been created successfully`,
      type: entity,
    }),
    CommonApiResponses(),
  );

/**
 * Standard Find All operation decorator
 */
export const ApiFindAllOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({
      summary: summary || `Get all ${entity.name.toLowerCase()}s`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Return all ${entity.name.toLowerCase()}s`,
      type: [entity],
    }),
    CommonApiResponses(),
  );

/**
 * Standard Find One operation decorator
 */
export const ApiFindOneOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({
      summary: summary || `Get ${entity.name.toLowerCase()} by ID`,
    }),
    ApiParam({
      name: 'id',
      description: `${entity.name} ID`,
      type: 'string',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Return the ${entity.name.toLowerCase()}`,
      type: entity,
    }),
    ApiNotFoundResponse({ description: `${entity.name} not found` }),
    CommonApiResponses(),
  );

/**
 * Standard Update operation decorator
 */
export const ApiUpdateOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({ summary: summary || `Update ${entity.name.toLowerCase()}` }),
    ApiParam({
      name: 'id',
      description: `${entity.name} ID`,
      type: 'string',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `${entity.name} has been successfully updated`,
      type: entity,
    }),
    ApiNotFoundResponse({ description: `${entity.name} not found` }),
    CommonApiResponses(),
  );

/**
 * Standard Delete operation decorator
 */
export const ApiDeleteOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({ summary: summary || `Delete ${entity.name.toLowerCase()}` }),
    ApiParam({
      name: 'id',
      description: `${entity.name} ID`,
      type: 'string',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `${entity.name} has been successfully deleted`,
    }),
    ApiNotFoundResponse({ description: `${entity.name} not found` }),
    CommonApiResponses(),
  );

/**
 * Standard Update Status operation decorator
 */
export const ApiUpdateStatusOperation = <T extends Type<unknown>>(
  entity: T,
  summary?: string,
) =>
  applyDecorators(
    ApiOperation({
      summary: summary || `Update ${entity.name.toLowerCase()} status`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Status has been successfully updated`,
    }),
    ApiNotFoundResponse({ description: `${entity.name} not found` }),
    CommonApiResponses(),
  );

/**
 * Pagination query parameters
 */
export const ApiPaginationQuery = () =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      description: 'Page number',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      description: 'Number of items per page',
      required: false,
      type: Number,
      example: 10,
    }),
    ApiQuery({
      name: 'search',
      description: 'Search term',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'sort',
      description: 'Sort field',
      required: false,
      type: String,
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'order',
      description: 'Sort order',
      required: false,
      enum: ['ASC', 'DESC'],
      example: 'DESC',
    }),
  );

/**
 * Student filter query parameters
 */
export const ApiStudentFilterQuery = () =>
  applyDecorators(
    ApiQuery({
      name: 'campusId',
      description: 'Campus ID',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'mentorId',
      description: 'Mentor ID',
      required: false,
      type: Number,
    }),
    ApiQuery({
      name: 'status',
      description: 'Status',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'academicYear',
      description: 'Academic Year',
      required: false,
      type: String,
    }),
  );
