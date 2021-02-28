import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exits');
    }

    const orderProducts = await this.productsRepository.findAllById(products);

    if (!orderProducts.length) {
      throw new AppError('Could not find any products');
    }

    const formattedProducts = products.map(product => {
      const orderProduct = orderProducts.find(p => p.id === product.id);

      if (!orderProduct) {
        throw new AppError(`Product ${product.id} does not exists`);
      }
      if (orderProduct.quantity < product.quantity) {
        throw new AppError(`Not enough quantity of product ${product.id}`);
      }

      return {
        product_id: product.id,
        quantity: product.quantity,
        price: orderProduct.price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: formattedProducts,
    });

    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateOrderService;
