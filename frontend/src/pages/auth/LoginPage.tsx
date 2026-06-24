/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { ShutterLogo } from '../../components/ui/ShutterLogo'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { login, isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        try {
            await login(email, password)
            navigate('/')
        } catch {
            // error is set in the store
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground transition-colors duration-500">
            <div className="absolute inset-0 aurora-bg opacity-40"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            {/* Floating Card */}
            <div className="relative z-10 w-full max-w-md p-4">
                <div className="glass-panel p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0"></div>

                    <div className="relative z-10">
                        {/* Brand Header */}
                        <div className="flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <ShutterLogo />
                                <span className="text-2xl font-serif font-bold tracking-tight text-white/90 group-hover:text-amber-200 transition-colors">Designika</span>
                            </Link>
                        </div>

                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-serif mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
                            <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Don't have an account?{' '}
                                <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                    Create one
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs opacity-40">
                            <ShieldCheck size={12} />
                            <span>Secured with JWT Authentication</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
