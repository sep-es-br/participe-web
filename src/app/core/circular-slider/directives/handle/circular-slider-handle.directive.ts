import { Directive, ElementRef, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { fromEvent, interval, merge, Subscription } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Point } from '../../models/point';

const MOUSE_PRIMARY = 0;

@Directive({
  selector: '[circularSliderHandle]'
})
export class CircularSliderHandleDirective implements OnInit {

  private element: HTMLElement;
  private elementStartSubscription?: Subscription;
  private elementMoveSubscription?: Subscription;
  private _angle: number = 0;
  private layerLatestDelta?: Point;
  private circleRadius: number = 0;
  private handleDiameter: number = 0;

  @Input()
  diameter?: number;

  @Input()
  get angle() {
    return this._angle;
  }
  set angle(deg: number) {
    this._angle = deg || 0;
    this.setTransform(this.calcHandlePosition(this._angle));
    this.angleChange.emit(this._angle);
  }

  @Output()
  angleChange = new EventEmitter<number>();

  constructor(
    private ngZone: NgZone,
    private elementRef: ElementRef,
  ) {
    this.element = this.elementRef.nativeElement;
  }
  
  ngOnInit() {
    this.positionHandle();
    this.registerStart(this.element);
  }

  private positionHandle() {
    this.handleDiameter = this.diameter / 5;
    this.circleRadius = this.diameter / 2;
    this.element.style.width = `${this.handleDiameter}px`;
    this.element.style.height = `${this.handleDiameter}px`;
    this.element.style.top = `${this.circleRadius - this.handleDiameter / 2}px`;
    this.element.style.left = `${this.circleRadius - this.handleDiameter / 2}px`;

    this.setTransform(this.calcHandlePosition(this.angle));
  }

  private registerStart(element: HTMLElement) {
    this.unregisterStart();
    this.ngZone.runOutsideAngular(() => {
      const mousedown$ = fromEvent<MouseEvent>(element, 'mousedown').pipe(
        filter(event => event.button === MOUSE_PRIMARY),
        tap(event => {
          // avoid interference by "native" dragging of <img> tags
          if (event.target && (event.target as HTMLElement).draggable) {
            event.preventDefault();
          }
          // avoid triggering other draggable parents
          event.stopPropagation();
        }),
        map(event => parseMouseEvent(event,this.element.getBoundingClientRect())),
      );
      const touchstart$ = fromEvent<TouchEvent>(element, 'touchstart').pipe(
        // delay touch
        switchMap(event => interval(500).pipe(
          first(),
          takeUntil(fromEvent(document, 'touchend')),
          map(() => event),
        )),
        tap(event => {
          // avoid triggering other draggable parents
          event.stopPropagation();
        }),
        map(event => parseTouchEvent(event)),
      );
      this.elementStartSubscription = merge(mousedown$, touchstart$).subscribe(windowPoint => {
        this.dragStart(windowPoint);
      });
    });
  }

  private unregisterStart() {
    if (this.elementStartSubscription) {
      this.elementStartSubscription.unsubscribe();
      this.elementStartSubscription = undefined;
    }
  }

  private registerMove() {
    this.unregisterMove();
    this.elementMoveSubscription = new Subscription();
    const rect = this.element.getBoundingClientRect()

    const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
      tap(event => {
        event.preventDefault();
      }),
      map(event => parseMouseEvent(event,rect)),
    );
    const touchmove$ = fromEvent<TouchEvent>(document, 'touchmove').pipe(
      tap(event => {
        event.preventDefault();
      }),
      map(event => parseTouchEvent(event)),
    );
    this.elementMoveSubscription.add(
      merge(mousemove$, touchmove$).subscribe(windowPoint => {
        this.dragMove(windowPoint);
      }),
    );

    const mouseup$ = fromEvent<void>(document, 'mouseup');
    const touchend$ = fromEvent<void>(document, 'touchend');
    this.elementMoveSubscription.add(
      merge(mouseup$, touchend$).subscribe(() => {
        this.dragStop();
      }),
    );
  }

  private unregisterMove() {
    if (this.elementMoveSubscription) {
      this.elementMoveSubscription.unsubscribe();
      this.elementMoveSubscription = undefined;
    }
  }

  private dragStart(windowPoint: Point) {
    this.windowStart = windowPoint;
    this.registerMove();
  }

  private dragMove(windowPoint: Point) {
    const angle = this.calcAngle(windowPoint);
    this.layerLatestDelta = this.calcHandlePosition(angle);

    this.setTransform(this.layerLatestDelta);
    this.ngZone.run(() => {
      this.angle = Math.round(angle);
    });
  }

  private calcAngle(windowPoint: Point) {
    let angle = 0;
    if (this.diameter) {
      const offset = this.circleRadius - this.handleDiameter / 2;
      const mousePos: Point = {
        x: (windowPoint.x - offset + this.handleDiameter),
        y: (windowPoint.y - offset + this.handleDiameter),
      };
      const aTan = Math.atan2(mousePos.x - this.circleRadius, mousePos.y - this.circleRadius);
      angle = -aTan / (Math.PI / 180) + 180;
    }
    return angle;
  }

  private calcHandlePosition(angle: number): Point {
    const newX = this.circleRadius * Math.sin(angle * Math.PI / 180);  
    const newY = this.circleRadius *  -Math.cos(angle * Math.PI / 180);
    return {
      x: newX - 20,
      y: newY - 20 ,
    }
  }

  private dragStop() {
    this.unregisterMove();
    if (!this.layerLatestDelta) {
      return;
    }
    this.ngZone.run(() => {
      this.layerLatestDelta = undefined;
    });
  }

  private setTransform(point: Point) {
    this.element.style.transform = `translate(${point.x}px, ${point.y}px)`;
  }

}

function parseMouseEvent(event: MouseEvent,rect): Point {
  const PositionX = rect.x;
  const PositionY = rect.y;
  const x = event.clientX - PositionX;
  const y = event.clientY - PositionY;
  return {
    x: x,    
    y: y,
  };
}

function parseTouchEvent(event: TouchEvent): Point {
  const touch = event.touches[0];
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
}