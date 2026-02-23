import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ShoppingBag,
  Handshake,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import api from "../api/axios";
import notify from "../helpers/notify";

// ── FAQ Data ───────────────────────────────────────────
const faqs = [
  {
    q: "How long does delivery take?",
    a: "Delivery within Kathmandu Valley takes 1–2 business days. Outside the valley typically takes 3–5 business days depending on your location.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you will receive a tracking number via email. You can also track your order from the My Orders section in your account.",
  },
  {
    q: "How do I return a product?",
    a: "You can request a return within 7 days of delivery. The product must be unused and in its original packaging. Go to My Orders and click 'Return' on the relevant order.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We accept eSewa, and Cash on Delivery.",
  },
  {
    q: "How do I become a seller on Dokomart?",
    a: "Simply create an account and select 'Seller' as your role during signup. Once registered you can access your seller dashboard and start listing products.",
  },
  {
    q: "What if I receive a damaged product?",
    a: "Please take a photo of the damaged product and contact us within 48 hours of delivery. We will arrange a replacement or full refund.",
  },
];

// ── Quick Help Cards ───────────────────────────────────
const helpCards = [
  {
    icon: <ShoppingBag size={22} className="text-indigo-500" />,
    title: "Order Support",
    desc: "Issues with an existing order, tracking, or cancellation",
    bg: "bg-indigo-50",
  },
  {
    icon: <MessageCircle size={22} className="text-emerald-500" />,
    title: "General Inquiry",
    desc: "Questions about our products, policies, or platform",
    bg: "bg-emerald-50",
  },
  {
    icon: <Handshake size={22} className="text-amber-500" />,
    title: "Partnership",
    desc: "Interested in selling on Dokomart or collaborating with us",
    bg: "bg-amber-50",
  },
];

// ── FAQ Item ───────────────────────────────────────────
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-gray-800 hover:text-indigo-600"
      >
        <span>{q}</span>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-indigo-500" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-500">{a}</p>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────
const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      notify.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      notify.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      notify.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-indigo-700 px-6 py-16 text-center text-white">
        <span className="mb-3 inline-block text-xs font-bold tracking-widest text-indigo-300 uppercase">
          We're here to help
        </span>
        <h1 className="text-4xl font-extrabold">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200">
          Have a question, issue, or just want to say hello? Fill out the form
          below or reach us directly. We typically reply within 24 hours.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* ── Quick Help Cards ── */}
        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          {helpCards.map((card) => (
            <div
              key={card.title}
              className={`flex items-start gap-4 rounded-2xl border border-gray-100 ${card.bg} p-5 shadow-sm`}
            >
              <div className="mt-0.5">{card.icon}</div>
              <div>
                <p className="font-semibold text-gray-800">{card.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Form + Details ── */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              Send a Message
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              We'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select a subject</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Return & Refund">Return & Refund</option>
                  <option value="Partnership">Partnership</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Details + Map */}
          <div className="flex flex-col gap-6">
            {/* Details Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Contact Details
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <Mail size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Email
                    </p>

                    <a
                      href="mailto:support@dokomart.com"
                      className="text-sm text-gray-700 hover:text-indigo-500"
                    >
                      support@dokomart.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <Phone size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Phone
                    </p>

                    <a
                      href="tel:+97798484112411"
                      className="text-sm text-gray-700 hover:text-indigo-500"
                    >
                      +977-98-48411241
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <MapPin size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Address
                    </p>
                    <p className="text-sm text-gray-700">Kathmandu, Nepal</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <Clock size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Business Hours
                    </p>
                    <p className="text-sm text-gray-700">
                      Sun – Fri, 9:00 AM – 6:00 PM
                    </p>
                  </div>
                </li>
              </ul>

              {/* Social */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {[
                    {
                      icon: <Facebook size={16} />,
                      href: "#",
                      color: "hover:bg-blue-600",
                    },
                    {
                      icon: <Instagram size={16} />,
                      href: "#",
                      color: "hover:bg-pink-500",
                    },
                    {
                      icon: <Twitter size={16} />,
                      href: "#",
                      color: "hover:bg-sky-500",
                    },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:text-white ${s.color}`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <iframe
                title="Dokomart Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.27776869494!2d85.29111125!3d27.7089396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb978469bf7c1808!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1700000000000"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-14 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mb-2 inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Got Questions?
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-2xl">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactUs;
