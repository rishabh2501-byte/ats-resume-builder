import { Resume } from '@/store/resumeStore';

interface TemplateProps {
  resume: Resume;
}

export default function ProfessionalTemplate({ resume }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications, sections } = resume;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="bg-white text-gray-800 min-h-[1000px] font-sans text-sm">
      {/* Two-column layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-800 text-white p-6 min-h-[1000px]">
          {/* Name */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{personalInfo.firstName}</h1>
            <h1 className="text-2xl font-light">{personalInfo.lastName}</h1>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Contact</h2>
            <div className="space-y-2 text-sm">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">✉</span>
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">☎</span>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">⌂</span>
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedIn && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">in</span>
                  <span className="break-all text-xs">{personalInfo.linkedIn}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">⌘</span>
                  <span className="break-all text-xs">{personalInfo.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills in sidebar */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Skills</h2>
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="mb-3">
                  <h3 className="text-xs uppercase text-slate-500 mb-1">{category}</h3>
                  <div className="flex flex-wrap gap-1">
                    {categorySkills.filter(Boolean).map((skill, i) => (
                      <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications in sidebar */}
          {certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Certifications</h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-2">
                  <div className="font-medium text-sm">{cert.name}</div>
                  <div className="text-xs text-slate-400">{cert.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-6">
          {sortedSections.filter(s => s.visible).map((section) => {
            switch (section.type) {
              case 'summary':
                if (!personalInfo.summary) return null;
                return (
                  <div key={section.id} className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                      PROFESSIONAL PROFILE
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{personalInfo.summary}</p>
                  </div>
                );

              case 'experience':
                if (experience.length === 0) return null;
                return (
                  <div key={section.id} className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                      WORK EXPERIENCE
                    </h2>
                    {experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800">{exp.position}</h3>
                            <p className="text-slate-600 font-medium">{exp.company}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                            {exp.location && <div>{exp.location}</div>}
                          </div>
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.bullets.filter(Boolean).map((bullet, i) => (
                              <li key={i} className="text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
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
                  <div key={section.id} className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                      EDUCATION
                    </h2>
                    {education.map((edu) => (
                      <div key={edu.id} className="mb-3 flex justify-between">
                        <div>
                          <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                          <p className="text-slate-600">{edu.institution}</p>
                          {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                );

              case 'projects':
                if (projects.length === 0) return null;
                return (
                  <div key={section.id} className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                      PROJECTS
                    </h2>
                    {projects.map((proj) => (
                      <div key={proj.id} className="mb-3">
                        <h3 className="font-bold">{proj.name}</h3>
                        {proj.technologies.length > 0 && (
                          <p className="text-sm text-slate-500">{proj.technologies.join(' | ')}</p>
                        )}
                        {proj.bullets.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {proj.bullets.filter(Boolean).map((bullet, i) => (
                              <li key={i} className="text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
