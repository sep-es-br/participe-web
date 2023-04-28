import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';
import { ComponentsModule } from '@app/shared/components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { MeetingService } from '@app/shared/services/meeting.service';
import { MeetingComponent } from './meeting.component';
import { MeetPanelComponent } from './meet-panel/meet-panel.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule,
  ],
  declarations: [
    MeetingComponent,
    MeetPanelComponent,
  ],
  exports: [
    MeetingComponent,
    MeetPanelComponent,
  ],
  providers: [
    ConfirmationService,
    MeetingService,
    DatePipe,
  ],
})
export class MeetingModule {
}
