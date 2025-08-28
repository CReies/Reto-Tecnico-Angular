import { patchState } from '@ngrx/signals';
import { IProduct } from '../../models/shared/IProduct.model';
import { editProductModalInitialState } from './edit-product-modal.state';

export const editProductModalMethods = (store: any) => ({
  showModal: (product: IProduct) => {
    patchState(store, {
      visible: true,
      product: product,
      loading: false,
      error: null
    });
  },

  hideModal: () => {
    patchState(store, {
      visible: false,
      product: null,
      loading: false,
      error: null
    });
  },

  setLoading: (loading: boolean) => {
    patchState(store, { loading });
  },

  setError: (error: string | null) => {
    patchState(store, { error });
  },

  resetState: () => {
    patchState(store, editProductModalInitialState);
  }
});
