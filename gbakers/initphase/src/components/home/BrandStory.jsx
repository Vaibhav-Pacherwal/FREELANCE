import './BrandStory.css';

export default function BrandStory() {
  return (
    <section className="brand-story section--lg section--burgundy" id="about" aria-label="Our Story">
      <div className="container brand-story__layout">
        {/* Image */}
        <div className="brand-story__visual">
          <div className="brand-story__image-wrap">
            <img
              src="/images/brand-story.jpg"
              alt="A warm artisan bakery interior with wooden shelves, fresh bread, and vintage brass scales"
              className="brand-story__image"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="brand-story__content">
          <span className="label label--gold">Our Ethos</span>

          <h2 className="brand-story__title">
            Where Every Recipe<br />
            Carries a <em>Story</em>
          </h2>

          <div className="brand-story__text">
            <p>
              At Gupta Bakers, every creation begins with a simple belief:
              that the finest ingredients, patient hands, and genuine warmth
              can transform a humble recipe into something extraordinary.
            </p>
            <p>
              Our ovens run with the rhythm of tradition. We bake in small batches,
              honouring time-tested methods while embracing the artistry of
              contemporary patisserie. The result is a collection of treats that
              feel both familiar and remarkable.
            </p>
          </div>

          {/* Pull quote */}
          <blockquote className="brand-story__quote">
            <p>"Crafted with patience,<br />served with pride."</p>
          </blockquote>

          <div className="brand-story__ornament" aria-hidden="true">
            <span />
            <span>✦</span>
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
