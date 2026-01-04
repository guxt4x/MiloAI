import { Injectable } from '@angular/core';
import { supabase } from '../lib/supabase';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  // Logic has been moved to Supabase Edge Function 'milo-chat' for security.
  // This ensures the API Key is never exposed to the client.

  constructor() { }

  async processMessage(userMessage: string, contextData: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('milo-chat', {
        body: {
          message: userMessage,
          context: contextData,
          mode: 'chat'
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        const msg = error.message?.includes('FunctionsFetchError')
          ? 'Erro de conexão ou chave não configurada no servidor.'
          : 'Erro ao processar mensagem.';

        return {
          intent: 'chat',
          chatResponse: `⚠️ ${msg}`
        };
      }

      return data;

    } catch (e) {
      console.error(e);
      return {
        intent: 'chat',
        chatResponse: 'Erro interno no serviço de IA.'
      };
    }
  }

  async getInsights(contextData: any): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('milo-chat', {
        body: {
          context: contextData,
          mode: 'insight'
        }
      });

      if (error || !data?.text) return "Não foi possível gerar insights no momento.";
      return data.text;
    } catch {
      return "Continue usando o app para liberar mais insights.";
    }
  }
}