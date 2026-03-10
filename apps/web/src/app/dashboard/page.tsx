'use client';

import Link from 'next/link';

// Placeholder dashboard — wire to /api/v1/applications
const mockApplications = [
  { id: '1', program: 'CalFresh', status: 'approved', renewalDue: '2026-10-01', benefit: '$535/month' },
  { id: '2', program: 'Medi-Cal', status: 'pending', renewalDue: null, benefit: 'Free coverage' },
  { id: '3', program: 'WIC', status: 'draft', renewalDue: null, benefit: '' },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
  pending:  { label: 'Pending Review', class: 'bg-yellow-100 text-yellow-700' },
  draft:    { label: 'Draft', class: 'bg-gray-100 text-gray-500' },
  denied:   { label: 'Denied', class: 'bg-red-100 text-red-700' },
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Benefits</h1>
        <Link href="/quiz" className="btn-secondary text-sm">
          + Add Program
        </Link>
      </div>

      <div className="space-y-4">
        {mockApplications.map((app) => (
          <div key={app.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{app.program}</p>
              {app.benefit && (
                <p className="text-sm font-medium text-green-600">{app.benefit}</p>
              )}
              {app.renewalDue && (
                <p className="mt-1 text-xs text-orange-600">⚠️ Renewal due {app.renewalDue}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[app.status].class}`}>
                {statusConfig[app.status].label}
              </span>
              <Link
                href={`/apply/${app.id}`}
                className="text-sm text-brand-600 hover:underline"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-blue-50 p-5">
        <p className="font-semibold text-blue-700">Upload Documents</p>
        <p className="mt-1 text-sm text-blue-600">Keep your documents ready for renewals and new applications.</p>
        <Link href="/dashboard/documents" className="btn-primary mt-3 inline-block text-sm">
          Manage Documents
        </Link>
      </div>
    </main>
  );
}
