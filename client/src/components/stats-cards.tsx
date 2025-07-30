import { Building, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "@/lib/vendor-api";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: vendorApi.getStats,
  });

  const statsConfig = [
    {
      label: "Total Vendors",
      value: stats?.totalVendors || 0,
      icon: Building,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Signed BAAs",
      value: stats?.signedBAAs || 0,
      icon: CheckCircle,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pending",
      value: stats?.pendingBAAs || 0,
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Expiring Soon",
      value: stats?.expiringSoon || 0,
      icon: AlertTriangle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-slate-200 rounded-lg w-10 h-10"></div>
                <div className="ml-4">
                  <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`${stat.iconColor} h-5 w-5`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
