import { signalStore, withMethods, withState } from '@ngrx/signals';
import { editProductModalInitialState } from './edit-product-modal.state';
import { editProductModalMethods } from './edit-product-modal.methods';

export const EditProductModalStore = signalStore(
  { providedIn: 'root' },
  withState(editProductModalInitialState),
  withMethods(editProductModalMethods)
);
