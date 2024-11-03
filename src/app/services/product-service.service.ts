import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductModel } from '../models/productModel';




@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {



  private readonly httpClient = inject(HttpClient);


  apiUrl = "http://localhost:3000/products";


  getProducts(): Observable<ProductModel[]> {
    return this.httpClient.get(this.apiUrl).pipe(map(x => x as ProductModel[]));
  }





}
