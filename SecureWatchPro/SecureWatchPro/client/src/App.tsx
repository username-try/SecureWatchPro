import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import MonitorSetup from "@/pages/monitor-setup";
import CameraSetup from "@/pages/camera-setup";
import MonitorDashboard from "@/pages/monitor-dashboard";
import CameraView from "@/pages/camera-view";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/monitor-setup" component={MonitorSetup} />
      <Route path="/camera-setup" component={CameraSetup} />
      <Route path="/monitor-dashboard" component={MonitorDashboard} />
      <Route path="/camera-view" component={CameraView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
