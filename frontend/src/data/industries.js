export const INDUSTRIES = [
  {
    id: 'finance',
    icon: '💰',
    name: 'Finance & Accounting',
    description:
      'Banking, corporate finance, insurance, and accounting roles from analyst to senior leadership.',
    roles: ['Financial Analyst', 'Accountant', 'Commercial Insurance Adviser'],
    keywords: ['finance', 'financial', 'accountant', 'accounting', 'insurance', 'commercial', 'analyst'],
  },
  {
    id: 'hr',
    icon: '👥',
    name: 'Human Resources',
    description:
      'HR business partners, generalists, and people leaders supporting organisations across South Africa.',
    roles: ['HR Manager', 'HR Business Partner', 'OD Specialist'],
    keywords: ['hr', 'human capital', 'human resources', 'business partner', 'od specialist', 'reward'],
  },
  {
    id: 'payroll',
    icon: '📋',
    name: 'Payroll & Compliance',
    description:
      'Payroll specialists, compliance officers, and governance professionals in regulated industries.',
    roles: ['Payroll Supervisor', 'Compliance Manager', 'Reward Specialist'],
    keywords: ['payroll', 'compliance', 'reward', 'hris', 'governance'],
  },
  {
    id: 'operations',
    icon: '⚙️',
    name: 'Operations & Supply Chain',
    description:
      'Operations managers, supply chain leads, and key account roles driving business performance.',
    roles: ['Key Account Manager', 'Operations Manager', 'Supply Chain Lead'],
    keywords: ['operations', 'supply chain', 'account manager', 'logistics'],
  },
  {
    id: 'it',
    icon: '💻',
    name: 'Information Technology',
    description:
      'Developers, analysts, and UX professionals building digital products and data solutions.',
    roles: ['UI/UX Designer', 'Business Intelligence Analyst', 'IT Specialist'],
    keywords: ['it', 'technology', 'developer', 'ux', 'ui', 'intelligence', 'analyst', 'digital'],
  },
  {
    id: 'executive',
    icon: '🏢',
    name: 'Executive & Management',
    description:
      'Senior managers and executives leading teams, strategy, and organisational growth.',
    roles: ['General Manager', 'Department Head', 'Senior Manager'],
    keywords: ['manager', 'executive', 'director', 'head', 'lead', 'supervisor', 'senior'],
  },
]

export function getIndustryById(id) {
  return INDUSTRIES.find((ind) => ind.id === id)
}

export function countJobsForIndustry(jobs, industry) {
  if (!industry?.keywords?.length) return 0
  return jobs.filter((job) => {
    const title = (job.title || '').toLowerCase()
    return industry.keywords.some((kw) => title.includes(kw.toLowerCase()))
  }).length
}

export function filterJobsByIndustry(jobs, industryId) {
  const industry = getIndustryById(industryId)
  if (!industry) return jobs
  return jobs.filter((job) => {
    const title = (job.title || '').toLowerCase()
    return industry.keywords.some((kw) => title.includes(kw.toLowerCase()))
  })
}

export function filterJobsBySearch(jobs, query) {
  const q = query.trim().toLowerCase()
  if (!q) return jobs
  return jobs.filter((j) => j.title.toLowerCase().includes(q))
}
