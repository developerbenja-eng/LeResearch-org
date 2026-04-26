import Hero from './Hero';
import LatestWorkFeed from './LatestWorkFeed';
import Thesis from './Thesis';
import Tracks from './Tracks';
import Products from './Products';
import Founding from './Founding';
import Footer from './Footer';

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <LatestWorkFeed />
      <Thesis />
      <Tracks />
      <Products />
      <Founding />
      <Footer />
    </div>
  );
}
