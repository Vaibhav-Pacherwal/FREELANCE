import { useState, useEffect, useRef } from 'react'
import './App.css'

/* ── Constants ── */
const PHONE_1 = '+918850427667'
const PHONE_1_DISPLAY = '+91 88504 27667'
const PHONE_2 = '+919702709270'
const PHONE_2_DISPLAY = '+91 9702 709 270'
// This is the number already used by the site. Confirm with the client that it is WhatsApp-enabled.
const WHATSAPP_NUMBER = '918850427667'
const EMAIL = 'bombayambulance.149@gmail.com'
const INSTAGRAM_URL = 'https://www.instagram.com/bombayambulance/'
const FACEBOOK_URL = 'https://www.facebook.com/61576424741431/'
const MAPS_URL = 'https://www.google.com/maps/place/Mira+Bhayandar,+Maharashtra/@19.2899,72.8565,17z/data=!4m6!3m5!1s0x3be7b05931cfcaf1:0x747d46e84f49bcf1!8m2!3d19.2952325!4d72.8543897!16zL20vMGY1bXM5?hl=en'
const buildWhatsAppUrl = (message = 'Hello, I need an ambulance service. Please share availability and details.') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
const WHATSAPP_URL = buildWhatsAppUrl()

/* ── SVG Icon Components ── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)

const ThermometerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
)

const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ── Scroll Observer Hook ── */
function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    const children = el.querySelectorAll('.fade-in-up')
    children.forEach(child => observer.observe(child))

    return () => observer.disconnect()
  }, [])

  return ref
}


/* ── Siren Bar Component ── */
function SirenBar() {
  return (
    <div className="siren-bar" role="presentation" aria-hidden="true">
      <div className="siren-bar__sweep" />
    </div>
  )
}


/* ── Navigation ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav__inner">
        <a href="#hero" className="nav__brand" aria-label="Bombay Cardiac Ambulance — Home">
          <div className="nav__logo-icon">
            <img src="/bca_logo.png" alt="" width="38" height="38" />
          </div>
          <div className="nav__name">
            Bombay Cardiac<br/>Ambulance
            <span>We Care, We Save Lives</span>
          </div>
        </a>

        <div className="nav__links">
          <a href="#services" className="nav__link">Services</a>
          <a href="#how-it-works" className="nav__link">How It Works</a>
          <a href="#about" className="nav__link">About</a>
          <a href="#contact" className="nav__link">Contact</a>
          <a href={`tel:${PHONE_1}`} className="nav__cta">
            <PhoneIcon /> Call Now
          </a>
        </div>

        <button
          className={`nav__toggle ${menuOpen ? 'nav__toggle--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav__mobile-menu ${menuOpen ? 'nav__mobile-menu--open' : ''}`}>
        <a href="#services" className="nav__mobile-link" onClick={closeMenu}>Services</a>
        <a href="#how-it-works" className="nav__mobile-link" onClick={closeMenu}>How It Works</a>
        <a href="#about" className="nav__mobile-link" onClick={closeMenu}>About</a>
        <a href="#contact" className="nav__mobile-link" onClick={closeMenu}>Contact</a>
        <a href={`tel:${PHONE_1}`} className="nav__mobile-cta" onClick={closeMenu}>
          <PhoneIcon /> Call Now
        </a>
      </div>
    </nav>
  )
}


/* ── Hero ── */
function Hero() {
  return (
    <section className="hero container" id="hero">
      <div className="hero__layout">
        <div className="hero__content">
          <div className="overline hero__overline">Emergency Cardiac Ambulance Service</div>
          <h1 className="hero__title">
            When Every<br/>Second Counts,<br/>We <em>Respond</em>
          </h1>
          <p className="hero__subtitle">
            24/7 cardiac and critical care ambulance service across Mumbai.
            Equipped vehicles, trained medical staff, ready when you need us.
          </p>
          <div className="hero__actions">
            <a href={`tel:${PHONE_1}`} className="btn btn--primary" id="hero-call-btn">
              <PhoneIcon /> Call Now
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" id="hero-whatsapp-btn">
              <WhatsAppIcon /> WhatsApp
            </a>
          </div>
          <div className="hero__phones">
            <div className="hero__phone-item">
              <PhoneIcon />
              <a href={`tel:${PHONE_1}`}>{PHONE_1_DISPLAY}</a>
            </div>
            <div className="hero__phone-item">
              <PhoneIcon />
              <a href={`tel:${PHONE_2}`}>{PHONE_2_DISPLAY}</a>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__ambulance-wrapper">
            <div className="hero__siren-glow" aria-hidden="true" />
            <img
              src="/ambulance-hero.jpg"
              alt="Bombay Cardiac Ambulance — illustrated side view of an emergency ambulance with red and green markings"
              className="hero__ambulance-img"
              width="800"
              height="450"
              loading="eager"
            />
            <svg className="hero__ecg-line" viewBox="0 0 800 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 30 L150 30 L180 30 L200 8 L220 52 L240 20 L260 40 L280 30 L400 30 L430 30 L450 6 L470 54 L490 18 L510 42 L530 30 L800 30" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ── Response Line Divider ── */
function ResponseDivider() {
  return (
    <div className="response-divider" role="presentation" aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        {/* ECG-style response line */}
        <path
          className="response-divider__line"
          d="M0 60 L200 60 L240 60 L260 15 L280 105 L300 30 L320 75 L340 60 L600 60 L640 60 L660 10 L680 110 L700 25 L720 80 L740 60 L1000 60 L1040 60 L1060 12 L1080 108 L1100 28 L1120 78 L1140 60 L1440 60"
        />
        {/* Miniature ambulance traveling on the line */}
        <g className="response-divider__ambulance">
          <g className="response-divider__ambulance-icon">
            <rect x="0" y="48" width="28" height="16" rx="2" fill="#F8F6F2" stroke="#1A1A1A" strokeWidth="1.5"/>
            <rect x="20" y="44" width="12" height="20" rx="2" fill="#F8F6F2" stroke="#1A1A1A" strokeWidth="1.5"/>
            <rect x="22" y="46" width="8" height="8" rx="1" fill="#2D6A4F" opacity="0.3"/>
            <line x1="8" y1="52" x2="18" y2="52" stroke="#D0342C" strokeWidth="2"/>
            <line x1="13" y1="49" x2="13" y2="55" stroke="#D0342C" strokeWidth="2"/>
            <rect x="24" y="40" width="6" height="3" rx="1" fill="#D0342C"/>
            <circle cx="7" cy="66" r="3" fill="#1A1A1A"/>
            <circle cx="25" cy="66" r="3" fill="#1A1A1A"/>
          </g>
        </g>
      </svg>
    </div>
  )
}


/* ── Services Section ── */
function Services() {
  const sectionRef = useScrollReveal()

  const criticalCare = [
    { icon: <HeartIcon />, name: 'Cardiac Ambulance', desc: 'Advanced cardiac life support with monitoring equipment' },
    { icon: <ActivityIcon />, name: 'ICU / NICU Ambulance', desc: 'Intensive and neonatal critical care transport' },
    { icon: <WindIcon />, name: 'Oxygen Ambulance', desc: 'Continuous oxygen supply for respiratory emergencies' },
    { icon: <ThermometerIcon />, name: 'Airway Management', desc: 'Airway management support for critical patients' },
  ]

  const patientTransport = [
    { icon: <TruckIcon />, name: 'Basic Ambulance', desc: 'Standard patient transport with essential medical support' },
    { icon: <ShieldIcon />, name: 'AC Ambulance', desc: 'Climate-controlled ambulance for patient comfort' },
    { icon: <MapPinIcon />, name: 'Road Ambulance', desc: 'Intercity and all-India patient transport by road' },
  ]

  const specialized = [
    { icon: <PlaneIcon />, name: 'Air Ambulance', desc: 'Domestic and international air medical transfers' },
    { icon: <BoxIcon />, name: 'Mortuary Service', desc: 'Dead body freezer box and mortuary transport service' },
  ]

  const ServiceCard = ({ service }) => (
    <div className="service-card fade-in-up">
      <div className="service-card__icon">{service.icon}</div>
      <div className="service-card__content">
        <h4>{service.name}</h4>
        <p>{service.desc}</p>
      </div>
    </div>
  )

  return (
    <section className="services section-padding container" id="services" ref={sectionRef}>
      <div className="services__header">
        <div className="overline">Our Fleet</div>
        <h2>Every <em>Emergency,</em><br/>Every Distance</h2>
        <p className="services__subtitle">
          From critical cardiac transport to intercity road ambulance and air transfers —
          we operate a range of equipped vehicles for different medical situations.
        </p>
      </div>

      <div className="services__grid">
        <div className="service-group">
          <div className="service-group__label">Critical Care</div>
          {criticalCare.map((s, i) => <ServiceCard key={i} service={s} />)}
        </div>

        <div className="service-group">
          <div className="service-group__label">Patient Transport</div>
          {patientTransport.map((s, i) => <ServiceCard key={i} service={s} />)}
          <div style={{marginTop: 'var(--space-2xl)'}}>
            <div className="service-group__label">Specialized</div>
            {specialized.map((s, i) => <ServiceCard key={i} service={s} />)}
          </div>
        </div>

        <div className="services__featured fade-in-up">
          <img
            src="/route-scene.jpg"
            alt="Illustrated ambulance journey through Mumbai — from pickup to hospital"
            width="600"
            height="337"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}


/* ── How It Works ── */
function HowItWorks() {
  const sectionRef = useScrollReveal()

  return (
    <section className="how-it-works section-padding" id="how-it-works" ref={sectionRef}>
      <div className="container">
        <div className="how-it-works__header">
          <div className="overline">How It Works</div>
          <h2>From <em>Call</em> to Care</h2>
        </div>

        <div className="how-it-works__steps">
          <div className="step fade-in-up">
            <div className="step__number">
              <span className="step__number-text">1</span>
            </div>
            <h3>You Call</h3>
            <p>
              Call us any time, day or night. Share the patient's condition and pickup location.
            </p>
          </div>

          <div className="step fade-in-up">
            <div className="step__number">
              <span className="step__number-text">2</span>
            </div>
            <h3>We Dispatch</h3>
            <p>
              The nearest suitable ambulance is dispatched with trained medical staff on board.
            </p>
          </div>

          <div className="step fade-in-up">
            <div className="step__number">
              <span className="step__number-text">3</span>
            </div>
            <h3>Care Arrives</h3>
            <p>
              Our equipped vehicle reaches you. Patient care begins on-site and continues en route.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ── Trust Section ── */
function Trust() {
  const sectionRef = useScrollReveal()

  const trustItems = [
    {
      icon: <ClockIcon />,
      title: '24/7 Availability',
      desc: 'Our ambulance service operates around the clock, every day of the year. Emergencies don\'t follow schedules — neither do we.',
    },
    {
      icon: <UsersIcon />,
      title: 'Trained Medical Staff',
      desc: 'Ambulances are staffed with trained personnel equipped to handle cardiac and critical care situations during transport.',
    },
    {
      icon: <ActivityIcon />,
      title: 'Equipped Vehicles',
      desc: 'Our fleet includes ambulances with cardiac monitors, oxygen supply, airway management tools, and ICU-grade equipment.',
    },
    {
      icon: <ShieldIcon />,
      title: 'Service You Can Trust',
      desc: 'We serve patients across Mumbai with a commitment to responsive, professional emergency medical transport.',
    },
  ]

  return (
    <section className="trust section-padding" id="about" ref={sectionRef}>
      <div className="container">
        <div className="trust__header">
          <div className="overline">Why Choose Us</div>
          <h2>Built for <em>Critical</em><br/>Moments</h2>
        </div>

        <div className="trust__grid">
          {trustItems.map((item, i) => (
            <div className="trust-item fade-in-up" key={i}>
              <div className="trust-item__icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="trust__stat-strip">
          <div className="trust__stat fade-in-up">
            <div className="trust__stat-value">24/7</div>
            <div className="trust__stat-label">Always Available</div>
          </div>
          <div className="trust__stat fade-in-up">
            <div className="trust__stat-value">9+</div>
            <div className="trust__stat-label">Service Types</div>
          </div>
          <div className="trust__stat fade-in-up">
            <div className="trust__stat-value">All India</div>
            <div className="trust__stat-label">Road Transport Coverage</div>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ── Transport & Coverage ── */
function Transport() {
  const sectionRef = useScrollReveal()

  const features = [
    'Intercity patient transport across India',
    'Air ambulance for domestic and international transfers',
    'ICU-equipped vehicles for critical long-distance transport',
    'Mortuary freezer box service available',
    'Both emergency and planned transfer support',
  ]

  return (
    <section className="transport section-padding container" ref={sectionRef}>
      <div className="transport__layout">
        <div className="transport__content">
          <div className="overline fade-in-up">Transport & Coverage</div>
          <h2 className="fade-in-up">Beyond <em>Mumbai,</em><br/>Across India</h2>
          <p className="transport__text fade-in-up">
            Whether it's within Mumbai or across the country, we coordinate patient
            transport by road and air. Our intercity ambulance service covers all
            major routes, and air ambulance transfers are arranged for domestic and
            international needs.
          </p>
          <div className="transport__features">
            {features.map((f, i) => (
              <div className="transport__feature fade-in-up" key={i}>
                <div className="transport__feature-icon"><CheckIcon /></div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="transport__visual fade-in-up">
          <img
            src="/transport-coverage.jpg"
            alt="Map of India showing ambulance routes from Mumbai to Delhi, Pune, and Bangalore with road and air transport icons"
            className="transport__image"
            width="600"
            height="450"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}


/* ── Contact Section ── */
function Contact() {
  const sectionRef = useScrollReveal()
  const [formState, setFormState] = useState({ name: '', phone: '', pickupLocation: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coordinates, setCoordinates] = useState(null)
  const [locationStatus, setLocationStatus] = useState({ type: '', message: '' })
  const [isLocating, setIsLocating] = useState(false)

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }))
    if (status.message) setStatus({ type: '', message: '' })
    if (isSubmitting) setIsSubmitting(false)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Current location is not available in this browser. Please enter your pickup location manually.' })
      return
    }

    setIsLocating(true)
    setLocationStatus({ type: '', message: '' })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const capturedCoordinates = {
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }
        const coordinateLabel = `Current location coordinates: ${capturedCoordinates.latitude}, ${capturedCoordinates.longitude}`
        setCoordinates(capturedCoordinates)
        setFormState((current) => current.pickupLocation.trim()
          ? current
          : { ...current, pickupLocation: coordinateLabel })
        setLocationStatus({ type: 'success', message: 'Current coordinates captured. You can edit the pickup location before sending.' })
        setIsLocating(false)
      },
      (error) => {
        const messages = {
          [error.PERMISSION_DENIED]: 'Location permission was denied. Please enter your pickup location manually.',
          [error.POSITION_UNAVAILABLE]: 'Your current location is unavailable. Please enter your pickup location manually.',
          [error.TIMEOUT]: 'Location request timed out. Please enter your pickup location manually.',
        }
        setLocationStatus({ type: 'error', message: messages[error.code] || 'Unable to retrieve your location. Please enter your pickup location manually.' })
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const name = formState.name.trim()
    const phone = formState.phone.trim()
    const pickupLocation = formState.pickupLocation.trim()
    const message = formState.message.trim()
    const phoneDigits = phone.replace(/\D/g, '')

    if (!name || phoneDigits.length < 7 || !pickupLocation) {
      setStatus({ type: 'error', message: 'Please enter your name, a valid phone number, and pickup location.' })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    const enquiry = [
      'Hello, I need an ambulance.',
      '',
      `Name: ${name}`,
      `Contact number: ${phone}`,
      ...(message ? [`Additional details: ${message}`] : []),
      `Pickup location: ${pickupLocation}`,
      ...(coordinates ? [`Google Maps: https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`] : []),
      '',
      'Please confirm ambulance availability and contact me as soon as possible.',
    ].join('\n')

    const enquiryWindow = window.open(buildWhatsAppUrl(enquiry), '_blank')
    if (!enquiryWindow) {
      setStatus({ type: 'error', message: 'We could not open WhatsApp. Please allow pop-ups or use the WhatsApp contact link above.' })
      setIsSubmitting(false)
      return
    }
    enquiryWindow.opener = null

    setStatus({ type: 'success', message: 'WhatsApp has opened with your enquiry. Please review it and tap Send to contact us.' })
  }

  return (
    <section className="contact section-padding container" id="contact" ref={sectionRef}>
      <div className="contact__layout">
        <div className="contact__info">
          <div className="overline fade-in-up">Get in Touch</div>
          <h2 className="fade-in-up">Reach Us <em>Now</em></h2>
          <p className="contact__tagline fade-in-up">We Care, We Save Lives</p>

          <div className="contact__channels">
            <a href={`tel:${PHONE_1}`} className="contact__channel fade-in-up" id="contact-phone-1">
              <div className="contact__channel-icon"><PhoneIcon /></div>
              <div className="contact__channel-text">
                <span className="contact__channel-label">Primary Line</span>
                <span className="contact__channel-value">{PHONE_1_DISPLAY}</span>
              </div>
            </a>

            <a href={`tel:${PHONE_2}`} className="contact__channel fade-in-up" id="contact-phone-2">
              <div className="contact__channel-icon"><PhoneIcon /></div>
              <div className="contact__channel-text">
                <span className="contact__channel-label">Secondary Line</span>
                <span className="contact__channel-value">{PHONE_2_DISPLAY}</span>
              </div>
            </a>

            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact__channel contact__channel--whatsapp fade-in-up" id="contact-whatsapp">
              <div className="contact__channel-icon"><WhatsAppIcon /></div>
              <div className="contact__channel-text">
                <span className="contact__channel-label">WhatsApp</span>
                <span className="contact__channel-value">Message Us</span>
              </div>
            </a>

            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Ambulance service enquiry')}`} className="contact__channel fade-in-up" id="contact-email">
              <div className="contact__channel-icon">@</div>
              <div className="contact__channel-text">
                <span className="contact__channel-label">Email</span>
                <span className="contact__channel-value">{EMAIL}</span>
              </div>
            </a>

            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="contact__channel fade-in-up" id="contact-location">
              <div className="contact__channel-icon"><MapPinIcon /></div>
              <div className="contact__channel-text">
                <span className="contact__channel-label">Location reference</span>
                <span className="contact__channel-value">Mira Bhayandar, Maharashtra</span>
              </div>
            </a>
          </div>
        </div>

        <div className="contact__form-wrapper fade-in-up">
          <h3 className="contact__form-title">Send Us a Message</h3>
          <p className="contact__form-note">
            This form is for general inquiries. For emergencies, please call directly.
          </p>
          <form onSubmit={handleSubmit} id="contact-form">
            <div className="form-group">
              <label htmlFor="contact-name">Your Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formState.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone">Phone Number</label>
              <input
                type="tel"
                id="contact-phone"
                name="phone"
                value={formState.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
                inputMode="tel"
                pattern="[0-9+()\\s-]{7,}"
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-pickup-location">Pickup Location</label>
              <input
                type="text"
                id="contact-pickup-location"
                name="pickupLocation"
                value={formState.pickupLocation}
                onChange={(e) => updateField('pickupLocation', e.target.value)}
                required
                autoComplete="street-address"
              />
              <button type="button" className="location-button" onClick={useCurrentLocation} disabled={isLocating}>
                <MapPinIcon />
                {isLocating ? 'Finding your location…' : 'Use My Current Location'}
              </button>
              <div className="location-status" role="status" aria-live="polite">
                {locationStatus.message && <p className={`location-status--${locationStatus.type}`}>{locationStatus.message}</p>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formState.message}
                onChange={(e) => updateField('message', e.target.value)}
                rows="4"
              />
            </div>
            <div className="form-status" role="status" aria-live="polite">
              {status.message && <p className={`form-status--${status.type}`}>{status.message}</p>}
            </div>
            <button type="submit" className="form-submit" id="contact-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Inquiry Ready in WhatsApp' : 'Send Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}


/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__brand-name">Bombay Cardiac Ambulance</div>
            <div className="footer__brand-tagline">We Care, We Save Lives</div>
            <p className="footer__brand-desc">
              24/7 cardiac and critical care ambulance service. From basic patient transport to
              air ambulance transfers — we serve patients across Mumbai and beyond.
            </p>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Quick Links</div>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Emergency Lines</div>
            <ul>
              <li><a href={`tel:${PHONE_1}`}>{PHONE_1_DISPLAY}</a></li>
              <li><a href={`tel:${PHONE_2}`}>{PHONE_2_DISPLAY}</a></li>
              <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li>
              <li><a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Ambulance service enquiry')}`}>Email Us</a></li>
              <li><a href={MAPS_URL} target="_blank" rel="noopener noreferrer">Mira Bhayandar location</a></li>
              <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Bombay Cardiac Ambulance on Instagram">Instagram</a></li>
              <li><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Bombay Cardiac Ambulance on Facebook">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copy">
            © {new Date().getFullYear()} Bombay Cardiac Ambulance. All rights reserved.
          </div>
          <div className="footer__credit">
            Crafted by <a href="https://estaris.com" target="_blank" rel="noopener noreferrer">Estaris</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


/* ── Floating Ambulance Contact Widget ── */
function FloatingAmbulanceContact() {
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className={`ambulance-contact ${isOpen ? 'ambulance-contact--open' : ''}`} ref={widgetRef}>
      <div className="ambulance-contact__actions" id="ambulance-contact-actions" aria-hidden={!isOpen}>
        <a href={`tel:${PHONE_1}`} tabIndex={isOpen ? 0 : -1} className="ambulance-contact__action ambulance-contact__action--call" aria-label="Call Bombay Cardiac Ambulance"><PhoneIcon /><span>Call</span></a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" tabIndex={isOpen ? 0 : -1} className="ambulance-contact__action ambulance-contact__action--whatsapp" aria-label="Message Bombay Cardiac Ambulance on WhatsApp"><WhatsAppIcon /><span>WhatsApp</span></a>
      </div>
      <button type="button" className="ambulance-contact__toggle" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="ambulance-contact-actions" aria-label={isOpen ? 'Close emergency contact options' : 'Open emergency contact options'}>
        <span className="ambulance-contact__vehicle" aria-hidden="true"><span className="ambulance-contact__light" /><span className="ambulance-contact__cross">+</span><span className="ambulance-contact__wheel ambulance-contact__wheel--back" /><span className="ambulance-contact__wheel ambulance-contact__wheel--front" /></span>
      </button>
    </div>
  )
}


/* ══════════════════════════════════════════
   APP COMPONENT
   ══════════════════════════════════════════ */
function App() {
  return (
    <>
      <SirenBar />
      <Nav />
      <main>
        <Hero />
        <ResponseDivider />
        <Services />
        <HowItWorks />
        <Trust />
        <Transport />
        <Contact />
      </main>
      <Footer />
      <FloatingAmbulanceContact />
    </>
  )
}

export default App
