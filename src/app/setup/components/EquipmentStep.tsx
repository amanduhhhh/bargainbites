'use client';

import { OnboardingData } from '../page';

interface EquipmentStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const equipmentCategories = {
  'Basic Cooking': [
    'Stovetop/range', 'Oven', 'Microwave', 'Toaster', 'Kettle'
  ],
  'Prep Tools': [
    'Knife set', 'Cutting board', 'Mixing bowls', 'Measuring cups/spoons', 'Can opener'
  ],
  'Cookware': [
    'Frying pan', 'Saucepan', 'Large pot', 'Baking sheet', 'Casserole dish'
  ],
  'Appliances': [
    'Blender', 'Food processor', 'Stand mixer', 'Slow cooker', 'Air fryer'
  ],
  'Storage': [
    'Tupperware/containers', 'Freezer bags', 'Aluminum foil', 'Plastic wrap'
  ]
};

export default function EquipmentStep({ data, updateData }: EquipmentStepProps) {
  const handleEquipmentToggle = (equipment: string) => {
    const currentEquipment = data.equipment;
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
    
    updateData({ equipment: updatedEquipment });
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">What cooking equipment do you have?</h2>
      <p className="text-sm text-black/60 mb-6">
        Select the equipment you have available. This helps us suggest recipes you can actually make with your setup.
      </p>
      
      <div className="space-y-4">
        {Object.entries(equipmentCategories).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-medium text-sm mb-2 text-black/80">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleEquipmentToggle(item)}
                  className={`p-3 rounded-lg text-left text-sm transition-colors ${
                    data.equipment.includes(item)
                      ? 'bg-foreground text-background'
                      : 'bg-black/5 hover:bg-black/10 border border-black/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.equipment.length > 0 && (
        <div className="mt-6 p-4 bg-black/5 rounded-lg">
          <div className="text-sm font-medium mb-2">Selected equipment ({data.equipment.length} items):</div>
          <div className="flex flex-wrap gap-2">
            {data.equipment.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 bg-foreground text-background text-xs rounded-full"
              >
                {item}
                <button
                  onClick={() => handleEquipmentToggle(item)}
                  className="hover:opacity-70 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

     
    </div>
  );
}
