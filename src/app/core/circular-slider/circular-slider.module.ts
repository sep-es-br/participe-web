import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CircularSliderComponent } from './components/slider/circular-slider.component';
import { CircularSliderHandleDirective } from './directives/handle/circular-slider-handle.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CircularSliderComponent,
    CircularSliderHandleDirective,
  ],
  exports: [
    CircularSliderComponent,
    CircularSliderHandleDirective,
  ],
})
export class CircularSliderModule { }