import { Component, ElementRef, ViewChild, inject, signal, afterNextRender, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../services/finance.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <!-- Header -->
      <div class="bg-brand-600 p-4 text-white flex items-center justify-between shrink-0 shadow-md z-10">
        <div class="flex items-center gap-3">
          <div class="relative">
             <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
             <div class="absolute bottom-0 right-0 w-3 h-3 border-2 border-brand-600 rounded-full bg-green-400"></div>
          </div>
          <div>
             <h2 class="font-bold text-base leading-tight">MiloAI</h2>
             <p class="text-xs text-brand-100 font-medium">Assistente Pessoal</p>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth bg-gray-50/50 dark:bg-gray-900/50" #scrollContainer>
        @for (msg of financeService.messages(); track msg.id) {
          <div [class]="'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start') + ' animate-fade-in-up'">
            <div [class]="'max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-sm shadow-sm relative group ' + 
              (msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none')">
              
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
              
              <div [class]="'text-[10px] mt-1.5 flex items-center justify-end opacity-70 gap-1 ' + (msg.role === 'user' ? 'text-brand-100' : 'text-gray-400')">
                <span>{{ msg.timestamp | date:'HH:mm' }}</span>
                @if (msg.role === 'user') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                }
              </div>
            </div>
          </div>
        }
        
        @if (isThinking()) {
          <div class="flex justify-start">
            <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
        <div class="flex items-center gap-2">
          <button 
            type="button"
            (click)="toggleRecording()"
            [class]="'p-3 rounded-full transition-all duration-300 flex-shrink-0 ' + 
              (isRecording() ? 'bg-red-50 text-red-500 ring-2 ring-red-500 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')"
            title="Usar microfone">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keydown.enter)="sendMessage()"
            placeholder="Ex: Gastei 45 no almoço..."
            class="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-brand-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800 transition-all dark:text-white placeholder-gray-400"
          >
          
          <button 
            (click)="sendMessage()"
            [disabled]="!userInput().trim() || isThinking()"
            class="p-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-lg shadow-brand-500/30 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent {
  financeService = inject(FinanceService);
  geminiService = inject(GeminiService);
  
  userInput = signal('');
  isThinking = signal(false);
  isRecording = signal(false);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  private recognition: any;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      const v = window as any;
      this.recognition = new v.webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'pt-BR';
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput.set(transcript);
        this.isRecording.set(false);
        this.sendMessage();
      };
      this.recognition.onerror = () => {
        this.isRecording.set(false);
      };
    }

    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  toggleRecording() {
    if (!this.recognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }
    
    if (this.isRecording()) {
      this.recognition.stop();
      this.isRecording.set(false);
    } else {
      this.recognition.start();
      this.isRecording.set(true);
    }
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    this.financeService.addMessage({ role: 'user', content: text });
    this.userInput.set('');
    this.isThinking.set(true);
    this.scrollToBottom();

    try {
      const context = this.financeService.getContextData();
      const result = await this.geminiService.processMessage(text, context);
      
      this.handleAiResult(result);
    } catch (e) {
      console.error(e);
      this.financeService.addMessage({ role: 'bot', content: 'Ops, falha na conexão. Tente novamente.' });
    } finally {
      this.isThinking.set(false);
      this.scrollToBottom();
    }
  }

  private handleAiResult(result: any) {
    if (result.intent === 'set_profile' && result.profileUpdate) {
       this.financeService.updateProfile(result.profileUpdate);
       // Check if profile is complete enough to end onboarding
       const p = this.financeService.userProfile();
       if (p.name && p.monthlyIncome && p.mainGoal && !this.financeService.onboardingComplete()) {
          this.financeService.completeOnboarding();
          // Force dashboard refresh via state if needed, or just let user navigate
       }
    } else if (result.intent === 'add_transaction' && result.transaction) {
      this.financeService.addTransaction(result.transaction);
    } else if (result.intent === 'add_goal' && result.goal) {
      this.financeService.addGoal(result.goal);
    }

    if (result.chatResponse) {
      this.financeService.addMessage({ role: 'bot', content: result.chatResponse });
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}