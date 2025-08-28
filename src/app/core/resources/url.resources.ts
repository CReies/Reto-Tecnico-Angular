import { environment } from "../../../environments/environment.development";

export const URL_RESOURCES = {
  products: {
    getAll: `${environment.apiUrl}/bp/products`,
    create: `${environment.apiUrl}/bp/products`,
    verify: `${environment.apiUrl}/bp/products/verification`,
    update: `${environment.apiUrl}/bp/products/{id}`,
    delete: `${environment.apiUrl}/bp/products/{id}`
  }
}
