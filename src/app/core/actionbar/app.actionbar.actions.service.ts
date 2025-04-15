import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IRecordAmount } from './recordAmmount.interface';

export interface ActionButtonItem {
  icon?: string;
  label?: string;
  handle?: any;
  position: 'LEFT' | 'RIGHT';
}

@Injectable({ providedIn: 'root' })
export class ActionBarService {

  private itemsSource = new BehaviorSubject<ActionButtonItem[]>([]);

  private recordAmountSource = new BehaviorSubject<IRecordAmount>(undefined);

  itemsHandler = this.itemsSource.asObservable();
  recordAmountHandler = this.recordAmountSource.asObservable();

  setItems(items: ActionButtonItem[]) {
    this.itemsSource.next(items);
  }

  set recordAmount(recordAmount : IRecordAmount) {
    this.recordAmountSource.next(recordAmount)
  }
  

  clear() {
    this.itemsSource = new BehaviorSubject<ActionButtonItem[]>([]);
    this.recordAmountSource = new BehaviorSubject<IRecordAmount>(undefined);
  }

}
