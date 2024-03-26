import { Component, EventEmitter, Input, OnInit, Output, AfterContentChecked, ChangeDetectorRef, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
    selector: 'app-conference-customization',
    templateUrl: './customization.component.html',
    styleUrls: ['./customization.component.scss'],
  })
  export class ConferenceCustomizationComponent implements OnInit,AfterViewInit   {

    @Input() dataForm: FormGroup;
    @Output() FormGroupChange = new EventEmitter<FormGroup>();
    typeColorInput: 'color' | 'gradient' = 'color';
    backgroundColor: string = '#153961';
    colorText: string = '#ffffff';
    textExample: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus viverra odio nec ligula fringilla commodo. Nam tristique volutpat tellus. Nulla volutpat sapien lectus, aliquet auctor velit pellentesque non. Quisque massa quam, finibus eget vestibulum vel, vehicula at odio. Fusce ac magna fermentum, pellentesque enim et, sagittis libero. Etiam cursus sollicitudin leo a maximus. Nam eget nunc placerat, hendrerit sem eget, tempus sapien. Sed tortor leo, blandit at justo vitae, imperdiet tincidunt nisl. Vestibulum vitae nisl risus. Aenean sapien est, auctor ultrices est at, semper consequat purus.";
    textCard: string = 'Este é um texto de exemplo para demonstrar como o conteúdo será exibido em um card. Altere a cor para visualizar como o texto se destacará no design final. Esta prévia é útil para ajustar a aparência do card de acordo com as preferências visuais e garantir uma apresentação atraente do conteúdo.';
    textAccentCard: string = 'Este é um exemplo de como o conteúdo será exibido quando estiver em destaque, como em ações de ativo e hover. Experimente diferentes cores para garantir que o texto se destaque da maneira desejada.';
    backgroundCardColor: string = "#ffffff";
    textCardColor: string = "#000000";
    customStylesheet: FormGroup;
    colorBorder: string = '#ffffff';
    colorAccent: string = '#00a198';
    colorAccentCard: string = '#00a198';
    colorFontAccent: string = '#ffffff';

    constructor(
        private formBuilder: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef
    ){}


    ngOnInit(): void {
        this.initForm();
    }

    ngAfterViewInit(): void {
        this.changeDetectorRef.detectChanges();
    }

    initForm(){
        this.customStylesheet = this.formBuilder.group({
            textColor: this.colorText,
            colorBackground: this.backgroundColor,
            typeColorBackground:'color',
            cardTextColor: this.textCardColor,
            cardBackgroundColor: this.backgroundCardColor,
            borderColor: this.colorBorder,
            accentColor: this.colorAccent,
            accentCardColor: this.colorAccentCard,
            accentFontColor: this.colorFontAccent,
        })
    }

    getBackgroundInput(typeInput: 'color' | 'gradient'){
        this.typeColorInput = typeInput;
    }

    changeColorBackground(){
        this.backgroundColor = this.customStylesheet.controls.colorBackground.value
        this.dataForm.controls.colorBackground.setValue(this.backgroundColor);
    }

    changeColorText(){
        this.colorText = this.customStylesheet.controls.textColor.value;
        this.dataForm.controls.textColor.setValue(this.colorText);
    }

    updateBackground(background){
        this.backgroundColor = background;
        this.customStylesheet.controls.colorBackground.setValue(background);
        this.changeColorBackground();
    }
    


  }