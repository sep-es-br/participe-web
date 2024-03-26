import { Component, Input, Output, OnInit, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { Circle } from '../../models/circle';

@Component({
  selector: 'circular-slider',
  templateUrl: './circular-slider.component.html',
  styleUrls: ['./circular-slider.component.scss'],
})
export class CircularSliderComponent implements OnInit {

  private _angle: number = 0;

  @Input()
  diameter: number = 0;

  @Input()
  get angle() {
    return this._angle;
  }
  set angle(deg: number) {
    this._angle = deg || 0;
    this.angleChange.emit(this._angle);
  }

  @Output()
  angleChange = new EventEmitter<number>();

  ngOnInit() {
    
  }

}