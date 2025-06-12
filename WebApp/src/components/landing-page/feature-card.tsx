import type { ReactNode } from "react"
import { Check } from "lucide-react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  features: string[]
}

export default function FeatureCard({ icon, title, description, features }: FeatureCardProps) {
  return (
    <div className="relative group">
      {/* Glowing border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
      
      {/* Main card */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] h-full">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl mr-4 group-hover:from-purple-900/30 group-hover:to-pink-900/30 transition-all duration-300 shadow-lg">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">{title}</h3>
        </div>
        
        <p className="text-gray-400 mb-8 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start group/item">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-300 group-hover/item:text-white transition-colors duration-200">
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        {/* Subtle hover glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  )
}
