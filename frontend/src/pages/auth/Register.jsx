import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    const { confirmPassword, ...userData } = data
    const result = await registerUser(userData)
    setLoading(false)

    if (result.success) {
      toast.success('Registration successful!')
      navigate('/')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            🗑️ Waste Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input-field"
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="label">Account Type</label>
              <select
                id="role"
                {...register('role')}
                className="input-field"
              >
                <option value="resident">Resident</option>
                <option value="city_manager">City Manager</option>
                <option value="admin">Administrator</option>
                <option value="sustainability_manager">Sustainability Manager</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the type of account you need
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="label">Phone (Optional)</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required'
                  // Validation temporarily disabled
                  // minLength: {
                  //   value: 8,
                  //   message: 'Password must be at least 8 characters'
                  // },
                  // pattern: {
                  //   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  //   message: 'Password must contain uppercase, lowercase, number and special character (@$!%*?&)'
                  // }
                })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              {/* <p className="mt-1 text-xs text-gray-500">
                Must include: uppercase, lowercase, number, special character (@$!%*?&)
              </p> */}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password'
                  // Validation temporarily disabled
                  // validate: value => value === password || 'Passwords do not match'
                })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
