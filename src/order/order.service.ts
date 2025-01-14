// src/order/order.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  // Tạo đơn hàng
  async createOrder(body: any): Promise<Order> {
    const newOrder = new this.orderModel(body);
    return newOrder.save();
  }

  // Tìm đơn hàng theo orderId
  async findOrderByOrderId(orderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderId }).exec();
  }
  // Tìm đơn hàng theo orderId
  async findOrder(filter: any): Promise<Order | null> {
    return this.orderModel.findOne(filter).exec();
  }
  // Cập nhật resultCode
  async updateResultCode(
    orderId: string,
    resultCode: string,
    message: string,
  ): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate(
        { orderId },
        { resultCode: resultCode.toString(), message }, // Đảm bảo resultCode là chuỗi
        { new: true }, // Trả về bản ghi đã cập nhật
      )
      .exec();
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(orderId: string, status: string): Promise<Order> {
    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { orderId, status: 'init' }, // Chỉ cập nhật nếu trạng thái là 'init'
      { status },
      { new: true }, // Trả về đối tượng đã được cập nhật
    );
    return updatedOrder;
  }

  // Lấy đơn hàng theo tháng (dựa vào createdAt)
  async getOrdersByMonth(
    year: number,
    month: number,
    options: any,
  ): Promise<Order[]> {
    const startDate = new Date(year, month - 1, 1); // Bắt đầu từ ngày 1 của tháng
    const endDate = new Date(year, month, 0); // Kết thúc vào cuối tháng
    const { filter, sort, skip, limit, projection, population } = options;
    return this.orderModel
      .find({
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .find(filter)
      .exec();
  }

  // Lấy thông tin đơn hàng theo userId
  async getOrderById(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
