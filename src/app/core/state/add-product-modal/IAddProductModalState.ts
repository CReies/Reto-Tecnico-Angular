import { IProduct } from "../../models/shared/IProduct.model";

export interface IAddProductModalState {
  visible: boolean;
  product: IProduct | null;
}
