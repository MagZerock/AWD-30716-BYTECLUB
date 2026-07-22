import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AuthGuard } from "../auth/auth.guard";

@Controller("orders")
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user);
  }

  @Get(":orderId")
  findOne(@Param("orderId") orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Put(":orderId")
  update(@Param("orderId") orderId: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(orderId, dto);
  }

  @Delete(":orderId")
  remove(@Param("orderId") orderId: string) {
    return this.ordersService.remove(orderId);
  }
}
