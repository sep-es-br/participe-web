import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, FormGroup, FormControl  } from "@angular/forms";

@Component({
    selector: 'app-conference-customization',
    templateUrl: './customization.component.html',
    styleUrls: ['./customization.component.scss'],
  })
  export class ConferenceCustomizationComponent implements OnInit   {

    @Input() dataForm!: FormGroup;
    @Output() FormGroupChange = new EventEmitter<FormGroup>();
    @Output() dataFormChange: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
    customStylesheet: FormGroup;
    typeColorInput: 'color' | 'gradient' = 'color';
    backgroundColor: string = '#153961';
    colorText: string = '#ffffff';
    borderColor: string = '#ffffff';
    colorAccent: string = '#00a198';
    colorCard: string = '#ffffff';
    colorAccentCard: string = '#00a198';
    colorTextCard: string = '#000000';
    colorFontAccent: string = '#ffffff';
    borderColorCard: string = '#ffffff';
    colorCardLogin: string = '#ffffff';
    formLoaded: boolean = false;
    

    constructor(
        private formBuilder: UntypedFormBuilder,
    ){
        
    }


    async ngOnInit(): Promise<void> {
        await this.initComponent();
        await this.UpdateLocalForm();
        await this.updateForm();
    }

    async UpdateLocalForm(): Promise<void>{
        
        this.backgroundColor = this.dataForm.controls.background.value != '' ? this.dataForm.controls.background.value : this.backgroundColor;
        this.colorText = this.dataForm.controls.fontColor.value != '' ? this.dataForm.controls.fontColor.value : this.colorText;
        this.borderColor = this.dataForm.controls.borderColor.value != '' ? this.dataForm.controls.borderColor.value : this.borderColor;
        this.colorAccent = this.dataForm.controls.accentColor.value != '' ? this.dataForm.controls.accentColor.value : this.colorAccent;
        this.colorCard = this.dataForm.controls.cardColor.value != '' ? this.dataForm.controls.cardColor.value : this.colorCard;
        this.colorAccentCard = this.dataForm.controls.cardColorHover.value != '' ? this.dataForm.controls.cardColorHover.value : this.colorAccentCard;
        this.colorTextCard = this.dataForm.controls.cardFontColor.value != '' ? this.dataForm.controls.cardFontColor.value : this.colorTextCard;
        this.colorFontAccent = this.dataForm.controls.cardFontColorHover.value != '' ? this.dataForm.controls.cardFontColorHover.value : this.colorFontAccent;
        this.borderColorCard = this.dataForm.controls.cardBorderColor.value != '' ? this.dataForm.controls.cardBorderColor.value : this.borderColorCard;
        this.typeColorInput = this.dataForm.controls.typeBackgroundColor.value != '' ? this.dataForm.controls.typeBackgroundColor.value : this.typeColorInput;
        this.colorCardLogin = this.dataForm.controls.cardLoginColor.value != '' ? this.dataForm.controls.cardLoginColor.value : this.colorCardLogin;

        this.customStylesheet.controls.typeBackgroundColor.setValue(this.typeColorInput);
        this.customStylesheet.controls.background.setValue(this.backgroundColor);
        this.customStylesheet.controls.fontColor.setValue(this.colorText);
        this.customStylesheet.controls.borderColor.setValue(this.borderColor);
        this.customStylesheet.controls.accentColor.setValue(this.colorAccent);
        this.customStylesheet.controls.cardColor.setValue(this.colorCard);
        this.customStylesheet.controls.cardFontColor.setValue(this.colorTextCard);
        this.customStylesheet.controls.cardColorHover.setValue(this.colorAccentCard);
        this.customStylesheet.controls.cardFontColorHover.setValue(this.colorFontAccent);
        this.customStylesheet.controls.cardBorderColor.setValue(this.borderColorCard);
        this.customStylesheet.controls.cardLoginColor.setValue(this.colorCardLogin);
        
    }

    async initComponent(){
        await this.initForm();        
    }

    async initForm(){
        this.customStylesheet = this.formBuilder.group({
            typeBackgroundColor: '',
            background: '',
            fontColor: '',
            borderColor: '',
            accentColor: '',
            cardColor: '',
            cardColorHover: '',
            cardFontColor: '',
            cardFontColorHover: '',
            cardBorderColor: '',
            cardLoginColor: '',
        })
        this.customStylesheet.valueChanges.subscribe(() => {
            this.dataFormChange.emit(this.customStylesheet);
            this.updateInputColorPreview();
        });
    }

    updateForm(){
        
        if(!this.dataForm){
            return;
        }else{
            this.typeColorInput = this.dataForm.controls.typeBackgroundColor.value;
            this.backgroundColor = this.dataForm.controls.background.value;
            this.customStylesheet.controls.typeBackgroundColor.setValue(this.dataForm.controls.typeBackgroundColor.value);
            this.customStylesheet.controls.background.setValue(this.dataForm.controls.background.value);
            this.customStylesheet.controls.fontColor.setValue(this.dataForm.controls.fontColor.value);
            this.customStylesheet.controls.borderColor.setValue(this.dataForm.controls.borderColor.value);
            this.customStylesheet.controls.accentColor.setValue(this.dataForm.controls.accentColor.value);
            this.customStylesheet.controls.cardColor.setValue(this.dataForm.controls.cardColor.value);
            this.customStylesheet.controls.cardFontColor.setValue(this.dataForm.controls.cardFontColor.value);
            this.customStylesheet.controls.cardColorHover.setValue(this.dataForm.controls.cardColorHover.value);
            this.customStylesheet.controls.cardFontColorHover.setValue(this.dataForm.controls.cardFontColorHover.value);
            this.customStylesheet.controls.cardBorderColor.setValue(this.dataForm.controls.cardBorderColor.value);
            this.customStylesheet.controls.cardLoginColor.setValue(this.dataForm.controls.cardLoginColor.value);
        }
        this.formLoaded = true;
    }

    getBackgroundInput(typeInput: 'color' | 'gradient'){
        this.typeColorInput = typeInput;
        this.dataForm.controls.typeBackgroundColor.setValue(typeInput);
    }

    changeColorBackground(){
        this.backgroundColor = this.customStylesheet.controls.background.value
        this.dataForm.controls.background.setValue(this.backgroundColor);
    }

    updateBackground(background){
        this.backgroundColor = background;
        this.customStylesheet.controls.background.setValue(background);
        this.changeColorBackground();
    }


    updateInputColorPreview(){
        if(this.formLoaded){
            this.backgroundColor = this.customStylesheet.controls.background.value;
            this.colorText = this.customStylesheet.controls.fontColor.value;
            this.borderColor = this.customStylesheet.controls.borderColor.value;
            this.colorAccent = this.customStylesheet.controls.accentColor.value;
            this.colorCard = this.customStylesheet.controls.cardColor.value;
            this.colorAccentCard = this.customStylesheet.controls.cardColorHover.value;
            this.colorTextCard = this.customStylesheet.controls.cardFontColor.value;
            this.colorFontAccent = this.customStylesheet.controls.cardFontColorHover.value;
            this.borderColorCard = this.customStylesheet.controls.cardBorderColor.value;
            this.typeColorInput = this.customStylesheet.controls.typeBackgroundColor.value;
            this.colorCardLogin = this.customStylesheet.controls.cardLoginColor.value;
        }
    }
    


  }