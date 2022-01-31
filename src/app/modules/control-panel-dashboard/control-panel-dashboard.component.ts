import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {IControlPanelDashboardData, IHorizontalBarChartItem} from '@app/shared/interface/IControlPanelDashboardData';
import {Conference} from '@app/shared/models/conference';
import {LocalityType} from '@app/shared/models/locality-type';
import {ConferenceService} from '@app/shared/services/conference.service';
import {ControlPanelDashboardService} from '@app/shared/services/control-panel-dashboard.service';
import {DomainService} from '@app/shared/services/domain.service';
import {MeetingService} from '@app/shared/services/meeting.service';
import {ResponsiveService} from '@app/shared/services/responsive.service';
import {TranslateChangeService} from '@app/shared/services/translateChange.service';
import {TranslateService} from '@ngx-translate/core';
import {MessageService, SelectItem, SelectItemGroup} from 'primeng/api';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {StructureItemService} from '@app/shared/services/structure-item.service';

@Component({
  selector: 'app-control-panel-dashboard',
  templateUrl: './control-panel-dashboard.component.html',
  styleUrls: ['./control-panel-dashboard.component.scss']
})
export class ControlPanelDashboardComponent implements OnInit, OnDestroy {

  filters = {
    selectedConference: null,
    selectedResult: 'PARTICIPANTS',
    selectedOrigin: '',
    selectedMeeting: []
  };
  showMicroregionChart = true;
  showStrategicAreaChart = true;
  conference: Conference;
  conferenceOptions: SelectItem[];
  originOptions: SelectItem[];
  meetingListOptions: SelectItem[];
  resultOptions: SelectItem[];
  microregionChartAgroupOptions: SelectItem[];
  chartDisplayOptions: SelectItemGroup[];
  microregionChartAgroupSelected: number;
  microregionChartDisplaySelected: string = 'VALUE_DESC';
  strategicAreaChartDisplaySelected: string = 'VALUE_DESC';
  barRegionSelecteds: IHorizontalBarChartItem[] = [];
  barStrategicAreaSelecteds: IHorizontalBarChartItem[] = [];
  dashboardData: IControlPanelDashboardData;
  dashboardDataResponse: IControlPanelDashboardData;
  chartsTitleSelected: string;
  microregionAgroupLocalityTypeSelected: LocalityType;
  strategicAreaChartStructureLevels: { id: number; name: string }[] = [];
  itemStructureSelected: { id: number; name: string };
  heatMapCenter = {lat: -19.510200002162634, lng: -41.05759854916905};
  responsive: boolean;
  $destroy = new Subject();
  heatmapZoom = 8;
  arrowLeftIcon = faArrowLeft;
  loadTranslate = false;

  constructor(
    private translateSrv: TranslateService,
    private translateChange: TranslateChangeService,
    private conferenceSrv: ConferenceService,
    private meetingSrv: MeetingService,
    private breadcrumbService: BreadcrumbService,
    private dashboardSrv: ControlPanelDashboardService,
    private messageService: MessageService,
    private responsiveSrv: ResponsiveService,
    private domainSrv: DomainService,
    private structureSrv: StructureItemService
  ) {
  }

  async ngOnInit() {
    this.buildBreadcrumb();
    await this.loadListOptions();
    this.translateChange.getCurrentLang().subscribe(() => {
      setTimeout(() => {
        this.loadListOptions();
        this.setChartsTitle();
        this.loadTranslate = true;
      }, 500);

    });
    this.responsiveSrv.observable.pipe(takeUntil(this.$destroy)).subscribe(value => {
      this.responsive = value;
    });
    await this.loadConferenceOptions();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadListOptions() {
    this.resultOptions = [
      {label: this.translateSrv.instant('dashboard.participants'), value: 'PARTICIPANTS'},
      {label: this.translateSrv.instant('dashboard.highlights'), value: 'HIGHLIGHTS'},
      {label: this.translateSrv.instant('dashboard.proposals'), value: 'PROPOSALS'}
    ];
    this.originOptions = [
      {label: this.translateSrv.instant('dashboard.all'), value: ''},
      {label: this.translateSrv.instant('dashboard.remote'), value: 'REMOTE'},
      {label: this.translateSrv.instant('dashboard.presential'), value: 'PRESENTIAL'}
    ];
    this.chartDisplayOptions = [
      {
        label: this.translateSrv.instant('dashboard.value'),
        items: [
          {label: 'Top 5', value: 'TOP_FIVE'},
          {label: 'Top 10', value: 'TOP_TEN'},
          {label: this.translateSrv.instant('dashboard.descendent'), value: 'VALUE_DESC'},
          {label: this.translateSrv.instant('dashboard.ascendent'), value: 'VALUE_ASC'}
        ]
      },
      {
        label: this.translateSrv.instant('dashboard.alphabetic'),
        items: [
          {label: this.translateSrv.instant('dashboard.descendent'), value: 'ALPHABETIC_DESC'},
          {label: this.translateSrv.instant('dashboard.ascendent'), value: 'ALPHABETIC_ASC'}
        ]
      },
    ];
  }

  async handleConferenceSelected(event?) {
    //console.log(event);
    if (this.filters.selectedConference !== null) {
      this.clearFilters(false);
      await this.loadConference();
      await this.loadMeetingsByConferenceSelected();
    }
  }

  async loadConference() {
    const result = await this.conferenceSrv.getById(this.filters.selectedConference);
    if (result) {
      this.conference = result;
    }
    this.clearBarChartSelecteds();
    this.setChartsTitle();
    await this.loadRegionStructureConference();
    await this.loadStructurePlanItemsConference();
    await this.loadCharts();
  }

  async loadRegionStructureConference(loadChart?: boolean) {
    if (this.filters.selectedResult === 'PARTICIPANTS') {
      await this.loadLocalityCitizenItems(loadChart);
    } else {
      await this.loadRegionalizationItems();
    }
  }

  async loadRegionalizationItems() {
    const localityTypeRegionalizationConference = this.checkRegionalization();
    if (localityTypeRegionalizationConference && localityTypeRegionalizationConference.id) {
      const localityTypeRegionalizationLevels = await this.dashboardSrv.getAllTypeLocalityFromParents({
          idDomain: this.conference.plan.domain.id,
          idTypeLocality: localityTypeRegionalizationConference.id
        }
      );
      if (localityTypeRegionalizationLevels && localityTypeRegionalizationLevels.length > 0) {
        this.microregionChartAgroupOptions = localityTypeRegionalizationLevels.map(item => ({
          label: item.name,
          value: item.id
        }));
        this.microregionChartAgroupSelected = this.microregionChartAgroupOptions[0].value;
        this.microregionAgroupLocalityTypeSelected = {
          id: this.microregionChartAgroupOptions[0].value, name: this.microregionChartAgroupOptions[0].label
        };
        await this.handleMicroregionChartAgroupClicked();
      }
    } else {
      this.microregionChartAgroupOptions = [];
      this.microregionChartAgroupSelected = null;
      this.microregionAgroupLocalityTypeSelected = undefined;
      await this.handleMicroregionChartAgroupClicked();
    }
  }

  async loadChartsSelectedResult() {
    if (!this.filters.selectedConference) {
      return;
    }
    this.clearFilters(false, false);
    // this.setChartsTitle();
    // this.clearBarChartSelecteds();
    // this.showMicroregionChart = true;
    // this.showStrategicAreaChart = true;
    await this.loadRegionStructureConference(true);
    // await this.loadCharts();
  }

  checkRegionalization() {
    const plan = this.conference.plan;
    if (plan) {// && plan.structure) {
      //if (plan.structure.regionalization) {
        return plan.localitytype;
      //} else {
      //  return undefined;
      //}
    }
    return undefined;
  }

  async loadLocalityCitizenItems(loadChart = false) {
    const typeLocalityCitizenParents = await this.dashboardSrv.getAllTypeLocalityFromParents({
      idDomain: this.conference.plan.domain.id,
      idTypeLocality: this.conference.localityType.id
    });
    if (typeLocalityCitizenParents && typeLocalityCitizenParents.length > 0) {
      this.microregionChartAgroupOptions = typeLocalityCitizenParents.map(item => ({
        label: item.name,
        value: item.id
      }));
      this.microregionChartAgroupSelected = this.microregionChartAgroupOptions[0].value;
      this.microregionAgroupLocalityTypeSelected = {
        id: this.microregionChartAgroupOptions[0].value, name: this.microregionChartAgroupOptions[0].label
      };
    }
    if (loadChart && this.itemStructureSelected && this.microregionChartAgroupSelected) {
      await this.loadCharts();
    }
  }

  async loadStructurePlanItemsConference() {
    this.strategicAreaChartStructureLevels = await this.structureSrv.listStructureItems(this.conference.plan.structure.id);
    if (this.strategicAreaChartStructureLevels && this.strategicAreaChartStructureLevels.length > 0) {
      this.itemStructureSelected = this.strategicAreaChartStructureLevels[0];
    }
  }

  async loadConferenceOptions() {
    const result = await this.conferenceSrv.listAll();
    if (result && result.length > 0) {
      this.conferenceOptions = result.map(conference => ({
        label: conference.name,
        value: conference.id
      }));
    }
  }

  async loadMeetingsByConferenceSelected() {
    const result = await this.meetingSrv.getAllMeetingByConferenceCombo(this.filters.selectedConference);
    if (result && result.content && result.content.length > 0) {
      this.meetingListOptions = result.content.filter(m => m.typeMeetingEnum !== 'VIRTUAL').map(meeting => ({
        label: meeting.name,
        value: meeting.id
      }));
      this.filters.selectedMeeting = null;
    }
  }

  clearFilters(clearConference: boolean, clearResult = true) {
    this.filters = {
      ...this.filters,
      selectedOrigin: '',
      selectedMeeting: []
    };
    if (clearConference) {
      this.filters.selectedConference = null;
    }
    if (clearResult) {
      this.filters.selectedResult = 'PARTICIPANTS';
    }
    this.microregionChartAgroupSelected = this.microregionChartAgroupOptions && this.microregionChartAgroupOptions[0].value;
    this.microregionAgroupLocalityTypeSelected = this.microregionChartAgroupOptions && {
      id: this.microregionChartAgroupOptions[0].value, name: this.microregionChartAgroupOptions[0].label
    };
    this.microregionChartDisplaySelected = 'VALUE_DESC';
    this.strategicAreaChartDisplaySelected = 'VALUE_DESC';
    this.barRegionSelecteds = [];
    this.barStrategicAreaSelecteds = [];
    this.showMicroregionChart = true;
    this.showStrategicAreaChart = true;
    this.itemStructureSelected = this.strategicAreaChartStructureLevels && this.strategicAreaChartStructureLevels[0];
    this.setChartsTitle();
    this.dashboardData = undefined;
    this.dashboardDataResponse = undefined;
  }

  async handleOriginSelected() {
    // this.filters.selectedMeeting = null;
    await this.loadCharts();
  }

  validateOriginSelectedPresential() {
    return !(this.filters.selectedOrigin && this.filters.selectedOrigin === 'PRESENTIAL');
  }

  setChartsTitle() {
    const translateKey = 'dashboard.'.concat(this.filters.selectedResult.toLowerCase());
    this.chartsTitleSelected = this.translateSrv.instant(translateKey);
  }

  async handleMicroregionChartAgroupClicked() {
    const optionSelected = this.microregionChartAgroupOptions &&
      this.microregionChartAgroupOptions.find(item => item.value === this.microregionChartAgroupSelected);
    this.microregionAgroupLocalityTypeSelected = optionSelected && {
      id: optionSelected.value,
      name: optionSelected.label
    };
    await this.loadCharts();
  }

  async handleDisplayModeMicroregionChartChange() {
    if (this.dashboardDataResponse && this.dashboardDataResponse.microregionChart && this.dashboardDataResponse.microregionChart.length > 0) {
      switch (this.microregionChartDisplaySelected) {
        case 'VALUE_DESC':
          const microregionChartDataOrderedDesc = Array.from(this.dashboardDataResponse.microregionChart);
          this.dashboardData.microregionChart = microregionChartDataOrderedDesc.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          break;
        case 'VALUE_ASC':
          const microregionChartDataOrderedAsc = Array.from(this.dashboardDataResponse.microregionChart);
          this.dashboardData.microregionChart = microregionChartDataOrderedAsc.sort((a, b) => a.quantity > b.quantity ? 1 : -1);
          break;
        case 'ALPHABETIC_DESC':
          const microregionChartDataOrderedAlphaDesc = Array.from(this.dashboardDataResponse.microregionChart);
          this.dashboardData.microregionChart = microregionChartDataOrderedAlphaDesc.sort((a, b) => {
            const x = a.description.toUpperCase();
            const y = b.description.toUpperCase();
            return x === y ? 0 : x > y ? -1 : 1;
          });
          break;
        case 'ALPHABETIC_ASC':
          const microregionChartDataOrderedAlphaAsc = Array.from(this.dashboardDataResponse.microregionChart);
          this.dashboardData.microregionChart = microregionChartDataOrderedAlphaAsc.sort((a, b) => {
            const x = a.description.toUpperCase();
            const y = b.description.toUpperCase();
            return x === y ? 0 : x > y ? 1 : -1;
          });
          break;
        case 'TOP_FIVE':
          const microregionChartDataOrderedTopFive = Array.from(this.dashboardDataResponse.microregionChart);
          const microregionTopFive = microregionChartDataOrderedTopFive.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          this.dashboardData.microregionChart = microregionTopFive.filter((item, index) => index >= 0 && index < 5);
          break;
        case 'TOP_TEN':
          const microregionChartDataOrderedTopTen = Array.from(this.dashboardDataResponse.microregionChart);
          const microregionTopTen = microregionChartDataOrderedTopTen.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          this.dashboardData.microregionChart = microregionTopTen.filter((item, index) => index >= 0 && index < 10);
          break;
        default:
          break;
      }
    }
  }

  handleDisplayModeStrategicAreaChartChange() {
    if (this.dashboardDataResponse.strategicAreaChart && this.dashboardDataResponse.strategicAreaChart.length > 0) {
      switch (this.strategicAreaChartDisplaySelected) {
        case 'VALUE_DESC':
          const strategicAreaChartDataOrderedDesc = [...this.dashboardDataResponse.strategicAreaChart];
          this.dashboardData.strategicAreaChart = strategicAreaChartDataOrderedDesc.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          break;
        case 'VALUE_ASC':
          const strategicAreaChartDataOrderedAsc = [...this.dashboardDataResponse.strategicAreaChart];
          this.dashboardData.strategicAreaChart = strategicAreaChartDataOrderedAsc.sort((a, b) => a.quantity > b.quantity ? 1 : -1);
          break;
        case 'ALPHABETIC_DESC':
          const strategicAreaChartDataOrderedAlphaDesc = [...this.dashboardDataResponse.strategicAreaChart];
          this.dashboardData.strategicAreaChart = strategicAreaChartDataOrderedAlphaDesc.sort((a, b) => {
            const x = a.description.toUpperCase();
            const y = b.description.toUpperCase();
            return x === y ? 0 : x > y ? 1 : -1;
          });
          break;
        case 'ALPHABETIC_ASC':
          const strategicAreaChartDataOrderedAlphaAsc = [...this.dashboardDataResponse.strategicAreaChart];
          this.dashboardData.strategicAreaChart = strategicAreaChartDataOrderedAlphaAsc.sort((a, b) => {
            const x = a.description.toUpperCase();
            const y = b.description.toUpperCase();
            return x === y ? 0 : x > y ? -1 : 1;
          });
          break;
        case 'TOP_FIVE':
          const strategicAreaChartDataOrderedTopFive = [...this.dashboardDataResponse.strategicAreaChart];
          const strategicAreaTopFive = strategicAreaChartDataOrderedTopFive.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          this.dashboardData.strategicAreaChart = strategicAreaTopFive.filter((item, index) => index >= 0 && index < 5);
          break;
        case 'TOP_TEN':
          const strategicAreaChartDataOrderedTopTen = [...this.dashboardDataResponse.strategicAreaChart];
          const strategicAreaTopTen = strategicAreaChartDataOrderedTopTen.sort((a, b) => a.quantity > b.quantity ? -1 : 1);
          this.dashboardData.strategicAreaChart = strategicAreaTopTen.filter((item, index) => index >= 0 && index < 10);
          break;
        default:
          break;
      }
    }
  }

  async loadCharts() {
    if (this.filters.selectedConference !== null) {
      const barRegionSelected = this.barRegionSelecteds.length > 0 ? this.barRegionSelecteds[this.barRegionSelecteds.length - 1].id : null;
      const barStrategicAreaSelected = (this.barStrategicAreaSelecteds && this.barStrategicAreaSelecteds.length > 0) ?
        this.barStrategicAreaSelecteds[this.barStrategicAreaSelecteds.length - 1].id : null;
      const result = await this.dashboardSrv.getDashboardData(
        this.filters.selectedConference,
        this.filters.selectedResult,
        this.filters.selectedOrigin,
        this.filters.selectedMeeting,
        this.microregionChartAgroupSelected,
        barRegionSelected,
        !this.showMicroregionChart,
//        this.itemStructureSelected.id,
        barStrategicAreaSelected,
        !this.showStrategicAreaChart
      );
     //console.log(result);
      if (result) {
        this.dashboardDataResponse = Object.assign({}, result);
        this.dashboardData = Object.assign({}, result);
        await this.handleDisplayModeMicroregionChartChange();
        this.handleDisplayModeStrategicAreaChartChange();
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateSrv.instant('attention'),
        detail: this.translateSrv.instant('dashboard.error.notSeletedConference')
      });
    }
  }

  async handleStrategicAreaChartClicked(event) {
    const selectedIndex = (event && event !== [] && event[0]) ? event[0]._index : undefined;
    if (selectedIndex >= 0) {
      const indexStructureItemSelected =
        this.strategicAreaChartStructureLevels.findIndex(item => item.id === this.itemStructureSelected.id);
      if (indexStructureItemSelected > -1) {
        if (indexStructureItemSelected === this.strategicAreaChartStructureLevels.length - 1) {
          this.showStrategicAreaChart = false;
          if (this.barStrategicAreaSelecteds.length > 0) {
            this.barStrategicAreaSelecteds.push(this.dashboardData.strategicAreaChart[selectedIndex]);
          } else {
            this.barStrategicAreaSelecteds = [this.dashboardData.strategicAreaChart[selectedIndex]];
          }
        } else {
          if (this.barStrategicAreaSelecteds.length > 0) {
            this.barStrategicAreaSelecteds.push(this.dashboardData.strategicAreaChart[selectedIndex]);
          } else {
            this.barStrategicAreaSelecteds = [this.dashboardData.strategicAreaChart[selectedIndex]];
          }
          this.itemStructureSelected = this.strategicAreaChartStructureLevels[indexStructureItemSelected + 1];
        }
      }
      await this.loadCharts();
      if (!this.showMicroregionChart) {
        this.dashboardData.microregionChart = undefined;
      }
      if (!this.showStrategicAreaChart) {
        this.dashboardData.strategicAreaChart = undefined;
      }
    }
  }

  clearBarChartSelecteds() {
    this.barRegionSelecteds = [];
    this.barStrategicAreaSelecteds = [];
  }

  async handleMicroregionChartClicked(event) {
    const selectedIndex = (event && event !== [] && event[0]) ? event[0]._index : undefined;
    if (selectedIndex >= 0) {
      const indexGroupSelected =
        this.microregionChartAgroupOptions.findIndex(option => option.value === this.microregionChartAgroupSelected);
      if (indexGroupSelected > -1) {
        if (indexGroupSelected === this.microregionChartAgroupOptions.length - 1) {
          this.showMicroregionChart = false;
          if (this.barRegionSelecteds.length > 0) {
            this.barRegionSelecteds.push(this.dashboardData.microregionChart[selectedIndex]);
          } else {
            this.barRegionSelecteds = [this.dashboardData.microregionChart[selectedIndex]];
          }
        } else {
          if (this.barRegionSelecteds.length > 0) {
            this.barRegionSelecteds.push(this.dashboardData.microregionChart[selectedIndex]);
          } else {
            this.barRegionSelecteds = [this.dashboardData.microregionChart[selectedIndex]];
          }
          this.microregionChartAgroupSelected = this.microregionChartAgroupOptions[indexGroupSelected + 1].value;
          this.microregionAgroupLocalityTypeSelected = {
            id: this.microregionChartAgroupOptions[indexGroupSelected + 1].value,
            name: this.microregionChartAgroupOptions[indexGroupSelected + 1].label
          };
        }
      }
      await this.loadCharts();
      if (!this.showMicroregionChart) {
        this.dashboardData.microregionChart = undefined;
      }
      if (!this.showStrategicAreaChart) {
        this.dashboardData.strategicAreaChart = undefined;
      }
    }
  }

  async handleBackRegionChartClicked() {
    const indexRegionGroupBar = this.microregionChartAgroupOptions.findIndex(item => item.value === this.microregionChartAgroupSelected);
    if (indexRegionGroupBar > -1) {
      if (this.showMicroregionChart) {
        this.microregionChartAgroupSelected = (indexRegionGroupBar > 0) ?
          this.microregionChartAgroupOptions[indexRegionGroupBar - 1].value :
          this.microregionChartAgroupOptions[indexRegionGroupBar].value;
        this.microregionAgroupLocalityTypeSelected = (indexRegionGroupBar > 0) ? {
          id: this.microregionChartAgroupOptions[indexRegionGroupBar - 1].value,
          name: this.microregionChartAgroupOptions[indexRegionGroupBar - 1].label
        } : {
          id: this.microregionChartAgroupOptions[indexRegionGroupBar].value,
          name: this.microregionChartAgroupOptions[indexRegionGroupBar].label
        };
        this.barRegionSelecteds.pop();
      } else {
        this.showMicroregionChart = true;
        this.barRegionSelecteds.pop();
      }
    }
    await this.loadCharts();
    if (!this.showMicroregionChart) {
      this.dashboardData.microregionChart = undefined;
    }
    if (!this.showStrategicAreaChart) {
      this.dashboardData.strategicAreaChart = undefined;
    }
  }

  async handleBackStrategicAreaChartClicked() {
    const indexStructureItemLevel = this.strategicAreaChartStructureLevels.findIndex(item => item.id === this.itemStructureSelected.id);
    if (indexStructureItemLevel > -1) {
      if (this.showStrategicAreaChart) {
        this.itemStructureSelected = (indexStructureItemLevel > 0) ? this.strategicAreaChartStructureLevels[indexStructureItemLevel - 1] :
          this.strategicAreaChartStructureLevels[indexStructureItemLevel];
        this.barStrategicAreaSelecteds.pop();
      } else {
        this.showStrategicAreaChart = true;
        this.barStrategicAreaSelecteds.pop();
      }
    }
    await this.loadCharts();
    if (!this.showMicroregionChart) {
      this.dashboardData.microregionChart = undefined;
    }
    if (!this.showStrategicAreaChart) {
      this.dashboardData.strategicAreaChart = undefined;
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      {label: this.translateSrv.instant('control-panel')},
      {label: 'control-panel', routerLink: ['/control-panel-dashboard']}
    ]);
  }

}
