import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StockDecreaseLog } from './entity/stock-decrease-log.entity';
import { CreateProductRequestDto, DecreaseStockRequestDto, FindOneRequestDto } from './product.dto';
import { CreateProductResponse, DecreaseStockResponse, FindOneResponse } from './product.pb';

@Injectable()
export class ProductService {
  @InjectRepository(Product)
  private readonly repository: Repository<Product>

  @InjectRepository(StockDecreaseLog)
  private readonly decreaseLogRepository: Repository<StockDecreaseLog>

  public async findOne({ id }: FindOneRequestDto): Promise<FindOneResponse> {
    const product: Product = await this.repository.findOne({ where: { id: id } })
    if (!product) return { data: null, error: ['Product not found'], status: HttpStatus.NOT_FOUND }
    return { data: product, error: null, status: HttpStatus.OK }
  }

  public async createProduct(payload: CreateProductRequestDto): Promise<CreateProductResponse> {
    const product: Product = new Product()
    product.name = payload.name
    product.sku = payload.sku
    product.stock = payload.stock
    product.price = payload.price
    await this.repository.save(product)
    return { status: HttpStatus.CREATED, error: null, id: product.id }
  }

  public async decreaseStock(payload: DecreaseStockRequestDto): Promise<DecreaseStockResponse> {
    const {id} = payload
    const product: Product = await this.repository.findOne({ where: { id } })
    if (!product) { return { status: HttpStatus.NOT_FOUND, error: ['Product not found'] } }
    if (product.stock <= 0){ return { error: ['Stock too low'], status: HttpStatus.CONFLICT } }

    this.repository.update(product.id, { stock: product.stock - 1 })
    return { status: HttpStatus.OK, error: null }
  }


}
