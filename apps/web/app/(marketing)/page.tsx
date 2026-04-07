import { Hero } from "@/components/marketing/hero";
import {
  Ticker,
  Logos,
  Problem,
  Product,
  Features,
  Trust,
  Numbers,
  Compare,
  Testimonials,
  Pricing,
  CTA,
} from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Ticker />
      <Logos />
      <Problem />
      <Product />
      <Features />
      <Trust />
      <Numbers />
      <Compare />
      <Testimonials />
      <Pricing />
      <CTA />
    </>
  );
}
