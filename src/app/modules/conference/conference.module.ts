import { MeetingModule } from './meeting/meeting.module';
import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ComponentsModule } from '@app/shared/components/components.module';
import { ConferenceComponent } from './conference.component';
import { ConferenceService } from '@app/shared/services/conference.service';
import { TranslateModule } from '@ngx-translate/core';
import { FilesService } from '@app/shared/services/files.service';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule,
    MeetingModule
  ],
  declarations: [
    ConferenceComponent
  ],
  exports: [
    ConferenceComponent
  ],
  providers: [
    ConfirmationService,
    ConferenceService,
    DatePipe,
    FilesService
  ]
})
export class ConferenceModule {}
