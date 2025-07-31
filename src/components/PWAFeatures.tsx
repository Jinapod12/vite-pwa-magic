import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Download, Bell, Zap, Shield, Smartphone } from 'lucide-react';

const PWAFeatures = () => {
  const features = [
    {
      icon: Wifi,
      title: 'Offline Support',
      description: 'Works even without internet connection',
      status: 'Active'
    },
    {
      icon: Download,
      title: 'Installable',
      description: 'Install directly to your device',
      status: 'Ready'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Stay updated with real-time alerts',
      status: 'Available'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Optimized performance and caching',
      status: 'Optimized'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'HTTPS and modern web security',
      status: 'Protected'
    },
    {
      icon: Smartphone,
      title: 'Native-like',
      description: 'App-like experience on all devices',
      status: 'Enhanced'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card 
            key={index} 
            className="group hover:shadow-glow transition-all duration-500 bg-gradient-card border-primary/10 animate-float"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PWAFeatures;