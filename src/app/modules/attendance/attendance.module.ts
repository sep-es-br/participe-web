import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { CoreModule } from '@app/core/core.module';
import { AttendanceComponent } from './attendance.component';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/shared/components/components.module';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [AttendanceComponent, RegisterComponent, EditComponent],
  imports: [
    AttendanceRoutingModule,
    CommonModule,
    CoreModule,
    TranslateModule,
    ComponentsModule,
    ZXingScannerModule
  ],
})
export class AttendanceModule { }
