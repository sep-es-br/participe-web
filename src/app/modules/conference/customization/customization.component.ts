import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, FormGroup  } from "@angular/forms";

@Component({
    selector: 'app-conference-customization',
    templateUrl: './customization.component.html',
    styleUrls: ['./customization.component.scss'],
  })
  export class ConferenceCustomizationComponent implements OnInit   {

    @Input() dataForm!: FormGroup;
    @Output() FormGroupChange = new EventEmitter<FormGroup>();
    @Output() dataFormChange: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
    textExample: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus viverra odio nec ligula fringilla commodo. Nam tristique volutpat tellus. Nulla volutpat sapien lectus, aliquet auctor velit pellentesque non. Quisque massa quam, finibus eget vestibulum vel, vehicula at odio. Fusce ac magna fermentum, pellentesque enim et, sagittis libero. Etiam cursus sollicitudin leo a maximus. Nam eget nunc placerat, hendrerit sem eget, tempus sapien. Sed tortor leo, blandit at justo vitae, imperdiet tincidunt nisl. Vestibulum vitae nisl risus. Aenean sapien est, auctor ultrices est at, semper consequat purus.";
    textCard: string = 'Este é um texto de exemplo para demonstrar como o conteúdo será exibido em um card. Altere a cor para visualizar como o texto se destacará no design final. Esta prévia é útil para ajustar a aparência do card de acordo com as preferências visuais e garantir uma apresentação atraente do conteúdo.';
    textAccentCard: string = 'Este é um exemplo de como o conteúdo será exibido quando estiver em destaque, como em ações de ativo e hover. Experimente diferentes cores para garantir que o texto se destaque da maneira desejada.';
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
    

    constructor(
        private formBuilder: UntypedFormBuilder,
    ){
        
    }


    ngOnInit(): void {
        this.initComponent();
    }

    initComponent(){
        this.initForm();
        if (!this.dataForm) {
            console.log('Erro: FormGroup inválido ou valor ausente');
            return;
        }else{
            this.updateForm();
            this.customStylesheet.valueChanges.subscribe(() => {
                this.dataFormChange.emit(this.customStylesheet);
            });
        }
    }

    initForm(){
        // console.log("TEM DATA NESSE FORM? ||| ",this.dataForm);
        console.log("INICIANDO FORM");
        
        this.customStylesheet = this.formBuilder.group({
            typeBackgroundColor: this.typeColorInput ,
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
        console.info(">> Atualizando ViewChecked <<");
        // this.FormGroupChange.emit(this.customStylesheet);
    }

    updateForm(){
        console.log("data desse form ||| ",this.dataForm);
        
        if(!this.dataForm){
            console.log("++ Não faz nada ++ ",this.dataForm);
            return;
        }else{
            console.log("--+ Faça tudo! +-- ",this.dataForm);
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
        }
        console.log("*** Por quê chegou aqui? ***");
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

    changeColorText(event){
        console.log("Cor atual ",this.customStylesheet.controls.fontColor.value);
        
        this.colorText = event.target.value;
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

    test(){
        console.log('Mudou o form',this.customStylesheet );
    }
    


  }