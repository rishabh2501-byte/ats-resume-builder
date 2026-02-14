import { Resume } from '@/store/resumeStore';

interface TemplateProps {
  resume: Resume;
}

export default function CreativeTemplate({ resume }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications, sections } = resume;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 text-gray-800 min-h-[1000px] font-sans text-sm p-8">
      {/* Creative Header */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mt-2"></div>
        </div>
        <div className="mt-4 flex justify-center flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">@</span>
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">☎</span>
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">📍</span>
              {personalInfo.location}
            </span>
          )}
        </div>
      </div>

      {sortedSections.filter(s => s.visible).map((section) => {
        switch (section.type) {
          case 'summary':
            if (!personalInfo.summary) return null;
            return (
              <div key={section.id} className="mb-6 bg-white rounded-xl p-5 shadow-sm">
                <p className="text-gray-600 text-center italic leading-relaxed">"{personalInfo.summary}"</p>
              </div>
            );

          case 'experience':
            if (experience.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">💼</span>
                  Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{exp.position}</h3>
                          <p className="text-purple-600 font-medium">{exp.company}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {exp.bullets.filter(Boolean).map((bullet, i) => (
                            <li key={i} className="text-gray-600 flex items-start gap-2">
                              <span className="text-pink-500 mt-1">✦</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'skills':
            if (skills.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center">⚡</span>
                  Skills
                </h2>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span 
                        key={skill.id} 
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          i % 3 === 0 ? 'bg-purple-100 text-purple-700' :
                          i % 3 === 1 ? 'bg-pink-100 text-pink-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );

          case 'education':
            if (education.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">🎓</span>
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{edu.degree} in {edu.field}</h3>
                          <p className="text-indigo-600">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(edu.endDate)}</span>
                      </div>
                      {edu.gpa && <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'projects':
            if (projects.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">🚀</span>
                  Projects
                </h2>
                <div className="grid gap-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className="bg-white rounded-xl p-5 shadow-sm">
                      <h3 className="font-bold text-lg text-gray-800">{proj.name}</h3>
                      {proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.technologies.map((tech, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {proj.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {proj.bullets.filter(Boolean).map((bullet, i) => (
                            <li key={i} className="text-gray-600 flex items-start gap-2">
                              <span className="text-purple-500">→</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'certifications':
            if (certifications.length === 0) return null;
            return (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center">🏆</span>
                  Certifications
                </h2>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="space-y-3">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
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
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
