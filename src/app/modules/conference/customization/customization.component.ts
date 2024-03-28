import { Component, EventEmitter, Input, OnInit, Output, AfterContentChecked, ChangeDetectorRef, AfterViewInit, afterRender } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";

@Component({
    selector: 'app-conference-customization',
    templateUrl: './customization.component.html',
    styleUrls: ['./customization.component.scss'],
  })
  export class ConferenceCustomizationComponent implements OnInit,AfterViewInit   {

    @Input() dataForm: UntypedFormGroup;
    @Output() FormGroupChange = new EventEmitter<UntypedFormGroup>();
    textExample: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus viverra odio nec ligula fringilla commodo. Nam tristique volutpat tellus. Nulla volutpat sapien lectus, aliquet auctor velit pellentesque non. Quisque massa quam, finibus eget vestibulum vel, vehicula at odio. Fusce ac magna fermentum, pellentesque enim et, sagittis libero. Etiam cursus sollicitudin leo a maximus. Nam eget nunc placerat, hendrerit sem eget, tempus sapien. Sed tortor leo, blandit at justo vitae, imperdiet tincidunt nisl. Vestibulum vitae nisl risus. Aenean sapien est, auctor ultrices est at, semper consequat purus.";
    textCard: string = 'Este é um texto de exemplo para demonstrar como o conteúdo será exibido em um card. Altere a cor para visualizar como o texto se destacará no design final. Esta prévia é útil para ajustar a aparência do card de acordo com as preferências visuais e garantir uma apresentação atraente do conteúdo.';
    textAccentCard: string = 'Este é um exemplo de como o conteúdo será exibido quando estiver em destaque, como em ações de ativo e hover. Experimente diferentes cores para garantir que o texto se destaque da maneira desejada.';
    customStylesheet: UntypedFormGroup;
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
    

    constructor(
        private formBuilder: UntypedFormBuilder,
        private changeDetectorRef: ChangeDetectorRef
    ){}


    ngOnInit(): void {
        this.initForm();
        this.updateForm();
    }

    ngAfterViewInit(): void {
        this.changeDetectorRef.detectChanges();
        // this.updateForm();
    }

    initForm(){
        console.log('INIT FORM');
        this.customStylesheet = this.formBuilder.group({
            typeBackgroundColor:this.typeColorInput,
            background: this.backgroundColor,
            fontColor: this.colorText,
            borderColor: this.borderColor,
            accentColor: this.colorAccent,
            cardColor: this.colorCard,
            cardColorHover: this.colorAccentCard,
            cardFontColor: this.colorTextCard,
            cardFontColorHover: this.colorFontAccent,
            cardBorderColor: this.borderColorCard,
        })
    }

    ngAfterViewChecked(): void {
        this.updateForm();
    }

    updateForm(){
        if(!this.dataForm){
            return;
        }
        // console.log("Update form ",this.dataForm);
        this.dataForm.controls.typeBackgroundColor.setValue(this.customStylesheet.controls.typeBackgroundColor.value);
        this.dataForm.controls.background.setValue(this.customStylesheet.controls.background.value);
        this.dataForm.controls.fontColor.setValue(this.customStylesheet.controls.fontColor.value);
        this.dataForm.controls.borderColor.setValue(this.customStylesheet.controls.borderColor.value);
        this.dataForm.controls.accentColor.setValue(this.customStylesheet.controls.accentColor.value);
        this.dataForm.controls.cardColor.setValue(this.customStylesheet.controls.cardColor.value);
        this.dataForm.controls.cardFontColor.setValue(this.customStylesheet.controls.cardFontColor.value);
        this.dataForm.controls.cardColorHover.setValue(this.customStylesheet.controls.cardColorHover.value);
        this.dataForm.controls.cardFontColorHover.setValue(this.customStylesheet.controls.cardFontColorHover.value);
        this.dataForm.controls.cardBorderColor.setValue(this.customStylesheet.controls.cardBorderColor.value);
    }

    getBackgroundInput(typeInput: 'color' | 'gradient'){
        this.typeColorInput = typeInput;
        this.dataForm.controls.typeBackgroundColor.setValue(typeInput);
    }

    changeColorBackground(){
        console.log("FORM |||",this.dataForm);
        this.backgroundColor = this.customStylesheet.controls.background.value
        this.dataForm.controls.background.setValue(this.backgroundColor);
    }

    updateBackground(background){
        this.backgroundColor = background;
        this.customStylesheet.controls.background.setValue(background);
        this.changeColorBackground();
    }

    changeColorText(){
        // console.log("Cor atual ",this.customStylesheet.controls.fontColor.value);
        
        this.colorText = this.customStylesheet.controls.fontColor.value;
        // this.dataForm.controls.fontColor.setValue(this.colorText);
    }

    changeBorderColor(event){
        console.log("changeBorderColor ",event);
        
    }

    changeAccentColor(event){
        console.log("changeAccentColor ",event);
        
    }

    changeCardColor(event){
        console.log("changeCardColor ",event);
        
    }

    changeCardColorAccent(event){
        console.log("changeCardColorAccent ",event);
        
    }

    changeCardText(event){
        console.log("changeCardText ",event);
        
    }

    changeCardTextAccent(event){
        console.log("changeCardTextAccent ",event);
        
    }

    changeCardBorderColor(event){
        console.log("changeCardBorderColor ",event);
        
    }

    


  }