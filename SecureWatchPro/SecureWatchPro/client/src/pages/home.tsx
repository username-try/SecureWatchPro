import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Monitor, Video, Check } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();

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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Device Role</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Set up your device as either a Monitor to view cameras or a Camera to stream video
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monitor Device Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                    <Monitor className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Monitor Device</h3>
                  <p className="text-slate-300 mb-6">
                    View and control cameras from this device. Perfect for security desks and control rooms.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Live camera feeds</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Motion detection alerts</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Camera management</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>20-character access code</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/monitor-setup')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Setup as Monitor
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Camera Device Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                    <Video className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Camera Device</h3>
                  <p className="text-slate-300 mb-6">
                    Stream video to a monitor device. Use phones, tablets, or webcams as surveillance cameras.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Live video streaming</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Motion detection</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Night vision mode</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Check className="text-green-400 w-4 h-4 mr-3" />
                      <span>Access code pairing</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/camera-setup')}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Setup as Camera
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
