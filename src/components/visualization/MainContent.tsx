import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelSettings } from '@/types/settings';
import GraphChart from './GraphChart';

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ChartCard = ({
  title,
  description,
  children
}: ChartCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-96">
        {children}
      </div>
    </CardContent>
  </Card>
);

interface MainContentProps {
  settings: ModelSettings;
}

export const MainContent = ({ settings }: MainContentProps) => {
  return (
    <div className="p-4">
      <div className="space-y-8">
        <ChartCard
          title="Network Graph"
          description="A simple visualization of network connections"
        >
          <GraphChart />
        </ChartCard>
      </div>
    </div>
  );
};

export default MainContent;