import { Card, CardContent } from '@/components/ui/card';
import { PenTool, Cloud, Lock } from 'lucide-react';

export function FeatureOverview() {
  const features = [
    {
      icon: PenTool,
      title: 'Canvas Entropy',
      description: 'Drawn input adds unpredictable entropy'
    },
    {
      icon: Cloud,
      title: 'Weather Integration',
      description: 'Live weather adds external randomness'
    },
    {
      icon: Lock,
      title: 'Secure Hashing',
      description: 'Passwords are hashed using SHA-256'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="bg-slate-800 border border-slate-700 hover:shadow-lg hover:shadow-slate-900/20 transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-slate-300">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}