export interface Therapist {
  id: string
  name: string
  specialization: string[]
  rating: number
  reviewCount: number
  yearsOfExperience: number
  bio: string
  imageUrl: string
  location: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    zipCode: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  availability: {
    days: string[]
    timeSlots: string[]
  }
  sessionType: ('in-person' | 'online' | 'both')[]
  fees?: {
    consultationFee?: number
    sessionFee?: number
    currency: string
  }
  languages: string[]
  education: string[]
  certifications: string[]
}

export interface TherapistWithDistance extends Therapist {
  distance?: number
  distanceText?: string
  duration?: string
}