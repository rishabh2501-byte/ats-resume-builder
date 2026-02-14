import { Resume } from '@/store/resumeStore';

interface TemplateProps {
  resume: Resume;
}

export default function ModernTemplate({ resume }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications, sections } = resume;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white text-gray-800 min-h-[1000px] font-sans text-sm">
      {/* Header with accent color */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div className="mt-2 flex flex-wrap gap-4 text-blue-100 text-sm">
          {personalInfo.email && <span>📧 {personalInfo.email}</span>}
          {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedIn || personalInfo.github) && (
          <div className="mt-1 flex flex-wrap gap-4 text-blue-100 text-sm">
            {personalInfo.linkedIn && <span>💼 {personalInfo.linkedIn}</span>}
            {personalInfo.github && <span>💻 {personalInfo.github}</span>}
          </div>
        )}
      </div>

      <div className="p-6">
        {sortedSections.filter(s => s.visible).map((section) => {
          switch (section.type) {
            case 'summary':
              if (!personalInfo.summary) return null;
              return (
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-2 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    ABOUT ME
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{personalInfo.summary}</p>
                </div>
              );

            case 'experience':
              if (experience.length === 0) return null;
              return (
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    EXPERIENCE
                  </h2>
                  {experience.map((exp) => (
                    <div key={exp.id} className="mb-4 pl-4 border-l-2 border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{exp.position}</h3>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.filter(Boolean).map((bullet, i) => (
                            <li key={i} className="text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">▸</span>
                              {bullet}
                            </li>
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
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    EDUCATION
                  </h2>
                  {education.map((edu) => (
                    <div key={edu.id} className="mb-3 pl-4 border-l-2 border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                          <p className="text-blue-600">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(edu.endDate)}</span>
                      </div>
                      {edu.gpa && <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              );

            case 'skills':
              if (skills.length === 0) return null;
              return (
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    SKILLS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );

            case 'projects':
              if (projects.length === 0) return null;
              return (
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    PROJECTS
                  </h2>
                  {projects.map((proj) => (
                    <div key={proj.id} className="mb-3 pl-4 border-l-2 border-blue-200">
                      <h3 className="font-bold">{proj.name}</h3>
                      {proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.technologies.map((tech, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {proj.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {proj.bullets.filter(Boolean).map((bullet, i) => (
                            <li key={i} className="text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">▸</span>
                              {bullet}
                            </li>
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
                <div key={section.id} className="mb-5">
                  <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-blue-600"></span>
                    CERTIFICATIONS
                  </h2>
                  <div className="space-y-2">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{cert.name}</span>
                          <span className="text-gray-500"> • {cert.issuer}</span>
                        </div>
                        {cert.issueDate && (
                          <span className="text-sm text-gray-500">{formatDate(cert.issueDate)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
