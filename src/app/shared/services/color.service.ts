import { Inject, Injectable, Injector } from '@angular/core';
import { IColor } from '../interface/IColor';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root'
})
export class ColorService extends BaseService<any> {
    private rootStyle: HTMLStyleElement = document.createElement("style")


    constructor(
      @Inject(Injector) injector: Injector,
    ) {
      super('color', injector);
      document.head.appendChild(this.rootStyle)
    }

    getConferenceColor(idConference: number): Promise<IColor> {
      return this.http.get<IColor>(`${this.urlBase}/${idConference}`).toPromise();
    }


    async setPrimaryColor(activeConference: string) {
      const activeConferenceAsNumber = parseInt(activeConference)
      const result = await this.getConferenceColor(activeConferenceAsNumber)

      if(Object.entries(result).length != 0){
        this.rootStyle.textContent = 
        `
        :root {
          --background: ${result.background};
          --accent-color: ${result.accentColor};
          --font-color: ${result.fontColor};
          --card-font-color: ${result.cardFontColor};
          --card-font-color-hover: ${result.cardFontColorHover};
          --card-color: ${result.cardColor};
          --card-color-hover: ${result.cardColorHover};
          --card-border-color: ${result.cardBorderColor};
          --border-color: ${result.borderColor};
          --card-login-color: ${result.cardLoginColor};
        }
        `
      }
    }


    getCssVariableValue(variableName: string): string {
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(variableName);
      return value.trim();
    }

  }
