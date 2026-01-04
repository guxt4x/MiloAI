import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 text-2xl">
               M
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {{ isLogin() ? 'Entre na sua conta' : 'Crie sua conta grátis' }}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {{ isLogin() ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
            <button (click)="toggleMode()" class="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              {{ isLogin() ? 'Cadastre-se' : 'Entrar' }}
            </button>
          </p>
        </div>
        
        <div class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                [(ngModel)]="email"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm" 
                placeholder="Endereço de Email">
            </div>
            <div>
              <label for="password" class="sr-only">Senha</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="current-password" 
                required 
                [(ngModel)]="password"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm" 
                placeholder="Senha">
            </div>
          </div>

          <div>
            <button 
              (click)="handleSubmit()" 
              [disabled]="loading() || !email || !password"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-500/30">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-brand-500 group-hover:text-brand-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              {{ loading() ? 'Processando...' : (isLogin() ? 'Entrar' : 'Cadastrar') }}
            </button>
          </div>
          
          @if (message()) {
            <div class="text-sm text-center font-medium p-2 rounded-md transition-all" [class]="error() ? 'text-red-700 bg-red-50 dark:bg-red-900/20' : 'text-green-700 bg-green-50 dark:bg-green-900/20'">
               {{ message() }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);

  email = '';
  password = '';
  isLogin = signal(true);

  loading = signal(false);
  message = signal('');
  error = signal(false);

  toggleMode() {
    this.isLogin.update(v => !v);
    this.message.set('');
    this.error.set(false);
  }

  async handleSubmit() {
    try {
      this.loading.set(true);
      this.message.set('');
      this.error.set(false);

      if (this.isLogin()) {
        const { error } = await this.authService.signIn(this.email, this.password);
        if (error) throw error;
      } else {
        const { error } = await this.authService.signUp(this.email, this.password);
        if (error) throw error;
        // Since email confirmation is off, signup might auto-login or require explicit login depending on Supabase config.
        // Usually if "Confirm Email" is off, session is created immediately.
        if (!this.authService.user()) {
          this.message.set('Conta criada! Faça login.');
          this.isLogin.set(true);
        }
      }

    } catch (e: any) {
      this.error.set(true);
      this.message.set(this.translateError(e.message));
    } finally {
      this.loading.set(false);
    }
  }

  translateError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('User already registered')) return 'Este email já está cadastrado.';
    if (msg.includes('Password should be')) return 'A senha deve ter pelo menos 6 caracteres.';
    return 'Ocorreu um erro. Tente novamente.';
  }
}
