import { Signal } from '@angular/core';
import { IProduct } from '../../models/shared/IProduct.model';
import { IAddProductModalState } from './IAddProductModalState';

export interface IAddProductModalStoreSignals {
	// State signals
	visible: Signal<boolean>;
	product: Signal<IProduct | null>;
}

export interface IAddProductModalStoreMethods {
	// Modal methods
	showModal(): void;
	hideModal(): void;
	setProduct(product: IProduct | null): void;

	// Reset method
	resetState(): void;
}

export interface IAddProductModalStore extends IAddProductModalStoreSignals, IAddProductModalStoreMethods {
	// Complete store interface combining signals and methods
}
