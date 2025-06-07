import { Typewriter } from 'react-simple-typewriter'


export default function HeroSubheading() {
  return (
    
    <p className="text-muted-foreground text-light">
      <Typewriter
        words={['A safe space to vent your thoughts, memories, and reflections']}
        loop={1}
        cursor
        cursorStyle="|"
        typeSpeed={50}
        deleteSpeed={50}
        delaySpeed={1000}
      />
    </p>
  )
}