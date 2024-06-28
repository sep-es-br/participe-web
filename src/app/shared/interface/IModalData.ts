export interface IModalData {
  title?: string;
  buttons?: {
    confirm?:string,
    cancel?:string
  };
  showCancel?: boolean;
}

export class ModalData implements IModalData {
  title?: string;
  buttons?: { confirm: string; cancel: string; };
  showCancel?: boolean;

  constructor(title?: string, buttons?: { confirm: string; cancel: string; }, showCancel?: boolean) {
    this.title = title || "";
    this.buttons = buttons || { confirm: "Confirmar", cancel: "Cancelar" };
    this.showCancel = showCancel;
  }
  
}

