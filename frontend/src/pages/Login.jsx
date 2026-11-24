import { useContext, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import { API_URL } from '../config.js'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext) || {}
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const value = identifier.trim()
    // The backend login controller accepts email and username; update these keys if its schema changes.
    const payload = {
      email: value,
      username: value,
      password,
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, payload, { withCredentials: true })
      const userData = response.data?.user

      if (!userData) {
        throw new Error('The server response did not include user data.')
      }

      if (login) {
        login(userData)
      }

      const fromPath =
        location.state?.from?.pathname ||
        (typeof location.state?.from === 'string' ? location.state.from : null) ||
        '/'
      const destination = ['/login', '/register', '/signup'].includes(fromPath)
        ? '/'
        : fromPath

      navigate(destination, { replace: true })
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message || requestError.message
        : requestError instanceof Error
          ? requestError.message
          : 'Unable to log in. Please try again.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-50">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <Link to="/" className="mb-8 inline-block text-2xl font-bold tracking-tight">
          audiora<span className="text-emerald-400">.</span>
        </Link>

        <h1 className="text-3xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-zinc-400">Welcome back. Your music is waiting.</p>

        {location.state?.successMessage && (
          <p role="status" className="mt-5 rounded-lg border border-emerald-900 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">
            {location.state.successMessage}
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-zinc-200">
              Email or Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New to Audiora?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
