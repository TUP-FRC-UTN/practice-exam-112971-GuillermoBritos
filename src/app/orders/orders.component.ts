import { Component, inject, OnInit } from '@angular/core';
import { OrderServiceService } from '../services/order-service.service';
import { OrderModel } from '../models/orderModel';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {


  orderService = inject(OrderServiceService);

  router = inject(Router);

  orders: OrderModel[] = [];

  form: FormGroup = new FormGroup({

    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }
    )


  });


  ngOnInit() {

    this.getOrders();
  }

  get email() {
    return this.form.get('email');
  }

  getOrders() {

    this.orderService.getOrders().subscribe(x => this.orders = x);
  }


  getOrdersByEmail(email: string) {

    this.orderService.getOrdersByEmail(email).subscribe(x => this.orders = x);
  }

  public createNewOrder() {


    this.router.navigate(['/new-order']);

  }


}
