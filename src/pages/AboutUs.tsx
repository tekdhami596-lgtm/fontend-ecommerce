import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  Star,
  Users,
  ShoppingBag,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Mail,
  Linkedin,
  Github,
} from "lucide-react";
import myImage from "../assets/tek-dhami.jpg";

const stats = [
  { value: "50,000+", label: "Happy Customers" },
  { value: "10,000+", label: "Products Listed" },
  { value: "77", label: "Districts Delivered" },
  { value: "4.8★", label: "Average Rating" },
];

const values = [
  {
    icon: <ShieldCheck size={28} />,
    title: "Trust & Authenticity",
    desc: "Every product on Dokomart is sourced from verified suppliers. We guarantee 100% genuine items — no counterfeits, no compromises.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <Truck size={28} />,
    title: "Fast Nationwide Delivery",
    desc: "From Mechi to Mahakali, we deliver across all 77 districts of Nepal with real-time order tracking at every step.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <HeartHandshake size={28} />,
    title: "Customer First, Always",
    desc: "Our support team is just a call or message away. Easy returns, hassle-free refunds — because your satisfaction drives us.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: <Star size={28} />,
    title: "Best Value Guaranteed",
    desc: "We work directly with brands and wholesalers to cut out the middleman and pass the savings straight to you.",
    color: "bg-amber-50 text-amber-600",
  },
];

const team = [
  {
    name: "Tek Dhami",
    role: "Founder & CEO",
    qualification: "Computer Engineer",
    avatar: "TD",
    bg: "bg-indigo-100 text-indigo-700",
    image: { myImage },
    bio: "Passionate about building Nepal's most trusted e-commerce platform.",
    location: "Kathmandu, Nepal",
    social: {
      gmail: "tekdhami596@gmail.com",
      linkedin: "linkedin.com/in/tek-dhami-98b28a176",
      github: " https://github.com/tekdhami596-lgtm",
    },
  },
];

const milestones = [
  { year: "2020", event: "Dokomart founded in Kathmandu with 200 products" },
  { year: "2021", event: "Expanded to 10,000+ SKUs across 15 categories" },
  { year: "2022", event: "Launched nationwide delivery to all 77 districts" },
  { year: "2023", event: "Crossed 25,000 happy customers milestone" },
  { year: "2024", event: "Introduced eSewa, Khalti & COD payment options" },
  { year: "2025", event: "50,000+ customers and growing every day" },
];

const AboutUs = () => {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 px-6 py-28 text-white">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide">
            🛍️ Nepal's Trusted Online Store
          </span>
          <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-6xl">
            About{" "}
            <span className="text-indigo-300">
              Doko<span className="text-white">mart</span>
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-indigo-100">
            We started with a simple mission — make quality shopping accessible
            to every Nepali, whether you're in the heart of Kathmandu or a
            village in the hills. Today, we're proud to serve over 50,000
            customers nationwide.
          </p>
          <a
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Explore Our Store <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b bg-gray-50 px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          {/* Text */}
          <div>
            <span className="mb-3 inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Our Story
            </span>
            <h2 className="mb-5 text-4xl leading-tight font-extrabold text-gray-900">
              Born in Nepal, <br />
              Built for Nepal
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              Dokomart was founded in 2020 by a small team of friends who were
              frustrated with the lack of reliable online shopping options in
              Nepal. Product quality was inconsistent, deliveries were
              unreliable, and customer service was nearly non-existent.
            </p>
            <p className="mb-6 leading-relaxed text-gray-600">
              We built Dokomart to fix that. Starting from a small warehouse in
              Kathmandu with just 200 products, we've grown into a platform that
              serves customers across all 77 districts — with verified products,
              transparent pricing, and support you can actually count on.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Locally operated, globally inspired",
                "Direct partnerships with trusted brands",
                "Transparent pricing — no hidden charges",
                "Nepali language support available",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual card */}
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-8">
              <div className="mb-6 grid grid-cols-2 gap-4">
                {[
                  {
                    icon: <ShoppingBag size={22} />,
                    label: "10,000+ Products",
                    color: "bg-indigo-600",
                  },
                  {
                    icon: <Users size={22} />,
                    label: "50,000+ Customers",
                    color: "bg-emerald-500",
                  },
                  {
                    icon: <MapPin size={22} />,
                    label: "77 Districts",
                    color: "bg-rose-500",
                  },
                  {
                    icon: <Star size={22} />,
                    label: "4.8★ Rated",
                    color: "bg-amber-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${item.color}`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-indigo-600 p-5 text-white">
                <p className="text-sm leading-relaxed font-medium">
                  "Our goal is simple — to be the most trusted place to shop
                  online in Nepal. Every decision we make starts with what's
                  best for our customers."
                </p>
                <p className="mt-3 text-xs font-semibold text-indigo-200">
                  — Tek Dhami, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              What We Stand For
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Our Core Values
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.color}`}
                >
                  {v.icon}
                </span>
                <h3 className="mb-2 font-bold text-gray-900">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Milestones ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Our Journey
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Milestones
            </h2>
          </div>
          <div className="relative border-l-2 border-indigo-100 pl-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative mb-8 last:mb-0">
                {/* dot */}
                <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-400 bg-white" />
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                  <span className="mb-1 inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700">
                    {m.year}
                  </span>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              The People Behind Dokomart
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Meet Our Team
            </h2>
          </div>
          <div className="flex justify-center">
            {team.map((member) => (
              <div
                key={member.name}
                className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Avatar / Photo */}
                {member.image ? (
                  <img
                    src={myImage}
                    alt={member.name}
                    className="mx-auto mb-4 h-30 w-30 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div
                    className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold shadow-md ${member.bg}`}
                  >
                    {member.avatar}
                  </div>
                )}

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-indigo-500">
                  {member.role}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {member.qualification}
                </p>

                {/* Bio */}
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {member.bio}
                </p>

                {/* Location */}
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} />
                  <span>{member.location}</span>
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-gray-100" />

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3">
                  {member.social.gmail && (
                    <a
                      href={`mailto:${member.social.gmail}`}
                      title="Gmail"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-100 hover:text-red-500"
                    >
                      <Mail size={14} />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={`https://${member.social.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Linkedin size={14} />
                    </a>
                  )}
                  {member.social.github && (
                    <a
                      href={member.social.github.trim()}
                      target="_blank"
                      rel="noreferrer"
                      title="GitHub"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-800 hover:text-white"
                    >
                      <Github size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-indigo-600 px-6 py-20 text-center text-white">
        <h2 className="mb-4 text-4xl font-extrabold">
          Ready to Start Shopping?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-indigo-100">
          Join over 50,000 happy customers across Nepal. Discover thousands of
          genuine products delivered straight to your door.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/products"
            className="rounded-full bg-white px-8 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Shop Now
          </a>
          <a
            href="/contact-us"
            className="rounded-full border border-white/40 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
