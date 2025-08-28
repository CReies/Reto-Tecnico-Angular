import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../generals/http.service';
import { URL_RESOURCES } from '../../../resources/url.resources';

@Injectable({
  providedIn: 'root'
})
export class VerifyProductIdService {
  private readonly httpService = inject(HttpService);

  async exec(id: string): Promise<boolean> {
    try {
      const url = `${URL_RESOURCES.products.verify}/${id}`;
      const response = await this.httpService.get<boolean>(url);
      return response;
    } catch (error) {
      console.error('Error verifying product ID:', error);
      throw error;
    }
  }
}
