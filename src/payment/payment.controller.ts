import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrderService } from 'src/order/order.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async createPayment() {
    return this.paymentService.createPayment();
  }
  @Post('ipn')
  async handleIpn(@Body() ipnData: any) {
    const { resultCode, orderId, message } = ipnData;

    // Kiểm tra nếu thanh toán thành công (resultCode = 0)
    if (resultCode == '0') {
      await this.orderService.updateResultCode(
        orderId,
        resultCode.toString(),
        message,
      );
      return {
        status: 'success',
        message: 'Thanh toán thành công',
        ipnData,
      };
    } else {
      await this.orderService.updateResultCode(
        orderId,
        resultCode.toString(),
        message,
      );
      return {
        status: 'failed',
        message: `Thanh toán thất bại: ${message}`,
        ipnData,
      };
    }
  }
  @Post('transaction-status')
  async checkStatus(@Body() body: any) {
    return this.paymentService.checkStatus(body);
  }
}
