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
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AuthorityListComponent } from './authority-list/authority-list.component';
import {NewAuthorityComponent} from '@app/modules/attendance/new-authority/new-authority.component';
import {KeyFilterModule} from 'primeng/keyfilter';

@NgModule({
  declarations: [
    AttendanceComponent,
    RegisterComponent,
    EditComponent,
    AuthorityListComponent,
    NewAuthorityComponent
  ],
    imports: [
        AttendanceRoutingModule,
        CommonModule,
        CoreModule,
        TranslateModule,
        ComponentsModule,
        ZXingScannerModule,
        SweetAlert2Module.forRoot(),
        KeyFilterModule
    ],
})
export class AttendanceModule { }
