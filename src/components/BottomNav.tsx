import { Home, Package, Monitor, Calendar, ShoppingCart, BarChart3 } from "lucide-react";

interface BottomNavProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Главная" },
    { id: "installations", icon: Package, label: "Установки" },
    { id: "equipment", icon: Monitor, label: "Оборудование" },
    { id: "events", icon: Calendar, label: "События" },
    { id: "consumables", icon: ShoppingCart, label: "Расходники" },
    { id: "statistics", icon: BarChart3, label: "Статистика" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-[600px] items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
