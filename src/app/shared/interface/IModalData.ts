export interface IModalData {
  title?: string;
  buttons?: {
    confirm:string,
    cancel:string
  };
}

export class ModalData implements IModalData {
  title?: string;
  buttons?: { confirm: string; cancel: string; };

  constructor(title?: string, buttons?: { confirm: string; cancel: string; }) {
    this.title = title || "";
    this.buttons = buttons || { confirm: "Confirmar", cancel: "Cancelar" };
  }
}

