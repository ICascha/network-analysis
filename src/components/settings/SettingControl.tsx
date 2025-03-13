// src/components/settings/SettingControl.tsx
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SETTING_OPTIONS, type ModelSettings } from '@/types/settings';

interface SettingControlProps<T extends keyof typeof SETTING_OPTIONS> {
  settingKey: T;
  value: ModelSettings[T];
  onChange: (value: ModelSettings[T]) => void;
}

export const SettingControl = <T extends keyof typeof SETTING_OPTIONS>({
  settingKey,
  value,
  onChange
}: SettingControlProps<T>) => {
  // Helper function to render the appropriate control
  const renderControl = () => {
    switch (settingKey) {
      case 'productivity':
        return (
          <div className="space-y-2">
            <Slider
              value={[value as number * 100]} // Convert to percentage for slider
              step={50}
              min={50}
              max={150}
              onValueChange={([val]) => onChange((val / 100) as ModelSettings[T])}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0.5%</span>
              <span>1.0%</span>
              <span>1.5%</span>
            </div>
          </div>
        );

      case 'steering':
        return (
          <Switch
            checked={value === 'with'}
            onCheckedChange={(checked) => 
              onChange((checked ? 'with' : 'without') as ModelSettings[T])
            }
          />
        );

      default:
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => onChange(val as ModelSettings[T])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Kies ${getSettingLabel(settingKey)}`} />
            </SelectTrigger>
            <SelectContent>
              {SETTING_OPTIONS[settingKey].map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className={`flex ${settingKey === 'steering' ? 'justify-between items-center' : 'flex-col gap-2'}`}>
        <Label className="text-base font-semibold">
          {getSettingLabel(settingKey)}
        </Label>
        {renderControl()}
      </div>
    </div>
  );
};

// Helper function to get human readable labels for setting keys
function getSettingLabel(key: keyof typeof SETTING_OPTIONS): string {
  switch (key) {
    case 'productivity':
      return 'Productiviteitsgroei';
    case 'steering':
      return 'Overheidssturing';
    case 'workHours':
      return 'Doelgroep uren';
    case 'jobPriority':
      return 'Baanprioriteit';
    case 'nonSourceJobs':
      return 'Non-source banen';
  }
}