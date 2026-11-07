import {
  Heart, ShieldCheck, Users, Award, Globe, FileText, Languages, MapPin, Phone, Mail,
  MessageCircle, Briefcase, GraduationCap, Newspaper, CalendarDays, Hotel, CreditCard, Stethoscope,
  Target, Siren, Building2, Lightbulb,
} from 'lucide-react';

// Content for the pages opened from the top navigation (About, International, News, Careers, Contact).
// It is general text: hospital staff should review it and adjust it to the services and details that
// are really offered. Contact details match the website footer.
//
// A section can contain any of: paragraphs, list, steps, cards, contacts, news, empty, actions.
export const sitePages = {
  about: {
    icon: Building2,
    eyebrow: 'About us',
    title: 'About HealthOps Hospital',
    tagline: 'Connected, patient-centred healthcare for you and your family.',
    sections: [
      {
        id: 'about',
        title: 'About HealthOps',
        paragraphs: [
          'HealthOps Hospital provides connected, patient-centred healthcare that brings patients, doctors and hospital teams together for safer appointments, trusted medical support and continuous care.',
          'Our online platform makes care easier to reach. Patients can find specialists, book visits and keep their health details in one place. Doctors can manage their schedules, see their patients\' history and record diagnoses and prescriptions, so everyone involved in your care has the information they need.',
        ],
      },
      {
        id: 'mission',
        title: 'Our mission',
        paragraphs: [
          'To provide compassionate, high-quality care that is easy to access, and to treat every patient with dignity, respect and attention.',
        ],
        list: [
          'Make it simple to find the right specialist and book a visit',
          'Keep patients informed and involved in their own care',
          'Support our doctors and staff with tools that save them time for patients',
          'Protect the privacy and security of every patient\'s information',
        ],
      },
      {
        id: 'values',
        title: 'Our values',
        paragraphs: ['These values guide how we care for patients and how we work together.'],
        cards: [
          { icon: Heart, title: 'Compassion', text: 'We listen first and treat every patient and family member with kindness.' },
          { icon: Award, title: 'Excellence', text: 'We hold ourselves to high clinical and service standards, and keep learning.' },
          { icon: ShieldCheck, title: 'Integrity', text: 'We are honest, transparent and protect the confidentiality of patient information.' },
          { icon: Target, title: 'Safety', text: 'Patient safety comes first in every decision, procedure and process.' },
          { icon: Users, title: 'Teamwork', text: 'Doctors, nurses and support teams work together around each patient.' },
        ],
      },
    ],
  },

  international: {
    icon: Globe,
    eyebrow: 'International patients',
    title: 'International Patient Services',
    tagline: 'Help for patients who travel from abroad for their care.',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'If you are planning to travel for treatment, we want the process to feel as simple as possible. Our team can help you understand your options, arrange appointments and prepare for your visit.',
          'Contact us before you travel, so we can discuss your needs and tell you what to expect.',
        ],
      },
      {
        id: 'support',
        title: 'How we can help',
        cards: [
          { icon: CalendarDays, title: 'Appointment coordination', text: 'Help choosing the right specialist and arranging your consultations in advance.' },
          { icon: FileText, title: 'Medical records', text: 'Guidance on which reports, scans and prescriptions to bring or send ahead of your visit.' },
          { icon: Languages, title: 'Communication', text: 'Clear explanations of your diagnosis and treatment plan, with support for your questions.' },
          { icon: Hotel, title: 'Travel and stay', text: 'Information to help you plan your travel and accommodation near the hospital.' },
          { icon: CreditCard, title: 'Billing guidance', text: 'Information about costs and payment, and help with insurance questions.' },
        ],
      },
      {
        id: 'process',
        title: 'How it works',
        steps: [
          'Contact us with a short description of your health needs and the treatment you are considering.',
          'Share your medical records, so our doctors can review your history.',
          'We suggest a care plan and the specialists you should see, and arrange your appointments.',
          'Plan your travel and arrive with the documents you need.',
          'After treatment, we agree a follow-up plan, including how to stay in touch from home.',
        ],
        actions: [{ label: 'Contact our team', to: '/contact' }],
      },
    ],
  },

  news: {
    icon: Newspaper,
    eyebrow: 'News & events',
    title: 'News & Events',
    tagline: 'Updates from HealthOps Hospital.',
    sections: [
      {
        id: 'news',
        title: 'Latest news',
        news: [
          { tag: 'Platform update', title: 'Online appointment booking', text: 'Patients can now choose a doctor, pick an available date and time slot, and request an appointment online.' },
          { tag: 'Platform update', title: 'Doctor profiles', text: 'Doctors can share their specialty, qualifications, clinic location, experience and photo, so patients know who they are booking.' },
          { tag: 'Platform update', title: 'Patient profiles', text: 'Patients can keep their medical details, emergency contact and profile photo in one secure place.' },
        ],
      },
      {
        id: 'events',
        title: 'Events',
        empty: 'There are no upcoming events right now. Please check back soon.',
      },
    ],
  },

  careers: {
    icon: Briefcase,
    eyebrow: 'Careers',
    title: 'Careers at HealthOps',
    tagline: 'Join a team that puts patients first.',
    sections: [
      {
        id: 'working',
        title: 'Working with us',
        paragraphs: [
          'Our people are at the heart of the care we provide. We look for professionals who are skilled, kind and eager to learn, and who want to be part of a team that works together for patients.',
          'We support our staff with training, a respectful workplace and tools that let them spend more time on patient care.',
        ],
      },
      {
        id: 'areas',
        title: 'Areas you could work in',
        cards: [
          { icon: Stethoscope, title: 'Medical', text: 'Doctors and specialists across a wide range of clinical areas.' },
          { icon: Heart, title: 'Nursing', text: 'Nurses and midwives caring for patients in clinics, wards and specialist units.' },
          { icon: GraduationCap, title: 'Allied health and laboratory', text: 'Laboratory, radiology, pharmacy and therapy professionals.' },
          { icon: Lightbulb, title: 'Administration and support', text: 'Reception, records, finance, technology and facilities teams.' },
        ],
      },
      {
        id: 'apply',
        title: 'How to apply',
        steps: [
          'Check the current vacancies below.',
          'Send your CV and a short cover letter to our team, saying which role you are interested in.',
          'If your background matches, we will contact you to arrange an interview.',
        ],
        actions: [{ label: 'Email your application', href: 'mailto:care@healthops.health?subject=Job%20application' }],
      },
      {
        id: 'openings',
        title: 'Current vacancies',
        empty: 'There are no vacancies listed at the moment. You are welcome to send us your CV, and we will keep it on file.',
      },
    ],
  },

  contact: {
    icon: Phone,
    eyebrow: 'Contact',
    title: 'Contact Us',
    tagline: 'We are here to help with questions about appointments, services and care.',
    sections: [
      {
        id: 'contact',
        title: 'Get in touch',
        contacts: [
          { icon: MapPin, label: 'Visit us', value: '42 Health Street, Boston, MA 02108' },
          { icon: Phone, label: 'Call us', value: '+1 (555) 234-5678', href: 'tel:+15552345678' },
          { icon: Mail, label: 'Email us', value: 'care@healthops.health', href: 'mailto:care@healthops.health' },
          { icon: MessageCircle, label: 'WhatsApp', value: '+1 (555) 234-5678', href: 'https://wa.me/15552345678' },
        ],
      },
      {
        id: 'emergency',
        title: 'In an emergency',
        paragraphs: ['If you or someone else needs urgent medical help, call our emergency line straight away.'],
        contacts: [{ icon: Siren, label: '24/7 emergency hotline', value: '+1 (555) 911-CARE', href: 'tel:+15559112273', urgent: true }],
      },
      {
        id: 'help',
        title: 'How can we help?',
        list: [
          'To book an appointment, sign in and use Book a Visit, or call us',
          'To find a doctor, browse our specialists by department',
          'For questions about your records or billing, email or call us with your details',
          'For feedback or concerns about your care, write to us, and we will respond',
        ],
        actions: [
          { label: 'Find a doctor', to: '/doctors' },
          { label: 'Book an appointment', to: '/register' },
        ],
      },
    ],
  },
};

export const getSitePage = (key) => sitePages[key];
