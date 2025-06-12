import { Typewriter } from "react-simple-typewriter";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export default function HeroSubheading() {
  return (
    <p className={`text-muted-foreground text-light ${ClashDisplay.className}`}>
      {"A safe space to vent your thoughts, memories, and reflections"}
    </p>
  );
}
