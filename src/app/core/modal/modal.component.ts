import { Component, ViewEncapsulation, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

import { ModalService } from './modal.service';
import { IModalData, ModalData } from '@app/shared/interface/IModalData';

@Component({ 
    selector: 'app-modal', 
    templateUrl: './modal.component.html', 
    styleUrls: ['./modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    private element: any;
    @Input() modalData:Partial<IModalData>;
    dataModal;

    constructor(private modalService: ModalService, private el: ElementRef) {
        this.element = el.nativeElement;
        // this.dataModal = new ModalData({...this.modalData});
    }

    ngOnInit(): void {
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }
        // this.dataModal = new ModalData({...this.modalData});
        // console.log("DAtat Modal",this.dataModal);

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // close modal on background click
        this.element.addEventListener('click', el => {
            if (el.target.className === 'app-modal') {
                this.close();
            }
        });

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.modalService.add(this);
    }

    // ngOnChanges(){
    //   console.log("Modal Atualizado ",new Date().toISOString());
    // }

    // remove self from modal service when component is destroyed
    ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }

    // open modal
    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('app-modal-open');
    }

    // close modal
    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('app-modal-open');
    }
}