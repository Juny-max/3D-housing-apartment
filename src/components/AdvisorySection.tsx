import { Check } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { InquiryPayload, RESIDENCES, validateInquiryForm } from '../data/residences';

interface AdvisorySectionProps {
  preselectedResidenceTitle: string;
}

interface SubmittedInquiry extends InquiryPayload {
  id: string;
  submittedAt: string;
}

const RESIDENCE_OPTIONS = [
  ...RESIDENCES.map((r) => `${r.shortTitle} — ${r.price}`),
  'General Portfolio Consultation',
];

export function AdvisorySection({ preselectedResidenceTitle }: AdvisorySectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [residenceTitle, setResidenceTitle] = useState(
    preselectedResidenceTitle || RESIDENCE_OPTIONS[0],
  );
  const [format, setFormat] = useState<InquiryPayload['format']>('Private In-Person Tour');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [submittedList, setSubmittedList] = useState<SubmittedInquiry[]>([]);

  useEffect(() => {
    if (preselectedResidenceTitle) {
      setResidenceTitle(preselectedResidenceTitle);
    }
  }, [preselectedResidenceTitle]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: InquiryPayload = {
      fullName,
      email,
      residenceTitle,
      format,
      notes,
    };

    const result = validateInquiryForm(payload);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    const entry: SubmittedInquiry = {
      ...payload,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      notes: payload.notes.trim(),
      id: `inq-${Date.now()}`,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSubmittedList((prev) => [entry, ...prev]);
    setFullName('');
    setEmail('');
    setNotes('');
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 bg-white border-t border-hairline overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight leading-[1.04] mb-6 [text-wrap:balance]">
              Arrange a Private Viewing.
            </h2>
            <p className="text-sm sm:text-base font-light text-stone leading-relaxed mb-10">
              Schedule an in-person architectural tour or live walkthrough with one of our senior
              residential advisors.
            </p>

            <dl className="space-y-4 text-sm border-t border-hairline pt-8">
              <div>
                <dt className="text-xs font-medium text-stone mb-1">Studio</dt>
                <dd className="font-medium text-obsidian">420 Mercer Square, Suite 9B</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-stone mb-1">Direct Desk</dt>
                <dd className="font-medium text-obsidian">advisory@atelierkova.com</dd>
              </div>
            </dl>

            {submittedList.length > 0 && (
              <div
                className="mt-8 rounded-2xl border border-hairline bg-alabaster p-5"
                aria-live="polite"
                data-testid="confirmed-inquiries"
              >
                <p className="text-xs font-medium text-obsidian mb-3">
                  Requested Viewings ({submittedList.length})
                </p>
                <ul className="space-y-2.5">
                  {submittedList.map((item) => (
                    <li
                      key={item.id}
                      className="text-xs text-stone border-t border-hairline pt-2.5 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-medium text-obsidian block">
                          {item.residenceTitle}
                        </span>
                        <span>
                          {item.fullName} · {item.format}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-[11px] shrink-0">
                        {item.submittedAt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <form
              id="inquiry-form"
              noValidate
              onSubmit={handleSubmit}
              className="space-y-8 bg-alabaster rounded-[28px] p-8 sm:p-12 border border-hairline"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="inquiry-name"
                    className="block text-xs font-medium text-stone mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    aria-invalid={Boolean(errors.fullName)}
                    className="w-full bg-transparent border-b border-obsidian/25 py-3 text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-700" role="alert">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="inquiry-email"
                    className="block text-xs font-medium text-stone mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    aria-invalid={Boolean(errors.email)}
                    className="w-full bg-transparent border-b border-obsidian/25 py-3 text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-700" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="inquiry-residence"
                    className="block text-xs font-medium text-stone mb-2"
                  >
                    Residence of Interest
                  </label>
                  <select
                    id="inquiry-residence"
                    value={residenceTitle}
                    onChange={(e) => setResidenceTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-obsidian/25 py-3 text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors"
                  >
                    {RESIDENCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-format"
                    className="block text-xs font-medium text-stone mb-2"
                  >
                    Preferred Format
                  </label>
                  <select
                    id="inquiry-format"
                    value={format}
                    onChange={(e) =>
                      setFormat(e.target.value as InquiryPayload['format'])
                    }
                    className="w-full bg-transparent border-b border-obsidian/25 py-3 text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors"
                  >
                    <option value="Private In-Person Tour">Private In-Person Tour</option>
                    <option value="Live Architectural Video Tour">
                      Live Architectural Video Tour
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inquiry-notes"
                  className="block text-xs font-medium text-stone mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="inquiry-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your ideal living space or timing..."
                  className="w-full bg-transparent border-b border-obsidian/25 py-3 text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-obsidian text-white text-xs font-medium px-8 py-4 hover:bg-stone transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Request Viewing
                </button>

                {submittedList.length > 0 && Object.keys(errors).length === 0 && (
                  <span
                    role="status"
                    className="inline-flex items-center gap-2 text-xs text-obsidian font-medium"
                  >
                    <Check className="w-4 h-4" />
                    <span>Request received. An advisor will reply within 2 hours.</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
