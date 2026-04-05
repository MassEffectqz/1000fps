import {
  Hero,
  CategoryStrip,
  PromoBlocks,
  HotProducts,
  BrandsSection,
  FeaturesSection,
} from '@/components/sections';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="my-4 sm:my-6" />
      <CategoryStrip />
      <div className="my-6 sm:my-8" />
      <PromoBlocks />
      <div className="my-6 sm:my-8" />
      <HotProducts />
      <div className="my-6 sm:my-8" />
      <BrandsSection />
      <div className="my-6 sm:my-8" />
      <FeaturesSection />
    </>
  );
}
