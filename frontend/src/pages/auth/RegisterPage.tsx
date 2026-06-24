/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { ShutterLogo } from '../../components/ui/ShutterLogo'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register, isLoading, error } = useAuthStore()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match')
            return
        }

        try {
            await register(email, name, password)
            navigate('/transform')
        } catch (err) {
            // Error handled by store
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground transition-colors duration-500">
            <div className="absolute inset-0 aurora-bg opacity-40"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            {/* Floating Card */}
            <div className="relative z-10 w-full max-w-md p-4">
                <div className="glass-panel p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
                    {/* Clean Glass Background */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0"></div>

                    <div className="relative z-10">
                        {/* Brand Header */}
                        <div className="flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <ShutterLogo />
                                <span className="text-2xl font-serif font-bold tracking-tight text-white/90 group-hover:text-amber-200 transition-colors">Designika</span>
                            </Link>
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-serif mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
                                <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>Start your design journey.</p>
                            </div>
                            <Link to="/" className="w-10 h-10 rounded-full border border-current opacity-20 flex items-center justify-center cursor-pointer hover:opacity-100 transition-all" style={{ color: 'var(--text-primary)' }}>
                                <X size={16} />
                            </Link>
                        </div>

                        {(error || validationError) && (
                            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {validationError || error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--text-muted)' }}>Username</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="StudioName"
                                    required
                                    className="w-full bg-white/5 border border-current rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none focus:border-opacity-100 transition-all"
                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full bg-white/5 border border-current rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none focus:border-opacity-100 transition-all"
                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--text-muted)' }}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-current rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none focus:border-opacity-100 transition-all"
                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-current rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none focus:border-opacity-100 transition-all"
                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 shadow-lg mt-4"
                                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                            >
                                {isLoading ? 'Creating...' : 'Create Account'}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-current border-opacity-10 text-center" style={{ borderColor: 'var(--glass-border)' }}>
                            <Link
                                to="/login"
                                className="text-xs hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Already have an account? <span className="font-bold underline" style={{ color: 'var(--text-primary)' }}>Sign In</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
