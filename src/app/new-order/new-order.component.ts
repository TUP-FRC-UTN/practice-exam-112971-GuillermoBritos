import { Component, inject, Inject, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProductServiceService } from '../services/product-service.service';
import { ProductModel } from '../models/productModel';
import { OrderServiceService } from '../services/order-service.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule],
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.css'
})
export class NewOrderComponent implements OnInit {

  ngOnInit(): void {

    this.getAllProducts();
  }



  productService = inject(ProductServiceService);
  orderService = inject(OrderServiceService);



  selectedCantidadControl1 = new FormControl(1);
  selectedPrice1: number = 0;
  selectedStock1: number = 0;
  selectedProductId1: string = '';

  selectedCantidadControl2 = new FormControl(1);
  selectedPrice2: number = 0;
  selectedStock2: number = 0;
  selectedProductId2: string = '';



  products: ProductModel[] = [];

  form: FormGroup = new FormGroup({

    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', {
      validators: [  // Array de validadores síncronos
        Validators.required,
        Validators.email,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ],
      asyncValidators: [this.emailOrdersValidator(this.orderService)],  // Array de validadores asíncronos
      updateOn: 'change'
    }),
    productos: new FormArray([], [this.duplicateProductsValidator()]),

  })


  getAllProducts() {

    this.productService.getProducts().subscribe((x) => {

      this.products = x;

    })

  }

  onProductSelect(event: any, selectorNum: number) {

    const selectedId = event.target.value;
    const selectedProduct = this.products.find(p => p.id === selectedId);

    if (selectedProduct) {
      if (selectorNum === 1) {
        this.selectedProductId1 = selectedProduct.id;
        this.selectedPrice1 = selectedProduct.price;
        this.selectedStock1 = selectedProduct.stock;
        this.selectedCantidadControl1.setValidators([
          Validators.required,
          Validators.min(1),
          this.stockValidator(selectedProduct.stock)

        ]);
        this.selectedCantidadControl1.setValue(1);
        this.selectedCantidadControl1.updateValueAndValidity();
      } else {
        this.selectedProductId2 = selectedProduct.id;
        this.selectedPrice2 = selectedProduct.price;
        this.selectedStock2 = selectedProduct.stock;
        this.selectedCantidadControl2.setValidators([
          Validators.required,
          Validators.min(1),
          this.stockValidator(selectedProduct.stock)
        ]);
        this.selectedCantidadControl2.setValue(1);
        this.selectedCantidadControl2.updateValueAndValidity();
      }
    }
  }

  get nombre() {

    return this.form.get('nombre');
  }

  get email() {
    return this.form.get('email');
  }

  get productos() {
    return this.form.controls['productos'] as FormArray
  }




  agregarProducto(selectorNum: number) {

    const selectedId = selectorNum === 1 ? this.selectedProductId1 : this.selectedProductId2;

    const selectedCantidad = selectorNum === 1 ? this.selectedCantidadControl1.value : this.selectedCantidadControl2.value;

    const selectedPrice = selectorNum === 1 ? this.selectedPrice1 : this.selectedPrice2;

    const selectedStock = selectorNum === 1 ? this.selectedStock1 : this.selectedStock2;

    if (selectedId && selectedCantidad) {

      const productoExistente = this.productos.controls.some(control =>
        control.get('producto')?.value === selectedId
      );

      if (productoExistente) {
        this.productos.setErrors({ duplicateProducts: true });
        return;
      }

      const nuevoProducto = new FormGroup({
        producto: new FormControl(selectedId, [Validators.required]),
        cantidad: new FormControl(selectedCantidad, [
          Validators.required,
          Validators.min(1),
          this.stockValidator(selectedStock)
        ]),
        precio: new FormControl(selectedPrice),
        stock: new FormControl(selectedStock)
      });

      const totalActual = this.calcularTotalProductos();

      if (totalActual + (selectedCantidad || 0) <= 10) {
        this.productos.push(nuevoProducto);
      } else {
        this.form.setErrors({ maxTotalProducts: true });
      }

      if (selectorNum === 1) {
        this.selectedProductId1 = '';
        this.selectedPrice1 = 0;
        this.selectedStock1 = 0;
        this.selectedCantidadControl1.setValue(1);
      } else {
        this.selectedProductId2 = '';
        this.selectedPrice2 = 0;
        this.selectedStock2 = 0;
        this.selectedCantidadControl2.setValue(1);
      }
    }
  }


  eliminarProducto(index: number) {
    this.productos.removeAt(index);
  }



  sendForm() {

    console.log(this.productos);

  }



  getProductName(id: number | string): string {

    if (!id) return '';

    const producto = this.products.find(p => p.id === id);

    return producto ? producto.name : '';
  }




  stockValidator(stock: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const cantidad = control.value;
      if (cantidad <= 0) {
        return { min: true };
      }
      if (cantidad > stock) {
        return { exceedsStock: true };
      }
      return null;
    };
  }

  totalProductsValidator(): ValidationErrors | null {
    const total = this.productos.controls.reduce((sum, control) => {
      return sum + (control.get('cantidad')?.value || 0);
    }, 0);

    return total > 10 ? { maxTotalProducts: true } : null;
  }

  private calcularTotalProductos(): number {
    return this.productos.controls.reduce((total, control) => {
      return total + (control.get('cantidad')?.value || 0);
    }, 0);
  }

  duplicateProductsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      const productos = formArray.controls.map(control =>
        control.get('producto')?.value
      );


      const uniqueProducts = new Set(productos);
      const hasDuplicates = productos.length !== uniqueProducts.size;

      return hasDuplicates ? { duplicateProducts: true } : null;
    };
  }

  emailOrdersValidator(orderService: OrderServiceService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Ignorar validación si el campo está vacío
      if (!control.value) {
        return of(null);
      }

      const email = control.value;

      return orderService.getOrdersByEmail(email).pipe(
        map(orders => {
          // Obtener la fecha actual menos 24 horas
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

          // Filtrar órdenes de las últimas 24 horas
          const recentOrders = orders.filter(order =>
            new Date(order.timestamp) > twentyFourHoursAgo
          );

          // Retornar error si excede el límite
          return recentOrders.length > 3 ?
            { tooManyOrders: { count: recentOrders.length } } :
            null;
        }),
        // Manejar errores de la API
        catchError(error => {
          console.error('Error validando email:', error);
          return of({ apiError: true });
        })
      );
    };
  }

}
