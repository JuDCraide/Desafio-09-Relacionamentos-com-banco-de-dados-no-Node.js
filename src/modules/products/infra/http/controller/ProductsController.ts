import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, price, quantity } = request.body;

    const createCustomerService = container.resolve(CreateProductService);
    const product = await createCustomerService.execute({
      name,
      price,
      quantity,
    });

    return response.json(product);
  }
}
