import { Component, ElementRef, ViewChild, inject, effect, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { FinanceService } from '../services/finance.service';
import { GeminiService } from '../services/gemini.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DecimalPipe, DatePipe, CurrencyPipe],
  template: `
    <div class="h-full overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      
      <!-- Gamification / Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
             Olá, {{ financeService.userProfile().name || 'Visitante' }}! 👋
           </h1>
           <p class="text-sm text-gray-500 dark:text-gray-400">
             Nível {{ financeService.stats().level }} • {{ financeService.stats().points }} pts
           </p>
        </div>
        <div class="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
           <div class="flex items-center gap-1 text-orange-500 font-bold">
             <span class="text-lg">🔥</span>
             <span>{{ financeService.stats().streakDays }} dias</span>
           </div>
           <div class="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>
           <div class="text-sm text-gray-500 dark:text-gray-400">
             Meta: {{ financeService.userProfile().mainGoal || 'Economizar' }}
           </div>
        </div>
      </div>

      <!-- Insight AI Card -->
      @if (aiInsight()) {
        <div class="bg-gradient-to-r from-indigo-50 to-brand-50 dark:from-indigo-900/30 dark:to-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
          <div class="text-2xl">💡</div>
          <div class="flex-1 z-10">
            <h3 class="font-bold text-brand-800 dark:text-brand-200 text-sm mb-1">MiloAI Insight</h3>
            <p class="text-sm text-brand-700 dark:text-brand-300 leading-relaxed">{{ aiInsight() }}</p>
          </div>
          <!-- Decorative circle -->
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl"></div>
        </div>
      }

      <!-- Balance Card -->
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-brand-900 dark:to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div class="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative z-10">
          <p class="text-gray-400 dark:text-brand-200 text-sm font-medium mb-2">Saldo Disponível</p>
          <div class="flex items-baseline gap-2 mb-8">
             <span class="text-4xl font-bold tracking-tight">{{ financeService.balance() | currency:'BRL' }}</span>
             @if(financeService.savingsRate() > 0) {
               <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                 +{{ financeService.savingsRate() | number:'1.0-0' }}% econ.
               </span>
             }
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
              <div class="flex items-center gap-2 mb-1 text-emerald-400">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span class="text-xs font-semibold uppercase tracking-wide">Receitas</span>
              </div>
              <p class="text-lg font-semibold">{{ financeService.totalIncome() | currency:'BRL' }}</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
              <div class="flex items-center gap-2 mb-1 text-rose-400">
                <div class="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                <span class="text-xs font-semibold uppercase tracking-wide">Despesas</span>
              </div>
              <p class="text-lg font-semibold">{{ financeService.totalExpense() | currency:'BRL' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Future Projection (Now Free) -->
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center gap-4 z-10">
            <div class="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-2xl text-brand-600 dark:text-brand-300">🔮</div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Previsão: 6 Meses</h3>
              <p class="text-sm text-gray-500">
                Estimativa: <span class="font-bold text-brand-600 dark:text-brand-400">{{ predictedBalance() | currency:'BRL' }}</span>
              </p>
            </div>
        </div>
        <div class="flex items-center gap-2 z-10 text-xs font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-300 px-3 py-1 rounded-full">
           Análise Ativa
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Categories Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-gray-900 dark:text-white">Onde você gastou</h3>
            <button class="text-xs text-brand-600 font-medium hover:underline">Ver Detalhes</button>
          </div>
          
          @if (financeService.expensesByCategory().length === 0) {
             <div class="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm gap-2">
               <div class="text-3xl opacity-50">📊</div>
               <p>Sem dados suficientes.</p>
             </div>
          } @else {
             <div class="flex items-center justify-center relative h-64" #chartContainer></div>
          }
        </div>

        <!-- Goals & Recent -->
        <div class="space-y-6">
          
          <!-- Goals Section -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Minhas Metas</h3>
            @if(financeService.goals().length === 0) {
              <div class="text-center py-4 text-gray-500 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                Fale com o bot para criar uma meta! <br> Ex: "Quero juntar 1000 reais"
              </div>
            }
            <div class="space-y-4">
              @for (goal of financeService.goals(); track goal.id) {
                <div>
                   <div class="flex justify-between text-sm mb-1.5">
                     <span class="font-medium text-gray-800 dark:text-gray-200">{{ goal.description }}</span>
                     <span class="text-gray-500">{{ goal.currentAmount | currency:'BRL' }} / {{ goal.targetAmount | currency:'BRL' }}</span>
                   </div>
                   <!-- Mock progress calculation for demo purposes (random progress if 0) -->
                   <div class="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div class="h-full bg-brand-500 rounded-full transition-all duration-1000" style="width: 35%"></div>
                   </div>
                </div>
              }
            </div>
          </div>

          <!-- Transactions List -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[300px]">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Últimas Transações</h3>
            <div class="overflow-y-auto flex-1 pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
              @for (tx of financeService.transactions(); track tx.id) {
                <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group">
                  <div class="flex items-center gap-3">
                    <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-lg ' + (tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30')">
                      {{ tx.type === 'income' ? '💰' : '💸' }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ tx.description || tx.category }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ tx.date | date:'dd MMM' }} • {{ tx.category }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                     <p [class]="'font-bold text-sm ' + (tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')">
                       {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'BRL' }}
                     </p>
                  </div>
                </div>
              }
              @if (financeService.transactions().length === 0) {
                <div class="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">
                  Nada por aqui ainda.
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  financeService = inject(FinanceService);
  geminiService = inject(GeminiService);
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  aiInsight = signal<string>('');

  predictedBalance = computed(() => {
    const monthlyNet = (this.financeService.totalIncome() - this.financeService.totalExpense());
    // Simple projection: Current Balance + (Last Month Net * 6)
    // In a real app, this would be more complex time-series analysis
    return this.financeService.balance() + (monthlyNet * 6);
  });

  constructor() {
    effect(() => {
      const data = this.financeService.expensesByCategory();
      if (this.chartContainer && data.length > 0) {
        this.renderChart(data);
      }
    });

    // Fetch insight on load
    this.loadInsight();
  }

  async loadInsight() {
    const context = this.financeService.getContextData();
    // Only fetch if we have some data
    if (context.recentTransactions.length > 0) {
      const insight = await this.geminiService.getInsights(context);
      this.aiInsight.set(insight);
    }
  }

  renderChart(data: { name: string; value: number }[]) {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = 250;
    const height = 250;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.65;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(['#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b']);

    const pie = d3.pie<{ name: string; value: number }>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(8);

    svg.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.name) as string)
      .attr('stroke', 'white')
      .style('stroke-width', '3px')
      .style('opacity', 0.9)
      .append('title')
      .text(d => `${d.data.name}: R$ ${d.data.value.toFixed(2)}`);

    // Center Content
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .text('Total')
      .attr('class', 'text-[10px] fill-gray-500 dark:fill-gray-400 font-bold uppercase tracking-widest');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .text(`R$ ${d3.sum(data, d => d.value).toFixed(0)}`)
      .attr('class', 'text-xl fill-gray-900 dark:fill-white font-extrabold');
  }
}