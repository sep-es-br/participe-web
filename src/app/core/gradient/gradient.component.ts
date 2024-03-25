import { Component, ViewEncapsulation, ElementRef, Input, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';

interface Point {
    left: string;
    show: boolean;
    position: any
    color?: string;
}

@Component({ 
    selector: 'app-gradient', 
    templateUrl: './gradient.component.html', 
    styleUrls: ['./gradient.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GradientComponent implements OnInit, OnDestroy {

    @ViewChild('principalGradient') containerRef: ElementRef;
    @Output() BackgroudDefined = new EventEmitter<string>();
    points: Point[] = [
        {left: '0%',show: true,color: '#2a72c2', position: 0},
        {left: '99%',show: true, color: '#153961', position:100}
    ];
    backgroundGradient: string;
    defaultBackground = 'linear-gradient(90deg, #2a72c2 0%, #153961 100%)';
    diameter = 120;
    angle = 90;


    ngOnInit(): void {
        this.atualizaBackgroundInicial();
    }
    
    ngOnDestroy(): void {
    }

    atualizaBackgroundInicial(){
        /**Verificar no backend se já existe, caso contrário utilizar o default */
        this.backgroundGradient = this.defaultBackground;
        this.BackgroudDefined.next(this.backgroundGradient);
    }

    obterPontoDeClique(event: MouseEvent) {
        const container = this.containerRef.nativeElement;
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;
        let percentagem = (x / width) * 100;
        percentagem = Math.max(0, Math.min(100, percentagem)); // Garante que o valor está entre 0 e 100
        const color = this.obterCorDoPonto(percentagem, this.points);
        this.points.push({ left: percentagem + '%', show: true, position: percentagem.toFixed(2), color: color });
        this.points.sort((a, b) => a.position - b.position);
        this.atualizaBackground();
    }

    obterCorDoPonto(percentagem: number, pontos: Point[]): string {
        const numPontos = pontos.length;
        for (let i = 1; i < numPontos; i++) {
            if (percentagem < pontos[i].position) {
                const cor1 = pontos[i - 1].color;
                const cor2 = pontos[i].color;
                const posicao1 = pontos[i - 1].position;
                const posicao2 = pontos[i].position;
                const fator = (percentagem - posicao1) / (posicao2 - posicao1);
                return this.interpolarCores(cor1, cor2, fator);
            }
        }
        return pontos[numPontos - 1].color; // Caso o ponto esteja além do último ponto conhecido
    }

    interpolarCores(cor1: string, cor2: string, fator: number): string {
        const c1 = this.hexParaRgb(cor1);
        const c2 = this.hexParaRgb(cor2);
        const r = Math.round(c1.r + (c2.r - c1.r) * fator);
        const g = Math.round(c1.g + (c2.g - c1.g) * fator);
        const b = Math.round(c1.b + (c2.b - c1.b) * fator);
        return this.rgbParaHex(r, g, b);
    }

    hexParaRgb(hex: string): { r: number, g: number, b: number } {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbParaHex(r: number, g: number, b: number): string {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    atualizarCor(novaCor: string, index: number) {
        this.points[index].color = novaCor;
        this.atualizaBackground();
    }

    atualizaBackground(){
        let gradient = 'linear-gradient('+this.angle+'deg ';
        for (let point of this.points) {
            gradient += `, ${point.color} ${point.position}%`;
        }
        gradient += ')';
        this.BackgroudDefined.next(gradient);
        this.backgroundGradient = gradient;
    }

    atualizarPosicao(position: string, index: number){
        this.points[index].position = position;
        this.points[index].left = position == '100' ? '99%' : position + '%' ;
        this.points.sort((a, b) => a.position - b.position);
        this.atualizaBackground();
    }

    trackByPoints(index: number): any {
        return index; 
    }

    removeColor( index: number){
        if (this.points.length > 2) {
            this.points.splice(index, 1);
        } else {
            console.log("Não é possível excluir. Deve haver pelo menos três opções.");
        }
        this.atualizaBackground();
    }

    onAngleChange(newAngle: number) {
        this.atualizaBackground();
    }
}