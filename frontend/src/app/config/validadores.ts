import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validarFortalezaClave(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string;
    if (!valor) return null;

    const valido =
      valor.length >= 8 &&
      /[A-Z]/.test(valor) &&
      /[0-9]/.test(valor);

    return valido ? null : { fortalezaClave: true };
  };
}

export function validarClavesIguales(
  campoClave: string,
  campoRepetir: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const clave = group.get(campoClave)?.value;
    const repetir = group.get(campoRepetir)?.value;

    if (clave !== repetir) {
      group.get(campoRepetir)?.setErrors({ clavesDistintas: true });
      return { clavesDistintas: true };
    }
    return null;
  };
}

export function validarTextoNoVacio(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value as string)?.trim();
    if (!valor) return { textoVacio: true };
    return null;
  };
}