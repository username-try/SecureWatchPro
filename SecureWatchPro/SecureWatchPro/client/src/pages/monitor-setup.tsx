import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Monitor, Copy, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function MonitorSetup() {
  const [, navigate] = useLocation();
  const [monitorName, setMonitorName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Generate access code on component mount
  React.useEffect(() => {
    generateAccessCode();
  }, []);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessCode(result);
  };

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast({
        title: "Access code copied",
        description: "The access code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy access code. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const handleStartMonitoring = async () => {
    if (!monitorName.trim()) {
      toast({
        title: "Monitor name required",
        description: "Please enter a name for your monitor.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/monitors', {
        name: monitorName,
        accessCode,
      });
      
      const monitor = await response.json();
      
      // Store monitor info in localStorage for the dashboard
      localStorage.setItem('currentMonitor', JSON.stringify(monitor));
      
      toast({
        title: "Monitor created",
        description: "Your monitor has been set up successfully.",
      });
      
      navigate('/monitor-dashboard');
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Failed to create monitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SecureWatch Pro</h1>
              <p className="text-slate-300 text-sm">Professional Surveillance System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Monitor className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Monitor Setup</h2>
                <p className="text-slate-300">Your unique access code has been generated</p>
              </div>
              
              {/* Access Code Display */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
                <Label className="block text-sm font-medium text-slate-300 mb-3">
                  Your Access Code
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    value={accessCode}
                    className="flex-1 bg-slate-700/50 text-white text-lg font-mono border-slate-600 focus:border-blue-500"
                    readOnly
                  />
                  <Button
                    onClick={copyAccessCode}
                    variant="outline"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Share this code with camera devices to establish connection
                </p>
              </div>
              
              {/* Monitor Name Input */}
              <div className="mb-8">
                <Label htmlFor="monitorName" className="block text-sm font-medium text-slate-300 mb-3">
                  Monitor Name
                </Label>
                <Input
                  id="monitorName"
                  type="text"
                  placeholder="Enter monitor name (e.g., Security Desk 1)"
                  value={monitorName}
                  onChange={(e) => setMonitorName(e.target.value)}
                  className="bg-slate-700/50 text-white border-slate-600 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleStartMonitoring}
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isCreating ? 'Creating...' : 'Start Monitoring'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
