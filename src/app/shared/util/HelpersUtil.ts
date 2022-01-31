export class HelperUtils {
  static loadingIcon(icon = 'pi pi-check', isLoading: boolean = false) {
    return isLoading ? 'pi pi-spin pi-spinner' : icon;
  }
}
