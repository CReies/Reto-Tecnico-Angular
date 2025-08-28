import { Injectable } from "@angular/core";
import { IGetAllProductsResponse } from "../../../../models/api/response/products/IGetAllProductsResponse.model";

@Injectable({
  providedIn: "root",
})
export class GetAllProductsResponseMapper {
  map(payload: any): IGetAllProductsResponse {
    return {
      data: payload.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        logo: item.logo,
        date_released: new Date(item.date_release),
        date_revision: new Date(item.date_revision),
      })),
    };
  }
}
