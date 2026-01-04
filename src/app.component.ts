import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat.component';
import { DashboardComponent } from './components/dashboard.component';
import { AuthComponent } from './components/auth.component';
import { FinanceService } from './services/finance.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatComponent, DashboardComponent, AuthComponent],
  template: `
    @if (!authService.isAuthenticated) {
      <app-auth></app-auth>
    } @else {
      <!-- Changed h-screen to fixed inset-0 for better mobile viewport handling -->
      <div class="fixed inset-0 w-full h-full flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
        
        <!-- Desktop Sidebar -->
        <aside class="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 shadow-sm">
          <div class="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-50 dark:border-gray-800">
            <div class="relative">
               <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 text-xl">
                 M
               </div>
            </div>
            <div class="ml-3 hidden lg:block">
              <span class="font-bold text-gray-900 dark:text-white text-lg tracking-tight">MiloAI</span>
              <span class="text-[10px] block text-gray-400 uppercase tracking-widest font-semibold">Financeiro</span>
            </div>
          </div>
          
          <nav class="flex-1 p-4 space-y-2 mt-4">
            <button 
              (click)="activeTab = 'dashboard'"
              [class]="'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ' + 
              (activeTab === 'dashboard' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400')">
              <div [class]="'p-1 rounded-lg transition-colors ' + (activeTab === 'dashboard' ? 'bg-brand-100 dark:bg-brand-800/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-700')">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                 </svg>
              </div>
              <span class="hidden lg:block">Dashboard</span>
            </button>
            
            <button 
              (click)="activeTab = 'chat'"
              [class]="'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ' + 
              (activeTab === 'chat' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400')">
              <div [class]="'p-1 rounded-lg transition-colors ' + (activeTab === 'chat' ? 'bg-brand-100 dark:bg-brand-800/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-700')">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                 </svg>
              </div>
              <span class="hidden lg:block">Chat IA</span>
            </button>
          </nav>
  
          <!-- Upgrade Card / Theme Switch -->
          <div class="p-4 space-y-4">
             <button (click)="financeService.toggleTheme()" class="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
               @if (financeService.darkMode()) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  <span class="hidden lg:block text-sm font-medium">Modo Claro</span>
               } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span class="hidden lg:block text-sm font-medium">Modo Escuro</span>
               }
             </button>
             <button (click)="authService.signOut()" class="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span class="hidden lg:block text-sm font-medium">Sair</span>
             </button>
          </div>
        </aside>
  
        <!-- Main Content -->
        <main class="flex-1 h-full overflow-hidden relative">
          <div class="h-full w-full max-w-7xl mx-auto flex flex-col">
            <!-- Mobile Header -->
            <header class="md:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 z-20 shrink-0 shadow-sm">
               <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">M</div>
                  <span class="font-bold text-gray-900 dark:text-white">MiloAI</span>
               </div>
               <div class="flex items-center gap-2">
                 <button (click)="financeService.toggleTheme()" class="text-gray-500 dark:text-gray-400 p-1">
                    @if (financeService.darkMode()) {
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    }
                 </button>
               </div>
            </header>
  
            <!-- Views -->
            <div class="flex-1 overflow-hidden p-2 md:p-4 bg-gray-50 dark:bg-gray-900">
               @if (activeTab === 'dashboard') {
                 <app-dashboard></app-dashboard>
               } @else {
                 <app-chat class="block h-full"></app-chat>
               }
            </div>
          </div>
        </main>
  
        <!-- Mobile Bottom Nav -->
        <nav class="md:hidden h-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2 z-30 shrink-0 pb-safe">
          <button 
            (click)="activeTab = 'dashboard'"
            [class]="'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ' + 
            (activeTab === 'dashboard' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span class="text-[10px] font-medium">Dashboard</span>
          </button>
          <button 
            (click)="activeTab = 'chat'"
            [class]="'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ' + 
            (activeTab === 'chat' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span class="text-[10px] font-medium">Chat IA</span>
          </button>
          <button 
              (click)="authService.signOut()"
              class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span class="text-[10px] font-medium">Sair</span>
          </button>
        </nav>
      </div>
    }
  `
})
export class AppComponent {
  activeTab: 'dashboard' | 'chat' = 'chat'; // Start in chat for onboarding potential
  financeService = inject(FinanceService);
  authService = inject(AuthService);

  constructor() {
    // If onboarding is complete, default to dashboard. Else chat.
    if (this.financeService.onboardingComplete()) {
      this.activeTab = 'dashboard';
    }
  }
}