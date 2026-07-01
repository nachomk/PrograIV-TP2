import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appConfirmarClick]',
})
export class ConfirmarClickDirective {
    @Input({ alias: 'appConfirmarClick', required: true })
    mensaje!: string;

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (!confirm(this.mensaje)) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}