import { Resume } from '@/store/resumeStore';

interface TemplateProps {
  resume: Resume;
}

export default function MinimalTemplate({ resume }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications, sections } = resume;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white text-gray-900 p-8 min-h-[1000px] font-sans text-sm leading-relaxed">
      {/* Clean Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-wide">
          {personalInfo.firstName} <span className="font-semibold">{personalInfo.lastName}</span>
        </h1>
        <div className="text-gray-500 text-sm mt-1 space-x-3">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedIn || personalInfo.github) && (
          <div className="text-gray-500 text-sm mt-1 space-x-3">
            {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
            {personalInfo.github && <span>• {personalInfo.github}</span>}
          </div>
        )}
      </div>

      <hr className="border-gray-200 mb-6" />

      {sortedSections.filter(s => s.visible).map((section) => {
        switch (section.type) {
          case 'summary':
            if (!personalInfo.summary) return null;
            return (
              <div key={section.id} className="mb-6">
                <p className="text-gray-600 italic">{personalInfo.summary}</p>
              </div>
            );

          case 'experience':
            if (experience.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Experience</h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="mb-4">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-semibold">{exp.position}</span>
                        <span className="text-gray-500"> at {exp.company}</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 text-gray-600 space-y-1">
                        {exp.bullets.filter(Boolean).map((bullet, i) => (
                          <li key={i}>— {bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            );

          case 'education':
            if (education.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Education</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="mb-2 flex justify-between">
                    <div>
                      <span className="font-semibold">{edu.degree}</span>
                      <span className="text-gray-500"> in {edu.field}, {edu.institution}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{formatDate(edu.endDate)}</span>
                  </div>
                ))}
              </div>
            );

          case 'skills':
            if (skills.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Skills</h2>
                <p className="text-gray-600">{skills.map(s => s.name).filter(Boolean).join(', ')}</p>
              </div>
            );

          case 'projects':
            if (projects.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Projects</h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="mb-3">
                    <div className="font-semibold">{proj.name}</div>
                    {proj.technologies.length > 0 && (
                      <div className="text-gray-400 text-sm">{proj.technologies.join(', ')}</div>
                    )}
                    {proj.bullets.length > 0 && (
                      <ul className="mt-1 text-gray-600 space-y-1">
                        {proj.bullets.filter(Boolean).map((bullet, i) => (
                          <li key={i}>— {bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            );

          case 'certifications':
            if (certifications.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Certifications</h2>
                {certifications.map((cert) => (
                  <div key={cert.id} className="mb-1 flex justify-between">
                    <span>{cert.name} <span className="text-gray-400">— {cert.issuer}</span></span>
                    {cert.issueDate && <span className="text-gray-400 text-sm">{formatDate(cert.issueDate)}</span>}
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
