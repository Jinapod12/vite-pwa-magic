import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import InstallPWA from '@/components/InstallPWA';
import PWAFeatures from '@/components/PWAFeatures';
import { Sparkles, Globe, Rocket } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm bg-gradient-primary text-primary-foreground"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Progressive Web App
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 animate-float">
            PWA Experience
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Modern, fast, and reliable web application that works everywhere. 
            Install it on your device for the best experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Rocket className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="border-primary/20">
              <Globe className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>

        {/* PWA Status Card */}
        <Card className="max-w-2xl mx-auto mb-16 bg-gradient-card border-primary/20 shadow-elevation">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Ready for Installation</h3>
            <p className="text-muted-foreground mb-4">
              This app is fully optimized as a Progressive Web App. Install it for offline access, 
              push notifications, and native app-like experience.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="outline">Offline Ready</Badge>
              <Badge variant="outline">Installable</Badge>
              <Badge variant="outline">Fast Loading</Badge>
              <Badge variant="outline">Secure</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PWA Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of modern web technology with these built-in capabilities
          </p>
        </div>
        
        <PWAFeatures />
      </div>

      {/* Install PWA Banner */}
      <InstallPWA />
    </div>
  );
};

export default Index;
