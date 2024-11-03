import { ProductModel } from "./productModel";


export interface OrderModel {

  id: string;
  customerName: string;
  email: string;
  products: ProductModel[];
  total: number;
  orderCode: string;
  timestamp: string;

}
