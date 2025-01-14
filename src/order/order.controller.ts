// src/order/order.controller.ts

import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.schema';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import aqp from 'api-query-params';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOrder(@Body() body: any, @Request() req): Promise<Order> {
    const { orderId, shortLink } = body;

    if (!orderId || !shortLink) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    // Kiểm tra trùng lặp orderId
    const existingOrder = await this.orderService.findOrderByOrderId(orderId);
    if (existingOrder) {
      throw new ConflictException(
        `Đơn hàng với orderId "${orderId}" đã tồn tại`,
      );
    }
    const bodyNew = {
      userId: req.user._id,
      orderId,
      shortLink,
      resultCode: '1000',
      message:
        'Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán.',
    };
    return this.orderService.createOrder(bodyNew);
  }
  @Patch('update-result-code/:orderId')
  async patchResultCode(
    @Param('orderId') orderId: string,
    @Body('resultCode') resultCode: string | number,
    @Body('message') message: string,
  ): Promise<Order> {
    if (!resultCode) {
      throw new BadRequestException('Thiếu resultCode để cập nhật');
    }

    const updatedOrder = await this.orderService.updateResultCode(
      orderId,
      resultCode.toString(),
      message,
    );
    if (!updatedOrder) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng với orderId "${orderId}"`,
      );
    }

    return updatedOrder;
  }

  @Patch(':orderId/status')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ): Promise<Order> {
    if (status !== 'done') {
      throw new Error('Status can only be updated to "done"');
    }

    return this.orderService.updateStatus(orderId, status);
  }

  // API lấy tất cả đơn hàng trong một tháng cụ thể (dựa vào createdAt)
  @Get('month/:year/:month')
  async getOrdersByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
    @Query() query: any,
  ): Promise<Order[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.orderService.getOrdersByMonth(year, month, {
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }

  // API lấy thông tin đơn hàng theo orderId
  @Get(':userId')
  async getOrderById(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.getOrderById(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('checkUser/payment')
  async checkHopLeUser(@Request() req): Promise<Order> {
    return this.orderService.findOrder({
      userId: req.user._id,
      status: 'init',
      resultCode: '0',
    });
  }
}
