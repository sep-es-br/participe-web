import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { CoreModule } from '@app/core/core.module';
import { AttendanceComponent } from './attendance.component';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { PersonService } from '@app/shared/services/person.service';
import { ComponentsModule } from '@app/shared/components/components.module';

@NgModule({
  declarations: [AttendanceComponent, RegisterComponent, EditComponent],
  imports: [
    AttendanceRoutingModule,
    CommonModule,
    CoreModule,
    TranslateModule,
    ComponentsModule
  ],
})
export class AttendanceModule { }
