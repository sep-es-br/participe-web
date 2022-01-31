export class File {
  id: number;
  name: string;
  url: string;
  type: string;
  mimeType: string;
  subtype: string;
}

export class FileCtrl {
  file: File;
  toDelete: boolean = false;
  toAdd: boolean = false;
}
