import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Apply",
    description:
      "Complete our Business Growth Assessment to help us understand your goals and current financial position.",
    icon: "📋",
  },
  {
    number: "02",
    title: "Strategy Review",
    description:
      "Our experts analyze your application and design a customized roadmap for funding and growth.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "Build Foundation",
    description:
      "We work with you to optimize credit, ensure compliance, and prepare all necessary documentation.",
    icon: "🏗️",
  },
  {
    number: "04",
    title: "Deploy Capital & Scale",
    description:
      "Access the funding you need and execute your growth strategy with ongoing support from BBA.",
    icon: "🚀",
  },
];

const services = [
  {
    title: "Business Funding",
    description:
      "Access SBA loans, lines of credit, equipment financing, and alternative lending options tailored to your business.",
    icon: "💰",
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "Credit Optimization",
    description:
      "Build and optimize your business credit profile to qualify for better rates and higher limits.",
    icon: "📈",
    color: "bg-amber-50 border-amber-200",
  },
  {
    title: "Compliance & Legal",
    description:
      "Ensure your business structure, licenses, and documentation meet lender requirements.",
    icon: "⚖️",
    color: "bg-green-50 border-green-200",
  },
  {
    title: "Automation & Systems",
    description:
      "Implement financial systems and processes that streamline operations and impress lenders.",
    icon: "⚙️",
    color: "bg-purple-50 border-purple-200",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-blue via-brand-blue-light to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-brand-gold text-brand-blue text-sm font-semibold px-4 py-1 rounded-full mb-6">
            Business Banking Alliance
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Unlock Your Business's
            <span className="text-brand-gold block mt-2">
              Full Financial Potential
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            We partner with small and medium businesses to secure funding,
            optimize credit, ensure compliance, and build the foundation for
            sustainable growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="btn-primary text-lg px-8 py-4 inline-block text-center rounded-lg font-semibold bg-brand-gold hover:bg-yellow-400 text-brand-blue transition-colors"
            >
              Start Your Application
            </Link>
            <Link
              href="/portal"
              className="border-2 border-white text-white hover:bg-white hover:text-brand-blue text-lg px-8 py-4 inline-block text-center rounded-lg font-semibold transition-colors"
            >
              Client Portal
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-brand-gold">500+</div>
              <div className="text-blue-200 text-sm mt-1">Clients Funded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-gold">$50M+</div>
              <div className="text-blue-200 text-sm mt-1">Capital Deployed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-gold">95%</div>
              <div className="text-blue-200 text-sm mt-1">Approval Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our proven four-step process takes you from application to funded
              with expert guidance at every stage.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-brand-gold opacity-40 z-0" />
                )}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 relative z-10 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-brand-gold font-bold text-sm mb-2">
                    STEP {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/apply"
              className="bg-brand-blue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-blue-light transition-colors inline-block"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Comprehensive financial solutions designed to help your business
              thrive.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className={`rounded-xl p-6 border-2 ${service.color} hover:shadow-lg transition-all duration-200`}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-brand-blue mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-blue py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-blue-200 text-xl mb-10">
            Join hundreds of businesses that have already unlocked their
            financial potential with BBA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="bg-brand-gold hover:bg-yellow-400 text-brand-blue px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-block"
            >
              Apply Now – It's Free
            </Link>
            <a
              href="mailto:bruce@bbaservices.org"
              className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-blue px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-block"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
