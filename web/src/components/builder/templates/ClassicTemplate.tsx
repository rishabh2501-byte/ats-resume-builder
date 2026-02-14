import { Resume } from '@/store/resumeStore';

interface TemplateProps {
  resume: Resume;
}

export default function ClassicTemplate({ resume }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications, sections } = resume;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white text-black p-8 min-h-[1000px] font-serif text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div className="text-sm mt-2 text-gray-700">
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
        </div>
        {(personalInfo.linkedIn || personalInfo.github) && (
          <div className="text-sm mt-1 text-blue-700">
            {[personalInfo.linkedIn, personalInfo.github, personalInfo.portfolio].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {sortedSections.filter(s => s.visible).map((section) => {
        switch (section.type) {
          case 'summary':
            if (!personalInfo.summary) return null;
            return (
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Professional Summary</h2>
                <p className="text-justify">{personalInfo.summary}</p>
              </div>
            );

          case 'experience':
            if (experience.length === 0) return null;
            return (
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Professional Experience</h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{exp.position}</h3>
                      <span className="text-sm italic">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <p className="italic text-gray-700">{exp.company}{exp.location && `, ${exp.location}`}</p>
                    {exp.bullets.length > 0 && (
                      <ul className="list-disc ml-5 mt-1">
                        {exp.bullets.filter(Boolean).map((bullet, i) => (
                          <li key={i}>{bullet}</li>
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
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Education</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                      <span className="text-sm italic">{formatDate(edu.endDate)}</span>
                    </div>
                    <p className="italic text-gray-700">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            );

          case 'skills':
            if (skills.length === 0) return null;
            return (
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Skills</h2>
                <p>{skills.map(s => s.name).filter(Boolean).join(' • ')}</p>
              </div>
            );

          case 'projects':
            if (projects.length === 0) return null;
            return (
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Projects</h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="mb-2">
                    <h3 className="font-bold">{proj.name}</h3>
                    {proj.technologies.length > 0 && (
                      <p className="text-sm italic text-gray-600">{proj.technologies.join(', ')}</p>
                    )}
                    {proj.bullets.length > 0 && (
                      <ul className="list-disc ml-5 mt-1">
                        {proj.bullets.filter(Boolean).map((bullet, i) => (
                          <li key={i}>{bullet}</li>
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
              <div key={section.id} className="mb-4">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Certifications</h2>
                {certifications.map((cert) => (
                  <div key={cert.id} className="mb-1">
                    <span className="font-bold">{cert.name}</span>
                    <span className="text-gray-600"> - {cert.issuer}</span>
                    {cert.issueDate && <span className="text-sm italic"> ({formatDate(cert.issueDate)})</span>}
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
