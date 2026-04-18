import HeroAnimation from "@/components/HeroAnimation";

export default function Home() {
  return (
    <div className="flex">
      {/* Left side text */}
      <div className="w-1/2">
        {/* your existing content */}
      </div>

      {/* Right side animation */}
      <div className="w-1/2">
        <HeroAnimation />
      </div>
    </div>
  );
}