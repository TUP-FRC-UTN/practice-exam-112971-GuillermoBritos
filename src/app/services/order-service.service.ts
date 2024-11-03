import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderModel } from '../models/orderModel';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {


  private httpClient = inject(HttpClient);

  apiUrl = "http://localhost:3000/orders";


  getOrders(): Observable<OrderModel[]> {
    return this.httpClient.get(this.apiUrl).pipe(map(x => x as OrderModel[]));
  }


  getOrdersByEmail(email: string): Observable<OrderModel[]> {

    console.log(this.apiUrl + '?email=' + email);

    return this.httpClient.get(this.apiUrl + '?email=' + email).pipe(map(x => x as OrderModel[]));
  }



}
