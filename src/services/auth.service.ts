import { Injectable, signal } from '@angular/core';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _user = signal<User | null>(null);
    private _session = signal<Session | null>(null);

    constructor() {
        this.refreshSession();

        supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            console.log('Auth event:', event);
            this._updateState(session);
        });
    }

    get user() {
        return this._user.asReadonly();
    }

    get session() {
        return this._session.asReadonly();
    }

    get isAuthenticated() {
        return !!this._user();
    }

    async refreshSession() {
        const { data: { session } } = await supabase.auth.getSession();
        this._updateState(session);
    }

    private _updateState(session: Session | null) {
        this._session.set(session);
        this._user.set(session?.user ?? null);
    }

    async signInWithEmail(email: string) {
        // Deprecated in favor of password login, but keeping for reference if needed
        return await supabase.auth.signInWithOtp({ email });
    }

    async signIn(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password });
    }

    async signUp(email: string, password: string) {
        return await supabase.auth.signUp({
            email,
            password,
        });
    }

    async signOut() {
        return await supabase.auth.signOut();
    }
}
