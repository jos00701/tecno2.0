import { Zap, Droplet, Hammer, Wind, Paintbrush, Wrench } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'Todos', icon: null },
  { id: 'electricista', label: 'Electricista', icon: Zap },
  { id: 'plomero', label: 'Plomero', icon: Droplet },
  { id: 'carpintero', label: 'Carpintero', icon: Hammer },
  { id: 'hvac', label: 'Climatización', icon: Wind },
  { id: 'pintor', label: 'Pintor', icon: Paintbrush },
  { id: 'mecanico', label: 'Mecánico', icon: Wrench },
];

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
