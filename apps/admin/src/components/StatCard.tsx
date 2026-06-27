import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
}

export default function StatCard({ icon: Icon, value, label, iconColor = 'text-primary', badge, badgeColor = 'bg-orange-100 text-orange-800' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#EEEEEE] p-6 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
          {badge && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
          )}
        </div>
        <p className="text-sm text-[#757575] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
