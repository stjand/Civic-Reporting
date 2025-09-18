// File: frontend/src/pages/Login.jsx
import React from 'react'
import { Lock, Mail, KeyRound } from 'lucide-react'

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="heading-md text-center">Login to CivicConnect</h1>
          <p className="body-sm text-center">Manage your reports and track progress</p>
        </div>

        <form className="space-y-6">
          <div className="input-group">
            <label className="input-label">Email address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex items-center justify-between">
              <label className="input-label">Password</label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary btn-lg w-full"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login