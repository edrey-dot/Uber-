import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP:
 * 1. Agrega el encabezado "Authorization: Bearer <token>" a cada petición si existe token guardado.
 * 2. Maneja errores globales (401, 400, 403, 409, 422, y fallos de conexión).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastCtrl = inject(ToastController);

  // 1. Obtener el token almacenado en localStorage
  const token = localStorage.getItem('token');

  // Clonar la petición e inyectar el header Authorization si el token existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 2. Procesar la petición y capturar errores HTTP
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';

      if (error.status === 0) {
        // Error de red, conexión rechazada o bloqueo de CORS
        errorMessage = 'No se pudo conectar con el servidor (20.20.1.157:8000). Verifica tu conexión o el estado del backend.';
        mostrarToast(toastCtrl, errorMessage, 'danger');
      } else if (error.status === 401) {
        // Token expirado, inválido o no autenticado
        errorMessage = error.error?.message || 'Sesión expirada o no autorizada. Inicia sesión nuevamente.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        mostrarToast(toastCtrl, errorMessage, 'warning');
        router.navigate(['/login']);
      } else if (error.status === 400) {
        // Regla de negocio infringida (ej. ya tiene un viaje activo)
        errorMessage = error.error?.message || 'Solicitud inválida.';
        mostrarToast(toastCtrl, errorMessage, 'warning');
      } else if (error.status === 403) {
        // Permiso denegado o conductor no aprobado
        errorMessage = error.error?.message || 'No tienes permisos para realizar esta acción.';
        mostrarToast(toastCtrl, errorMessage, 'warning');
      } else if (error.status === 409) {
        // Conflicto de concurrencia (ej. otro conductor ya aceptó el viaje)
        errorMessage = error.error?.message || 'El servicio ya no está disponible o fue tomado por otro conductor.';
        mostrarToast(toastCtrl, errorMessage, 'warning');
      } else if (error.status === 422) {
        // Error de validación de Laravel (ej. contraseñas cortas, correo repetido)
        if (error.error?.errors) {
          const validationMessages = Object.values(error.error.errors)
            .flat()
            .join(' ');
          errorMessage = validationMessages || error.error.message || 'Datos del formulario inválidos.';
        } else {
          errorMessage = error.error?.message || 'Datos del formulario inválidos.';
        }
        mostrarToast(toastCtrl, errorMessage, 'warning');
      } else if (error.status >= 500) {
        // Error interno del backend
        errorMessage = 'Error interno en el servidor. Por favor intenta de nuevo más tarde.';
        mostrarToast(toastCtrl, errorMessage, 'danger');
      }

      return throwError(() => error);
    })
  );
};

/**
 * Función auxiliar para presentar mensajes Toast amigables en pantalla móvil
 */
async function mostrarToast(
  toastCtrl: ToastController,
  message: string,
  color: 'danger' | 'warning' | 'success' | 'primary'
) {
  const toast = await toastCtrl.create({
    message,
    duration: 3500,
    position: 'top',
    color,
    buttons: [
      {
        text: 'Cerrar',
        role: 'cancel',
      },
    ],
  });
  await toast.present();
}
