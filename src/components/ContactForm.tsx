import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, ExternalLink, Check } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface ContactFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    business_name: string;
    business_address: string;
  }) => Promise<void>;
  businessName: string;
  businessAddress: string;
}

export function ContactForm({ onSubmit, businessName, businessAddress }: ContactFormProps) {
  const { t } = useTranslation();
  const [phoneValue, setPhoneValue] = useState('');
  const [formValues, setFormValues] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    terms: false,
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone: string) => phone.replace(/\D/g, '').length >= 10;

  const isFieldValid = (field: keyof typeof formValues | 'phone') => {
    if (!touched[field]) return true;
    if (field === 'name') return !!formValues.name.trim();
    if (field === 'email') return validateEmail(formValues.email.trim());
    if (field === 'phone') return validatePhoneNumber(phoneValue);
    return true;
  };

  const isFormValid = () =>
    formValues.name.trim() &&
    validateEmail(formValues.email.trim()) &&
    validatePhoneNumber(phoneValue) &&
    termsAccepted;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, terms: true });
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formValues.name,
        email: formValues.email,
        phone: phoneValue,
        business_name: businessName,
        business_address: businessAddress,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        {t('contact.title')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={formValues.name}
            onChange={handleInputChange}
            onBlur={() => handleBlur('name')}
            placeholder={t('contact.name')}
            className={`w-full rounded-lg border py-3 pl-10 text-gray-900 focus:outline-none focus:ring-1 transition ${
              !isFieldValid('name')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-green-500'
            }`}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleInputChange}
            onBlur={() => handleBlur('email')}
            placeholder={t('contact.email')}
            className={`w-full rounded-lg border py-3 pl-10 text-gray-900 focus:outline-none focus:ring-1 transition ${
              !isFieldValid('email')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-green-500'
            }`}
          />
        </div>

        <div className="relative">
          <PhoneInput
            country={'us'}
            enableSearch={false}
            inputProps={{
              name: 'phone',
              placeholder: t('contact.phone'),
            }}
            containerClass={`phone-input-container ${
              !isFieldValid('phone') ? 'error' : ''
            }`}
            countryCodeEditable={false}
            value={phoneValue}
            onChange={setPhoneValue}
            onBlur={() => {
              handleBlur('phone');
              if (!validatePhoneNumber(phoneValue)) {
                setTouched(prev => ({ ...prev, phone: true }));
              }
            }}
          />
        </div>

        <div className="relative pl-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                onBlur={() => handleBlur('terms')}
                className="sr-only"
              />
              <div 
                className={`h-5 w-5 rounded border transition-colors ${
                  termsAccepted 
                    ? 'bg-green-500 border-green-500' 
                    : touched.terms 
                      ? 'border-red-500' 
                      : 'border-gray-300 group-hover:border-green-500'
                }`}
              >
                {termsAccepted && (
                  <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {t('contact.terms.text')}{' '}
              <a
                href="https://polydom.ai/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 inline-flex items-center gap-1 group-hover:underline"
              >
                {t('contact.terms.service')}
                <ExternalLink className="h-3 w-3" />
              </a>
              {' '}{t('contact.terms.and')}{' '}
              <a
                href="https://polydom.ai/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 inline-flex items-center gap-1 group-hover:underline"
              >
                {t('contact.terms.privacy')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
          style={{
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
          disabled={!isFormValid()}
        >
          {isSubmitting ? t('contact.button.loading') : t('contact.button.start')}
        </button>
      </form>
    </div>
  );
}