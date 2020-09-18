import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private loadingSubject: Subject<boolean> = new Subject<boolean>();
  private LOADING: boolean = false;
  private percentage: Subject<number> = new Subject<number>();
  constructor() { }

  loading(value: boolean = true) {
    this.LOADING = value;
    this.loadingSubject.next(this.LOADING);
  }

  isLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  updateProgressLoading(percentage: number) {
    this.percentage.next(percentage);
  }

  getProgressLoading(): Observable<number> {
    return this.percentage.asObservable();
  }

}
