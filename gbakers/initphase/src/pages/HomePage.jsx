import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import SignatureProducts from '../components/home/SignatureProducts';
import Occasions from '../components/home/Occasions';
import BrandStory from '../components/home/BrandStory';
import GiftingSection from '../components/home/GiftingSection';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <Categories />
      <SignatureProducts />
      <Occasions />
      <BrandStory />
      <GiftingSection />
    </div>
  );
}
