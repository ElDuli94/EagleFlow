import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Velkommen til dashbordet!</h1>
        <p className="text-lg text-gray-600 mb-4">
          Hei {user?.email?.split('@')[0] || 'bruker'}, du er nå logget inn på EagleFlow.
        </p>
        <p className="text-gray-600">
          Dette er dashbordet ditt hvor du vil kunne administrere dine VVS-prosjekter.
          Flere funksjoner kommer snart!
        </p>
      </motion.div>
    </div>
  )
}

export default Dashboard 