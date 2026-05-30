import Header from './components/Header';
import Hero from './components/Hero';
import ProcessoSeletivo from './components/ProcessoSeletivo';
import CategoryCards from './components/CategoryCards';
import ProximasTurmas from './components/ProximasTurmas';
import PorQueIPESSP from './components/PorQueIPESSP';
import Depoimentos from './components/Depoimentos';
import CTAFinal from './components/CTAFinal';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] btn btn-primary"
      >
        Ir para conteúdo principal
      </a>

      <Header />

      <main id="main">
        <Hero />
        <ProcessoSeletivo />
        <CategoryCards />
        <ProximasTurmas />
        <PorQueIPESSP />
        <Depoimentos />
        <CTAFinal />
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
