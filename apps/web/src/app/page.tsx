import Hero from './Hero';
import Thesis from './Thesis';
import Tracks from './Tracks';
import Products from './Products';
import Founding from './Founding';
import Footer from './Footer';

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Thesis />
      <Tracks />
      <Products />
      <Founding />
      <Footer />
    </div>
  );
}
