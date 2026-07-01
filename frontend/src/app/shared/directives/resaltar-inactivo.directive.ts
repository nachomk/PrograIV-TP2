import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[appResaltarInactivo]',
    host: {
        '[class.admin-usuarios__item--inactivo]': 'appResaltarInactivo',
    },
})
export class ResaltarInactivoDirective {
    @Input() appResaltarInactivo = false;
}