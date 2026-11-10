import React from "react";
import { Link } from "react-router";
import HeroSlideshow from "./components/HeroSlideshow.jsx";
import ServiceCard from "./components/ServiceCard.jsx";
import Workflow from "./components/Workflow.jsx";
import { CallToAction, Icon, SectionHeading } from "./components/Common.jsx";
import { services } from "./data.js";
import { useLanguage } from "./language.js";
export default function HomeContent({ marketplacePath }) {
  const { hero, language } = useLanguage();
  return (
    <>
      <HeroSlideshow>
        <div className="hero-eyebrow">
          <span />
          ROOTED IN OUR COAST. READY FOR TOMORROW.
        </div>
        <h1 className={language !== "en" ? "translated-hero" : ""}>
          {hero[0]}
          <br />
          {hero[1]}
          <br />
          <em>{hero[2]}</em>
        </h1>
        <p>{hero[3]}</p>
        <div className="hero-actions">
          <Link to={marketplacePath} className="button">
            {hero[4]}
            <Icon name="ArrowUpRight" size={19} />
          </Link>
          <Link to="/register" className="button outline-light">
            {hero[5]}
            <Icon name="ArrowUpRight" size={19} />
          </Link>
        </div>
        <div className="hero-trust">
          <Icon name="Waves" size={19} />
          <span>For our fishermen. For our harbors. For our future.</span>
        </div>
      </HeroSlideshow>
      <div className="coast-strip">
        <span>BUILT AROUND OUR COAST</span>
        <div>
          <Icon name="Anchor" size={18} />
          Stronger communities
        </div>
        <div>
          <Icon name="ShieldCheck" size={18} />
          More transparent trade
        </div>
        <div>
          <Icon name="Smartphone" size={18} />A simpler digital experience
        </div>
      </div>
      <section className="section container intro-section" id="about">
        <div className="intro-photo" id="gallery">
          <img
            src="/public-home/images/arugam-coast.jpg"
            alt="Boats lined along the Sri Lankan coastline at Arugam Bay"
            loading="lazy"
          />
          <span className="photo-note">
            <Icon name="MapPin" size={16} />
            Our coast. Our connection.
          </span>
        </div>
        <div className="intro-copy">
          <span className="eyebrow">WELCOME TO HARBORX</span>
          <h2>
            A fresh chapter
            <br />
            for an age-old
            <br />
            <em>way of life.</em>
          </h2>
          <p>
            Every catch has a story. Of early mornings, skilled hands and the
            communities that depend on the sea.
          </p>
          <p>
            HarborX brings that journey online — connecting sellers, buyers and
            harbor officers in one simpler, more transparent marketplace.
          </p>
          <Link className="text-link" to="/#about">
            Get to know HarborX <Icon name="ArrowUpRight" size={19} />
          </Link>
        </div>
      </section>
      <section className="section soft-section" id="services">
        <div className="container">
          <SectionHeading
            eyebrow="OUR SERVICES"
            title={
              <>
                Good for the catch.
                <br />
                <em>Better for the community.</em>
              </>
            }
            text="Thoughtful digital tools for every part of the journey, from the first record to the final collection."
          >
            <Link to="/#services" className="text-link">
              All our services <Icon name="ArrowUpRight" size={19} />
            </Link>
          </SectionHeading>
          <div className="services-grid">
            {services.map((service, i) => (
              <ServiceCard key={service.title} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>
      <section className="section container" id="how-it-works">
        <SectionHeading
          eyebrow="HOW HARBORX WORKS"
          title={
            <>
              From a day’s catch
              <br />
              to a <em>new connection.</em>
            </>
          }
          text="A clear path for sellers, buyers and the harbor officers who bring it all together."
        >
          <Link to="/#how-it-works" className="text-link">
            See the whole journey <Icon name="ArrowUpRight" size={19} />
          </Link>
        </SectionHeading>
        <Workflow />
      </section>
      <section className="why-section">
        <div className="why-photo">
          <img
            src="/public-home/images/stilt-fishermen.jpg"
            alt="Stilt fishermen along the Sri Lankan coast"
            loading="lazy"
          />
        </div>
        <div className="why-copy">
          <span className="eyebrow">WHY CHOOSE HARBORX</span>
          <h2>
            Built for the people
            <br />
            behind <em>every catch.</em>
          </h2>
          <p>
            Practical tools. Clear records. More possibilities for the
            communities that keep our harbors moving.
          </p>
          <div className="benefits-grid">
            {[
              ["ShieldCheck", "Improved transparency"],
              ["Store", "Easier market access"],
              ["Gavel", "Efficient auction management"],
              ["Files", "Reduced paperwork"],
              ["Smartphone", "Mobile-friendly experience"],
              ["ClipboardList", "Better record keeping"],
            ].map(([icon, text]) => (
              <div key={text}>
                <Icon name={icon} size={20} />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <Link to="/register" className="button">
            Find your place at HarborX <Icon name="ArrowUpRight" size={19} />
          </Link>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
