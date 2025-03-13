import { SettingControl } from './SettingControl';
import type { ModelSettings } from '@/types/settings';
import {SETTING_OPTIONS} from '@/types/settings';

interface SettingsPanelProps {
  settings: ModelSettings;
  onSettingChange: <K extends keyof ModelSettings>(
    key: K,
    value: ModelSettings[K]
  ) => void;
}

export const SettingsPanel = ({ settings, onSettingChange }: SettingsPanelProps) => {
  return (
    <div className="space-y-6">
      {(Object.keys(SETTING_OPTIONS) as Array<keyof typeof SETTING_OPTIONS>).map((key) => (
        <SettingControl
          key={key}
          settingKey={key}
          value={settings[key]}
          onChange={(value) => onSettingChange(key, value)}
        />
      ))}
    </div>
  );
};