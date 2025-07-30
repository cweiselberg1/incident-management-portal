import { Building, FileText, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = "vendors" }: SidebarProps) {
  const [location] = useLocation();
  
  const menuItems = [
    {
      id: "vendors",
      label: "Vendor Management",
      icon: Building,
      href: "/",
    },
    {
      id: "agreements",
      label: "Agreements",
      icon: FileText,
      href: "/agreements",
    },
    {
      id: "risk",
      label: "Risk Analysis",
      icon: BarChart3,
      href: "/risk",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">One Guy Consulting</h1>
        <p className="text-sm text-slate-500 mt-1">Vendor Management</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (location === "/" && item.id === "vendors");
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
