import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'td_trunc',
  standalone: true
})
export class TabledataTruncatePipe implements PipeTransform {

  transform(value: Array<string>): string {

    const totalLength = value.length

    if(totalLength <= 2) {
      return value.toString();
    } else {
      const firstItem = value[0]
      const secondItem = value[1]

      return `${firstItem}, ${secondItem} e mais ${totalLength - 2}`
    }
  }
}
