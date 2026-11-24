import { useContext, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import { API_URL } from '../config.js'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('listener')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext) || {}
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, payload, { withCredentials: true })
      const userData = response.data?.user

      if (userData && login) {
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
          : 'Unable to create your account. Please try again.'

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

        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-400">Join Audiora and find your next favorite.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-200">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-zinc-200">
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="listener">Listener</option>
              <option value="artist">Artist</option>
            </select>
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
            {isLoading ? 'Please wait...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}
