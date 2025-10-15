import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Forgot Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form>
          <div className="mb-4">
            <label className="label">Email address</label>
            <input type="email" className="input-field" placeholder="your@email.com" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Send Reset Link
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
