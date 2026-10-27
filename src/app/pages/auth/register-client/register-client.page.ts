import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonButtons,
  IonBackButton,
  ToastController,
} from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.page.html',
  styleUrls: ['./register-client.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonButtons,
    IonBackButton,
  ],
})
export class RegisterClientPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const requestData = {
      ...this.registerForm.value,
      role: 'client' as const,
    };

    this.authService.registerClient(requestData).subscribe({
      next: async (res) => {
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: '¡Registro exitoso! Bienvenido a Uber.',
          duration: 2500,
          color: 'success',
          position: 'top',
        });
        await toast.present();
        this.router.navigate(['/client/home']);
      },
      error: () => {
        this.loading = false;
        // El interceptor captura y muestra el error (422, etc.)
      },
    });
  }
}
