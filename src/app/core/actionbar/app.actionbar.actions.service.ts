import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export interface ActionButtonItem {
  icon?: string;
  label?: string;
  handle?: any;
  position: 'LEFT' | 'RIGHT';
}

@Injectable({ providedIn: 'root' })
export class ActionBarService {

  private itemsSource = new BehaviorSubject<ActionButtonItem[]>([]);

  itemsHandler = this.itemsSource.asObservable();

  setItems(items: ActionButtonItem[]) {
    this.itemsSource.next(items);
  }

  clear() {
    this.itemsSource = new BehaviorSubject<ActionButtonItem[]>([]);
  }

}
