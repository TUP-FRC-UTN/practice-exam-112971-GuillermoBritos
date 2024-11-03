import { Routes } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';
import { NewOrderComponent } from './new-order/new-order.component';

export const routes: Routes = [


  {
    path: 'orders',
    component: OrdersComponent,

  },
  {
    path: 'new-order',
    component: NewOrderComponent,

  }



];
